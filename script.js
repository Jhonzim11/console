// script.js - frontend completo (login real, progress bar, admin protection)

// ====================== CLOCK ======================
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// ====================== MATRIX ======================
function initMatrix() {
    const matrix = document.getElementById('matrix');
    if (!matrix) return;
    const chars = "01";
    const fontSize = 14;
    const columns = Math.floor(window.innerWidth / fontSize);
    matrix.innerHTML = '';
    for (let i = 0; i < columns; i++) {
        const charSpan = document.createElement('span');
        charSpan.style.position = 'absolute';
        charSpan.style.top = '-20px';
        charSpan.style.left = (i * fontSize) + 'px';
        charSpan.style.fontSize = fontSize + 'px';
        charSpan.style.color = '#00ff00';
        charSpan.innerHTML = chars.charAt(Math.floor(Math.random() * chars.length));
        matrix.appendChild(charSpan);
        animateChar(charSpan);
    }
}
function animateChar(element) {
    let top = -20;
    const speed = 2 + Math.random() * 3;
    function move() {
        top += speed;
        element.style.top = top + 'px';
        if (top > window.innerHeight) top = -20;
        element.innerHTML = "01".charAt(Math.floor(Math.random() * 2));
        requestAnimationFrame(move);
    }
    move();
}

// ====================== TERMINAL HELPERS ======================
function addTerminalOutput(text) {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;
    terminal.innerHTML += `\n> ${text}`;
    terminal.scrollTop = terminal.scrollHeight;
}
const delay = ms => new Promise(r => setTimeout(r, ms));

// ====================== LOGIN ======================
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) return alert("Please fill in all fields");

    try {
        const resp = await fetch('/api/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (!data.success) return alert(data.error || "ACCESS DENIED");

        window.isAdmin = data.isAdmin;
        window.loggedUser = data.nome;

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainConsole').style.display = 'block';
        addTerminalOutput(`Welcome back, ${data.nome}!`);
        addTerminalOutput("Authentication successful...");
        addTerminalOutput("Loading system components...");
        setTimeout(()=>addTerminalOutput("System ready. Type 'help' for commands."), 1200);

        // ensure command input listens for Enter
        const cmdInput = document.getElementById('commandInput');
        if (cmdInput) {
            cmdInput.focus();
            // remove any duplicate listeners
            cmdInput.removeEventListener('keydown', handleCommand);
            cmdInput.addEventListener('keydown', handleCommand);
        }
    } catch (err) {
        console.error(err);
        alert("Server error during login.");
    }
}

// ====================== PROGRESS BAR ======================
async function animateProgressBar(duration = 2500) {
    const bar = document.querySelector('.loading-progress');
    if (!bar) return;
    bar.style.width = '0%';
    bar.style.transition = 'none';
    void bar.offsetWidth;
    bar.style.transition = `width ${duration}ms linear`;
    return new Promise(resolve=>{
        let progress = 0;
        const step = 100 / (duration / 50);
        const interval = setInterval(()=>{
            progress += step;
            if (progress >= 100) {
                progress = 100;
                bar.style.width = '100%';
                clearInterval(interval);
                setTimeout(resolve,300);
            } else {
                bar.style.width = `${progress}%`;
            }
        },50);
    });
}

