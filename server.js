// server.js - Node + Express + mysql2 (CommonJS)
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// === CONFIG DB - ajuste se necessário ===
const DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'console',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
(async function initPool(){
  try {
    pool = await mysql.createPool(DB_CONFIG);
    console.log('✅ MySQL pool created.');
  } catch (err) {
    console.error('Failed to create pool:', err);
    process.exit(1);
  }
})();

// === Helpers ===
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${hash}$${salt}`;
}

function verifyPassword(stored, password) {
  if (!stored || stored.indexOf('$') === -1) return false;
  const [hash, salt] = stored.split('$');
  const check = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return check === hash;
}

async function ensureUsersTable() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users");
    return cols.map(c => c.Field);
  } catch (err) {
    console.warn("users table not found or error reading columns:", err.message);
    return null;
  }
}

// === ROUTES ===

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success:false, error:'Campos faltando' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (!rows || rows.length === 0) return res.status(401).json({ success:false, error:'Usuário não encontrado' });

    const user = rows[0];
    if (user.expiration && new Date(user.expiration) < new Date()) {
      return res.status(403).json({ success:false, error:'Conta expirada' });
    }
    if (!verifyPassword(user.password_hash, password)) {
      return res.status(401).json({ success:false, error:'Senha incorreta' });
    }

    return res.json({ success:true, isAdmin: !!user.is_admin, nome: user.nome, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success:false, error:'Erro interno' });
  }
});

// Create permanent user
app.post('/api/create_permanent', async (req, res) => {
  try {
    const { username, nome, password } = req.body;
    if (!username || !nome || !password) return res.status(400).json({ success:false, error:'Campos faltando' });

    const cols = await ensureUsersTable();
    if (!cols) return res.status(500).json({ success:false, error:'Tabela users não existe' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing && existing.length) return res.status(409).json({ success:false, error:'Username já existe' });

    const password_hash = hashPassword(password);
    const q = `INSERT INTO users (username, nome, password_hash, is_admin, expiration, status) VALUES (?, ?, ?, 0, NULL, 'ACTIVE')`;
    const [r] = await pool.execute(q, [username, nome, password_hash]);
    return res.json({ success:true, id: r.insertId });
  } catch (err) {
    console.error('create_permanent error:', err);
    return res.status(500).json({ success:false, error:'Erro interno' });
  }
});

// Create temporary user
app.post('/api/create_temporary', async (req, res) => {
  try {
    const { username, nome, password, hours } = req.body;
    if (!username || !nome || !password || !hours) return res.status(400).json({ success:false, error:'Campos faltando' });

    const hrs = parseInt(hours, 10);
    if (isNaN(hrs) || hrs <= 0) return res.status(400).json({ success:false, error:'Horas inválidas' });

    const cols = await ensureUsersTable();
    if (!cols) return res.status(500).json({ success:false, error:'Tabela users não existe' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing && existing.length) return res.status(409).json({ success:false, error:'Username já existe' });

    const password_hash = hashPassword(password);
    const q = `INSERT INTO users (username, nome, password_hash, is_admin, expiration, status) VALUES (?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL ? HOUR), 'ACTIVE')`;
    const [r] = await pool.execute(q, [username, nome, password_hash, hrs]);
    return res.json({ success:true, id: r.insertId });
  } catch (err) {
    console.error('create_temporary error:', err);
    return res.status(500).json({ success:false, error:'Erro interno' });
  }
});

// Get users (tolerant select)
app.post('/api/get_users', async (req, res) => {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM users');
    const colNames = cols.map(c => c.Field);
    const wanted = ['id','username','nome','is_admin','status','expiration'];
    const select = wanted.filter(c => colNames.includes(c));
    let rows;
    if (select.length) {
      [rows] = await pool.query(`SELECT ${select.join(', ')} FROM users`);
    } else {
      [rows] = await pool.query(`SELECT * FROM users`);
    }
    return res.json(rows);
  } catch (err) {
    console.error('get_users error:', err);
    return res.status(500).json([]);
  }
});

// Search name
app.post('/api/search_name', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.json([]);
    const [rows] = await pool.execute(`SELECT * FROM people WHERE nome LIKE ? LIMIT 200`, [`%${name}%`]);
    return res.json(rows);
  } catch (err) {
    console.error('search_name error:', err);
    return res.status(500).json([]);
  }
});

// Search cpf
app.post('/api/search_cpf', async (req, res) => {
  try {
    const cpf = (req.body.cpf || '').trim();
    if (!cpf) return res.json(null);
    const [rows] = await pool.execute(`SELECT * FROM people WHERE cpf = ? LIMIT 1`, [cpf]);
    return res.json(rows[0] || null);
  } catch (err) {
    console.error('search_cpf error:', err);
    return res.status(500).json(null);
  }
});

// Serve frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
