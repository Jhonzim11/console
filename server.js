// server.js - Node + Express + mysql2 (CommonJS) - Versão adaptada para Railway MySQL
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// === CONFIG DB (Railway) ===
// Railway fornece variáveis automaticamente: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
let pool;

(async function initPool() {
  try {
    pool = await mysql.createPool({
      host: process.env.MYSQLHOST || 'mysql.railway.internal',
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD || 'QrfYfImOmEnYVDCLexWpxlwnRNrFNkdM',
      database: process.env.MYSQLDATABASE || 'railway',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log('✅ Conectado ao banco MySQL (Railway).');
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
})();

// === Funções auxiliares ===
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
    const [cols] = await pool.query('SHOW COLUMNS FROM users');
    return cols.map((c) => c.Field);
  } catch (err) {
    console.warn('⚠️ Tabela users não encontrada ou erro ao ler colunas:', err.message);
    return null;
  }
}

// === ROTAS ===

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, error: 'Campos faltando' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (!rows || rows.length === 0)
      return res.status(401).json({ success: false, error: 'Usuário não encontrado' });

    const user = rows[0];
    if (user.expiration && new Date(user.expiration) < new Date()) {
      return res.status(403).json({ success: false, error: 'Conta expirada' });
    }
    if (!verifyPassword(user.password_hash, password)) {
      return res.status(401).json({ success: false, error: 'Senha incorreta' });
    }

    return res.json({
      success: true,
      isAdmin: !!user.is_admin,
      nome: user.nome,
      username: user.username,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Criar usuário permanente
app.post('/api/create_permanent', async (req, res) => {
  try {
    const { username, nome, password } = req.body;
    if (!username || !nome || !password)
      return res.status(400).json({ success: false, error: 'Campos faltando' });

    const cols = await ensureUsersTable();
    if (!cols) return res.status(500).json({ success: false, error: 'Tabela users não existe' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing && existing.length)
      return res.status(409).json({ success: false, error: 'Username já existe' });

    const password_hash = hashPassword(password);
    const q = `INSERT INTO users (username, nome, password_hash, is_admin, expiration, status)
               VALUES (?, ?, ?, 0, NULL, 'ACTIVE')`;
    const [r] = await pool.execute(q, [username, nome, password_hash]);
    return res.json({ success: true, id: r.insertId });
  } catch (err) {
    console.error('create_permanent error:', err);
    return res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Criar usuário temporário
app.post('/api/create_temporary', async (req, res) => {
  try {
    const { username, nome, password, hours } = req.body;
    if (!username || !nome || !password || !hours)
      return res.status(400).json({ success: false, error: 'Campos faltando' });

    const hrs = parseInt(hours, 10);
    if (isNaN(hrs) || hrs <= 0)
      return res.status(400).json({ success: false, error: 'Horas inválidas' });

    const cols = await ensureUsersTable();
    if (!cols) return res.status(500).json({ success: false, error: 'Tabela users não existe' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing && existing.length)
      return res.status(409).json({ success: false, error: 'Username já existe' });

    const password_hash = hashPassword(password);
    const q = `INSERT INTO users (username, nome, password_hash, is_admin, expiration, status)
               VALUES (?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL ? HOUR), 'ACTIVE')`;
    const [r] = await pool.execute(q, [username, nome, password_hash, hrs]);
    return res.json({ success: true, id: r.insertId });
  } catch (err) {
    console.error('create_temporary error:', err);
    return res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Listar usuários
app.post('/api/get_users', async (req, res) => {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM users');
    const colNames = cols.map((c) => c.Field);
    const wanted = ['id', 'username', 'nome', 'is_admin', 'status', 'expiration'];
    const select = wanted.filter((c) => colNames.includes(c));
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

// Buscar nome
app.post('/api/search_name', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.json([]);
    const [rows] = await pool.execute(
      'SELECT * FROM people WHERE nome LIKE ? LIMIT 200',
      [`%${name}%`]
    );
    return res.json(rows);
  } catch (err) {
    console.error('search_name error:', err);
    return res.status(500).json([]);
  }
});

// Buscar CPF
app.post('/api/search_cpf', async (req, res) => {
  try {
    const cpf = (req.body.cpf || '').trim();
    if (!cpf) return res.json(null);
    const [rows] = await pool.execute('SELECT * FROM people WHERE cpf = ? LIMIT 1', [cpf]);
    return res.json(rows[0] || null);
  } catch (err) {
    console.error('search_cpf error:', err);
    return res.status(500).json(null);
  }
});

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Porta dinâmica (Railway usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor rodando na porta ${PORT}`));
