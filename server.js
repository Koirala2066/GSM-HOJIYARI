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

// AI Chatbot endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const response = generateChatbotResponse(message);
  res.json({ response });
});

// Chatbot knowledge base
function generateChatbotResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  
  const responses = {
    // Company Info
    'company|about|who': 'GSM HOJIYARI UDHYOG .PVT.LTD is a premium manufacturer of high-quality woolen caps for winter and all-season socks. We are proud to produce authentic Nepal-made products using imported yarn from India and China.',
    'location|where|address': 'We are located at Sita Rice Mill, Butwal, Tilottama, Nepal. You can view our location on the map in the Contact section or call us at +977 9857013919.',
    'contact|phone|call|email|whatsapp': 'You can reach us at:\n📞 Phone: +977 9857013919\n💬 WhatsApp: https://wa.me/9779857013919\n📍 Visit our location in Butwal, Tilottama',
    'hours|operating|open': 'We operate 24/7 - Day and night continuous shifts. We are always ready to serve you!',
    'products|caps|socks|what': 'We manufacture:\n🧢 Woolen Winter Caps - Premium quality for maximum warmth and comfort\n🧦 All-Season Socks - Comfortable and durable for year-round wear',
    'workers|employees|staff': 'We have approximately 35-40 skilled workers ensuring high-quality production with hand-checked finishing and durable stitching.',
    'established|since|year': 'GSM HOJIYARI UDHYOG was established in 2021, and we have been committed to producing premium quality products.',
    'owner|founder': 'Our company is owned by Sesh Kant Koirala, who leads our vision of manufacturing premium Nepal-made products.',
    'quality|standard': 'We maintain high quality standards with:\n✓ Hand-checked finishing\n✓ Durable stitching\n✓ Premium imported yarn\n✓ Continuous production monitoring',
    'production|capacity|custom|bulk': 'We have daily manufacturing capacity tailored to orders. We accept both custom and bulk orders to meet your specific needs.',
    'help|assist|menu': 'I can help you with information about:\n• Our company and products\n• Location and contact details\n• Working hours and production capacity\n• Quality standards and specifications\nJust ask me!'
  };

  // Search for matching response
  for (const [key, value] of Object.entries(responses)) {
    const keywords = key.split('|');
    if (keywords.some(keyword => msg.includes(keyword))) {
      return value;
    }
  }

  // Default response
  return 'I\'m not sure about that. Here\'s what I can help with:\n• Company information\n• Products (caps & socks)\n• Location and contact\n• Working hours\n• Owner information\n• Quality standards\n\nWhat would you like to know?';
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// AI Chatbot endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const response = generateChatbotResponse(message);
  res.json({ response });
});

// Chatbot knowledge base
function generateChatbotResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  
  const responses = {
    // Company Info
    'company|about|who': 'GSM HOJIYARI UDHYOG .PVT.LTD is a premium manufacturer of high-quality woolen caps for winter and all-season socks. We are proud to produce authentic Nepal-made products using imported yarn from India and China.',
    'location|where|address': 'We are located at Sita Rice Mill, Butwal, Tilottama, Nepal. You can view our location on the map in the Contact section or call us at +977 9857013919.',
    'contact|phone|call|email|whatsapp': 'You can reach us at:\n📞 Phone: +977 9857013919\n💬 WhatsApp: https://wa.me/9779857013919\n📍 Visit our location in Butwal, Tilottama',
    'hours|operating|open': 'We operate 24/7 - Day and night continuous shifts. We are always ready to serve you!',
    'products|caps|socks|what': 'We manufacture:\n🧢 Woolen Winter Caps - Premium quality for maximum warmth and comfort\n🧦 All-Season Socks - Comfortable and durable for year-round wear',
    'workers|employees|staff': 'We have approximately 35-40 skilled workers ensuring high-quality production with hand-checked finishing and durable stitching.',
    'established|since|year': 'GSM HOJIYARI UDHYOG was established in 2021, and we have been committed to producing premium quality products.',
    'owner|founder': 'Our company is owned by Sesh Kant Koirala, who leads our vision of manufacturing premium Nepal-made products.',
    'quality|standard': 'We maintain high quality standards with:\n✓ Hand-checked finishing\n✓ Durable stitching\n✓ Premium imported yarn\n✓ Continuous production monitoring',
    'production|capacity|custom|bulk': 'We have daily manufacturing capacity tailored to orders. We accept both custom and bulk orders to meet your specific needs.',
    'help|assist|menu': 'I can help you with information about:\n• Our company and products\n• Location and contact details\n• Working hours and production capacity\n• Quality standards and specifications\nJust ask me!'
  };

  // Search for matching response
  for (const [key, value] of Object.entries(responses)) {
    const keywords = key.split('|');
    if (keywords.some(keyword => msg.includes(keyword))) {
      return value;
    }
  }

  // Default response
  return 'I\'m not sure about that. Here\'s what I can help with:\n• Company information\n• Products (caps & socks)\n• Location and contact\n• Working hours\n• Owner information\n• Quality standards\n\nWhat would you like to know?';
}
