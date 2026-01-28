const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (your site) from current directory
app.use(express.static(path.join(__dirname)));

// SMTP configuration (set via environment variables)
let transporter = null;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const ownerEmail = process.env.OWNER_EMAIL || process.env.OWNER || null;

if (smtpHost && smtpUser && smtpPass && ownerEmail) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort ? Number(smtpPort) : 587,
    secure: smtpPort == 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  transporter.verify().then(() => {
    console.log('SMTP transporter configured');
  }).catch(err => {
    console.warn('SMTP transporter verification failed:', err.message);
    transporter = null;
  });
} else {
  console.log('SMTP not fully configured — server will reject contact submissions until SMTP and OWNER_EMAIL are set.');
}

// API endpoint to receive messages and email owner (email-only, no local JSON backup)
app.post('/api/message', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  if (!transporter) {
    return res.status(500).json({ success: false, error: 'SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS and OWNER_EMAIL.' });
  }

  const entryReceivedAt = new Date().toISOString();

  const mailOptions = {
    from: smtpUser,
    to: ownerEmail,
    subject: `New contact message from ${name}`,
    text: `You have received a new message from ${name} <${email}>:\n\n${message}\n\nReceived at: ${entryReceivedAt}`,
    html: `<p>You have received a new message from <strong>${name}</strong> &lt;${email}&gt;:</p>
           <p>${message.replace(/\n/g, '<br>')}</p>
           <p><small>Received at: ${entryReceivedAt}</small></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent to owner for message from', name);
    return res.json({ success: true, emailed: true });
  } catch (err) {
    console.error('Failed to send email:', err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
