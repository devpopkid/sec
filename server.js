const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');

const app = express();
const PORT = process.env.PORT || 8080;
const SESSIONS_DIR = path.join(__dirname, 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/start-bot', async (req, res) => {
  const phone = req.body.phone;
  const sessionId = 'popkid-' + crypto.randomBytes(6).toString('hex');
  const authDir = path.join(SESSIONS_DIR, sessionId);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
      const fileUrl = `${req.protocol}://${req.get('host')}/sessions/${sessionId}/creds.json`;
      console.log(`\nSession Generated for ${phone}: ${fileUrl}`);
    }
  });

  res.json({ message: 'Session started. Please scan the QR code in terminal.' });
});

app.get('/sessions/:sessionId/creds.json', (req, res) => {
  const file = path.join(SESSIONS_DIR, req.params.sessionId, 'creds.json');
  if (fs.existsSync(file)) {
    const contentType = mime.getType(file) || 'application/json';
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(file).pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
