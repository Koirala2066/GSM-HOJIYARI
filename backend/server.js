require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static website from the frontend folder.
const publicDir = path.join(__dirname, "..", "frontend");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Safety: never serve backend code, secrets, or dependencies to the public.
app.use((req, res, next) => {
  let requestPath = req.path;
  try {
    requestPath = decodeURIComponent(req.path);
  } catch (e) {
    return res.status(400).send("Bad request");
  }
  const blockedFolder = /^\/(backend|node_modules|\.git|\.vscode)(\/|$)/i;
  if (blockedFolder.test(requestPath)) {
    return res.status(404).send("Not found");
  }
  next();
});

// Serve static files (your site)
app.use(express.static(publicDir, { dotfiles: "deny" }));

// SMTP configuration (loaded from backend/.env)
let transporter = null;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const ownerEmail = process.env.OWNER_EMAIL;

if (smtpHost && smtpUser && smtpPass && ownerEmail) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  transporter
    .verify()
    .then(() => {
      console.log("SMTP transporter configured");
    })
    .catch((err) => {
      console.warn("SMTP transporter verification failed:", err.message);
      transporter = null;
    });
} else {
  console.log(
    "SMTP not fully configured — server will reject contact submissions until SMTP and OWNER_EMAIL are set.",
  );
}

// API endpoint to receive messages and email the owner
app.post("/api/message", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
  const message =
    typeof req.body.message === "string" ? req.body.message.trim() : "";

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }
  if (
    name.length > 150 ||
    email.length > 254 ||
    message.length > 10000 ||
    !/^\S+@\S+\.\S+$/.test(email)
  ) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Please provide valid contact details and a shorter message.",
      });
  }

  if (!transporter) {
    return res
      .status(500)
      .json({
        success: false,
        error:
          "SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS and OWNER_EMAIL.",
      });
  }

  const entryReceivedAt = new Date().toISOString();

  const mailOptions = {
    from: `Website contact <${smtpUser}>`,
    to: ownerEmail,
    replyTo: { name, address: email },
    subject: `New contact message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nReceived at: ${entryReceivedAt}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
           <p><strong>Email:</strong> ${escapeHtml(email)}</p>
           <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
           <p><small>Received at: ${entryReceivedAt}</small></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to owner for message from", name);
    return res.json({ success: true, emailed: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send email" });
  }
});

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

app.get("/api/health", (req, res) => {
  res.json({ emailConfigured: Boolean(transporter) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
