const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const http = require('http');
const mime = require('mime');

const SESSIONS_DIR = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

async function startBot() {
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
      console.log('\n✅ WhatsApp Linked!');
      const credsPath = path.join(authDir, 'creds.json');
      const fileUrl = generateDownloadLink(credsPath, sessionId);
      console.log(`\nDownload Link:\npopkid~scl/fi/${fileUrl}`);
    }
  });
}

function generateDownloadLink(filePath, sessionId) {
  const randomKey = crypto.randomBytes(8).toString('hex');
  const link = `${sessionId}.json?rlkey=${randomKey}&dl=0`;

  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0].slice(1));
    const file = path.join(SESSIONS_DIR, url);
    if (fs.existsSync(file)) {
      const contentType = mime.getType(file) || 'application/json';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(404);
      res.end('File Not Found');
    }
  });

  server.listen(8080, () => {
    console.log(`\nServer running: http://localhost:8080/${link}`);
  });

  return link;
}

startBot();