// ====================== SEARCH FUNCTIONS ======================
async function realSearchName(name) {
    addTerminalOutput(`Searching for name: ${name}...`);
    await delay(400);
    addTerminalOutput(`Connecting to database...`);
    await animateProgressBar(2500);

    try {
        const resp = await fetch('/api/search_name',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
        const results = await resp.json();
        if (!Array.isArray(results) || results.length === 0) return addTerminalOutput("No records found.");

        addTerminalOutput(`\n--- RESULTS FOR "${name}" ---`);
        results.forEach(p=>{
            addTerminalOutput(`ID: ${p.id}`);
            addTerminalOutput(`Name: ${p.nome}`);
            addTerminalOutput(`CPF: ${p.cpf || "Sem informação"}`);
            addTerminalOutput(`Sexo: ${p.sexo || "-"}`);
            addTerminalOutput(`Nascimento: ${p.data_nascimento || "-"}`);
            addTerminalOutput(`Mãe: ${p.mae || "-"}`);
            addTerminalOutput(`Pai: ${p.pai || "-"}`);
            addTerminalOutput(`Parentes: ${p.parentes || "-"}`);
            addTerminalOutput(`Endereço: ${p.endereco || "-"}`);
            addTerminalOutput(`Telefone: ${p.telefone || "-"}`);
            addTerminalOutput("---");
        });
        addTerminalOutput("--- END OF RESULTS ---");
    } catch (err) {
        console.error(err);
        addTerminalOutput("Error retrieving data.");
    }
}

async function realSearchCpf(cpf) {
    addTerminalOutput(`Searching for CPF: ${cpf}...`);
    await delay(400);
    addTerminalOutput(`Connecting to database...`);
    await animateProgressBar(2500);

    try {
        const resp = await fetch('/api/search_cpf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cpf})});
        const person = await resp.json();
        if (!person) return addTerminalOutput("No record found.");

        addTerminalOutput("\n--- PERSONAL DATA ---");
        addTerminalOutput(`Name: ${person.nome}`);
        addTerminalOutput(`CPF: ${person.cpf}`);
        addTerminalOutput(`Gender: ${person.sexo || "-"}`);
        addTerminalOutput(`DOB: ${person.data_nascimento || "-"}`);
        addTerminalOutput(`Mother: ${person.mae || "-"}`);
        addTerminalOutput(`Father: ${person.pai || "-"}`);
        addTerminalOutput(`Relatives: ${person.parentes || "-"}`);
        addTerminalOutput(`Address: ${person.endereco || "-"}`);
        addTerminalOutput(`Phone: ${person.telefone || "-"}`);
        addTerminalOutput("--- END OF RECORD ---");
    } catch (err) {
        console.error(err);
        addTerminalOutput("Error retrieving CPF data.");
    }
}

// ====================== COMMAND HANDLER ======================
function handleCommand(e) {
    if (e.key !== 'Enter') return;
    const input = document.getElementById('commandInput');
    const raw = (input && input.value) ? input.value.trim() : '';
    if (input) input.value = '';
    if (!raw) return;
    const cmd = raw.toLowerCase();
    addTerminalOutput(`$ ${raw}`);

    if (cmd === 'help') {
        addTerminalOutput("Available commands:");
        addTerminalOutput("puxar <name> - Retrieve data by name");
        addTerminalOutput("cpf <number> - Retrieve data by CPF");
        addTerminalOutput("clear - Clear terminal");
        addTerminalOutput("exit - Logout");
        return;
    }
    if (cmd === 'clear') { document.getElementById('terminal').innerHTML = ''; return; }
    if (cmd === 'exit') { document.getElementById('mainConsole').style.display = 'none'; document.getElementById('loginScreen').style.display = 'block'; return; }
    if (cmd === 'admin') {
        if (!window.isAdmin) { addTerminalOutput("Access denied: admin privileges required."); return; }
        document.getElementById('mainConsole').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadUsers();
        return;
    }
    if (cmd.startsWith('puxar ')) { realSearchName(raw.substring(6).trim()); return; }
    if (cmd.startsWith('cpf ')) { realSearchCpf(raw.substring(4).trim()); return; }

    addTerminalOutput(`Command not recognized: ${raw}`);
}

// ====================== ADMIN PANEL ======================
async function loadUsers() {
    try {
        const resp = await fetch('/api/get_users',{method:'POST'});
        const users = await resp.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        if (!Array.isArray(users) || users.length === 0) { tbody.innerHTML = '<tr><td colspan="5">No users found.</td></tr>'; return; }
        users.forEach(u=>{
            const row = document.createElement('tr');
            row.innerHTML = `<td>${u.username}</td><td>${u.nome}</td><td>${u.is_admin? 'ADMIN' : (u.expiration? 'TEMPORARY':'PERMANENT')}</td><td>${u.status||'ACTIVE'}</td><td>${u.expiration||'N/A'}</td>`;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// ====================== ACCOUNT CREATION FUNCTIONS ======================
async function createPermanentAccount() {
    const username = document.getElementById('permUsername').value.trim();
    const nome = document.getElementById('permName').value.trim();
    const password = document.getElementById('permPassword').value;
    if (!username || !nome || !password) { alert("Please fill in all fields"); return; }
    try {
        const resp = await fetch('/api/create_permanent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,nome,password})});
        const data = await resp.json();
        if (data && data.success) {
            alert(`Permanent account created for: ${username}`);
            document.getElementById('permUsername').value=''; document.getElementById('permName').value=''; document.getElementById('permPassword').value='';
            loadUsers();
        } else alert(`Error creating account: ${data && data.error ? data.error : 'unknown'}`);
    } catch (err) { console.error(err); alert('Server error.'); }
}

async function createTemporaryAccount() {
    const username = document.getElementById('tempUsername').value.trim();
    const nome = document.getElementById('tempName').value.trim();
    const password = document.getElementById('tempPassword').value;
    const hours = document.getElementById('tempExpiration').value.trim();
    if (!username || !nome || !password || !hours) { alert("Please fill in all fields"); return; }
    const hrs = parseInt(hours,10);
    if (isNaN(hrs) || hrs <= 0) { alert('Expiration hours must be a positive integer.'); return; }
    try {
        const resp = await fetch('/api/create_temporary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,nome,password,hours:hrs})});
        const data = await resp.json();
        if (data && data.success) {
            alert(`Temporary account created for: ${username} (expires in ${hrs} hours)`);
            document.getElementById('tempUsername').value=''; document.getElementById('tempName').value=''; document.getElementById('tempPassword').value=''; document.getElementById('tempExpiration').value='24';
            loadUsers();
        } else alert(`Error creating temporary account: ${data && data.error ? data.error : 'unknown'}`);
    } catch (err) { console.error(err); alert('Server error.'); }
}

// ====================== INIT ======================
window.onload = () => {
    initMatrix();
    const cmdInput = document.getElementById('commandInput');
    if (cmdInput) {
        // ensure a single handler
        cmdInput.removeEventListener('keydown', handleCommand);
        cmdInput.addEventListener('keydown', handleCommand);
    }
};
