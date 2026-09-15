import http from 'node:http';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const port = Number(process.env.EMAIL_SERVER_PORT || 8787);
const from = process.env.SMTP_FROM || process.env.SMTP_USER;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !from) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) reject(new Error('Request body too large.'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON request.')); }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
    response.end();
    return;
  }

  if (request.method !== 'POST' || !['/api/email/welcome', '/api/email/reset'].includes(request.url)) {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  try {
    const data = await readJson(request);
    if (!data.recipientPersonalEmail) throw new Error('Recipient email is required.');

    const isWelcome = request.url.endsWith('/welcome');
    const subject = isWelcome
      ? `Welcome to ${data.companyName || 'Apex Technologies'} - Your Corporate Account`
      : `${data.companyName || 'Apex Technologies'} password reset code`;
    const text = isWelcome
      ? `Hello ${data.recipientName},\n\nYour corporate account is ready.\n\nCorporate email: ${data.officeEmail}\nTemporary password: ${data.tempPassword}\nLogin: ${data.loginUrl}\n\nYou must change this temporary password after your first login.`
      : `Hello ${data.recipientName},\n\nYour password reset code is ${data.resetCode}. It expires in 15 minutes.`;

    const info = await getTransporter().sendMail({ from, to: data.recipientPersonalEmail, subject, text });
    console.info(`[EmailServer] Sent ${request.url} to ${data.recipientPersonalEmail}: ${info.messageId}`);
    sendJson(response, 200, { success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[EmailServer] Delivery failed:', error.message);
    sendJson(response, 500, { error: error.message || 'SMTP delivery failed.' });
  }
});

server.listen(port, () => console.info(`[EmailServer] Listening on http://localhost:${port}`));
