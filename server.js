const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const app = express();
const PORT = process.env.PORT || 8080;
const SESSIONS_DIR = path.join(__dirname, 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function generateCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit
}

app.post('/start-bot', async (req, res) => {
  const phone = req.body.phone || 'unknown';
  const code = generateCode();
  const sessionId = 'popkid-' + code;
  const authDir = path.join(SESSIONS_DIR, sessionId);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
      const fileUrl = `${req.protocol}://${req.get('host')}/sessions/${sessionId}/creds.json`;
      console.log(`\n[${phone}] Session created for code ${code}. Download: ${fileUrl}`);
    }
  });

  res.json({ message: 'Enter this code in your WhatsApp Linked Devices: ' + code });
});

app.get('/sessions/:sessionId/creds.json', (req, res) => {
  const file = path.join(SESSIONS_DIR, req.params.sessionId, 'creds.json');
  if (fs.existsSync(file)) {
    const contentType = mime.getType(file) || 'application/json';
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(file).pipe(res);
  } else {
    res.status(404).send('Session file not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
