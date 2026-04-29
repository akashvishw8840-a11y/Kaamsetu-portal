/**
 * KaamSetu Local Server
 * Run: node server.js
 * Opens at: http://localhost:3000
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const PORT = 3000;
const ROOT = __dirname;

// ============================================================
//  GEMINI API KEY — yahan apni key daalo (ya env var use karo)
//  Free key: https://aistudio.google.com/app/apikey
// ============================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjnkOn4--SBqWM7WYMXrdzhCeD7Fu_oCk";

// ============================================================
//  EMAIL CONFIG — Login hone par data gauravavishwakarma8840@gmail.com pe aayega
//  Gmail App Password kaise banao:
//    1. Gmail → Settings → Security → 2-Step Verification ON karo
//    2. Security → App Passwords → "Mail" select → password copy karo
//    3. Neeche GMAIL_APP_PASSWORD mein paste karo
// ============================================================
const NOTIFY_EMAIL  = "gauravavishwakarma8840@gmail.com";
const GMAIL_SENDER  = process.env.GMAIL_SENDER  || "gauravavishwakarma8840@gmail.com";
const GMAIL_APP_PWD = process.env.GMAIL_APP_PWD || "YOUR_GMAIL_APP_PASSWORD";  // ← yahan daalo

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_SENDER, pass: GMAIL_APP_PWD }
});

// Audio recordings folder
const AUDIO_DIR = path.join(__dirname, "audio_recordings");
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

const FAST2SMS_KEY = process.env.FAST2SMS_KEY || "iXIpqYPFa5werXfgwTzR6svMHy83kH3YJ5fW8bZdWFVnh6Rjhtl3geFKC7FP";

// ============================================================
//  2FACTOR KEY — backup option (free, https://2factor.in)
// ============================================================
const TWOFACTOR_KEY = process.env.TWOFACTOR_KEY || "YOUR_2FACTOR_API_KEY";

// In-memory OTP session store  { phone -> { sessionId, expiresAt } }
const otpSessions = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const SYSTEM_PROMPT = `Aap KaamSetu ke AI assistant hain — ek rural job portal jo India ke gaon ke mazdooron aur employers ke liye bana hai. Aap Hindi, English aur Marathi mein jawab de sakte hain. Helpful, practical aur friendly rahein. Topics: kaam dhundhna, wages, MGNREGA, govt schemes, safety tips, resume banana, contractor fraud se bachna. Short aur clear answers do.`;

async function callGemini(messages) {
  if (!GEMINI_API_KEY) {
    return "Server mein GEMINI_API_KEY set nahi hai. Browser ke AI tab mein apni key daalo ya server.js mein GEMINI_API_KEY fill karo.";
  }
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  if (contents.length > 0) {
    contents[0].parts[0].text = SYSTEM_PROMPT + "\n\n" + contents[0].parts[0].text;
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Jawab nahi mila.";
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  // ---- /api/send-otp — Fast2SMS + 2Factor fallback ----
  if (req.url === "/api/send-otp" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { phone } = JSON.parse(body || "{}");
        if (!phone || !/^\d{10}$/.test(phone)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ return: false, message: "10 digit phone number daalo" }));
          return;
        }

        // Generate OTP locally
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        // Store with expiry
        otpSessions.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000, via: "local" });

        // === TRY 1: Fast2SMS (works when balance >= ₹100) ===
        try {
          const msg = encodeURIComponent("KaamSetu OTP: " + otp + ". Valid 10 min. Do not share.");
          const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=q&numbers=${phone}&message=${msg}&flash=0`;
          const r = await fetch(url);
          const d = await r.json();
          if (d.return === true) {
            console.log("✅ Fast2SMS OTP sent to", phone);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ return: true, message: "OTP bheja gaya (Fast2SMS)" }));
            return;
          }
          console.warn("Fast2SMS failed:", d.message, "— trying 2Factor");
        } catch (e) {
          console.warn("Fast2SMS error:", e.message, "— trying 2Factor");
        }

        // === TRY 2: 2Factor.in (free trial, koi recharge nahi chahiye) ===
        if (TWOFACTOR_KEY !== "YOUR_2FACTOR_API_KEY") {
          try {
            const url = `https://2factor.in/API/V1/${TWOFACTOR_KEY}/SMS/+91${phone}/${otp}`;
            const r = await fetch(url);
            const d = await r.json();
            if (d.Status === "Success") {
              console.log("✅ 2Factor OTP sent to", phone);
              otpSessions.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000, via: "2factor" });
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ return: true, message: "OTP bheja gaya (2Factor)" }));
              return;
            }
            console.warn("2Factor failed:", d.Details);
          } catch (e) {
            console.warn("2Factor error:", e.message);
          }
        }

        // === BOTH FAILED ===
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ return: false, message: "Fast2SMS: ₹100 balance chahiye. Ya 2Factor.in key add karo server.js mein." }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ return: false, message: e.message }));
      }
    });
    return;
  }

  // ---- /api/verify-otp — local OTP verify ----
  if (req.url === "/api/verify-otp" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { phone, otp } = JSON.parse(body || "{}");
        const session = otpSessions.get(phone);
        if (!session) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ return: false, message: "Pehle OTP bhejo" }));
          return;
        }
        if (Date.now() > session.expiresAt) {
          otpSessions.delete(phone);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ return: false, message: "OTP expire ho gaya, dobara bhejo" }));
          return;
        }
        if (otp === session.otp) {
          otpSessions.delete(phone);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ return: true, message: "OTP verified" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ return: false, message: "Galat OTP hai" }));
        }
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ return: false, message: e.message }));
      }
    });
    return;
  }

  // ---- /api/notify-login — Login hone par email bhejo ----
  if (req.url === "/api/notify-login" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const user = JSON.parse(body || "{}");
        const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

        // Audio file check
        let audioInfo = "Audio record nahi kiya";
        const audioFile = path.join(AUDIO_DIR, (user.phone || "unknown").replace(/\D/g,"") + ".webm");
        if (fs.existsSync(audioFile)) {
          const stat = fs.statSync(audioFile);
          audioInfo = `Audio saved: ${(stat.size/1024).toFixed(1)} KB (${audioFile})`;
        }

        const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;background:#0f1419;color:#e6edf3;padding:24px;border-radius:12px;">
  <h2 style="color:#3B6D11;margin:0 0 16px;">🌾 KaamSetu — New User Login</h2>
  <table style="width:100%;font-size:14px;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#9ba7b4;">📱 Phone</td><td style="padding:8px 0;font-weight:bold;">${user.phone || "-"}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">👤 Name</td><td style="padding:8px 0;">${user.name || "Not filled"}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">📍 Location</td><td style="padding:8px 0;">${user.village || "Not filled"}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">🛠 Skills</td><td style="padding:8px 0;">${user.skills || "Not filled"}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">💰 Daily Wage</td><td style="padding:8px 0;">${user.wage || "Not filled"}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">🕐 Login Time</td><td style="padding:8px 0;">${time}</td></tr>
    <tr><td style="padding:8px 0;color:#9ba7b4;">🎙 Audio Bio</td><td style="padding:8px 0;">${audioInfo}</td></tr>
  </table>
  <p style="margin-top:16px;font-size:12px;color:#9ba7b4;">KaamSetu — AI Powered Rural Job Portal</p>
</div>`;

        if (GMAIL_APP_PWD === "YOUR_GMAIL_APP_PASSWORD") {
          console.log("⚠️ Email nahi bheja (app password set nahi). Login:", user.phone);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, note: "Email config nahi hai, console mein log hai" }));
          return;
        }

        await mailer.sendMail({
          from: `"KaamSetu Portal" <${GMAIL_SENDER}>`,
          to: NOTIFY_EMAIL,
          subject: `🌾 KaamSetu — New Login: ${user.phone || "Unknown"} — ${time}`,
          html
        });
        console.log("✅ Login email bheja:", user.phone);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error("Email error:", e.message);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ---- /api/save-audio — Audio bio server pe save karo ----
  if (req.url === "/api/save-audio" && req.method === "POST") {
    let chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const buf = Buffer.concat(chunks);
        const phone = (req.headers["x-phone"] || "unknown").replace(/\D/g, "");
        const filename = path.join(AUDIO_DIR, phone + ".webm");
        fs.writeFileSync(filename, buf);
        console.log("✅ Audio saved:", filename, "(", (buf.length/1024).toFixed(1), "KB)");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, file: phone + ".webm" }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ---- /api/get-audio — Apna saved audio wapas lo ----
  if (req.url.startsWith("/api/get-audio") && req.method === "GET") {
    const phone = (new URLSearchParams(req.url.split("?")[1] || "").get("phone") || "").replace(/\D/g, "");
    const filename = path.join(AUDIO_DIR, phone + ".webm");
    if (phone && fs.existsSync(filename)) {
      res.writeHead(200, { "Content-Type": "audio/webm" });
      fs.createReadStream(filename).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, message: "Audio nahi mila" }));
    }
    return;
  }

  // ---- /api/chat — Gemini AI endpoint ----
  if (req.url === "/api/chat" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { messages } = JSON.parse(body || "{}");
        const reply = await callGemini(Array.isArray(messages) ? messages : []);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ---- Static files ----
  let filePath = req.url === "/" ? "/kaamsetu_whatsapp_portal.html" : req.url;
  filePath = path.join(ROOT, filePath.split("?")[0]);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + req.url);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log("\n✅ KaamSetu Server chal raha hai!");
  console.log(`\n🌐 Website: http://localhost:${PORT}`);
  console.log(`\n🤖 AI endpoint: http://localhost:${PORT}/api/chat`);
  if (!GEMINI_API_KEY) {
    console.log("\n⚠️  GEMINI_API_KEY set nahi hai.");
    console.log("   Option 1: Browser ke AI tab mein key paste karo");
    console.log("   Option 2: GEMINI_API_KEY=AIzaSy... node server.js");
  } else {
    console.log("\n✅ Gemini AI connected!");
  }
  console.log("\nBand karne ke liye: Ctrl+C\n");
});
