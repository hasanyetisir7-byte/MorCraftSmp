require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
const packages = new Set(["VIP", "VIP+", "MVP"]);

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Bu siteye izin verilmiyor."));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api/orders", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "MorCraft SMP order API" }));

app.post("/api/orders", async (req, res) => {
  try {
    const { package: selectedPackage, minecraftUsername, website } = req.body || {};
    if (website) return res.status(200).json({ ok: true });
    if (!packages.has(selectedPackage)) return res.status(400).json({ error: "Geçersiz VIP paketi." });
    if (typeof minecraftUsername !== "string" || !/^[A-Za-z0-9_]{3,16}$/.test(minecraftUsername.trim())) {
      return res.status(400).json({ error: "Geçerli bir Minecraft kullanıcı adı gir." });
    }
    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL || !process.env.TO_EMAIL) {
      console.error("E-posta ortam değişkenleri eksik.");
      return res.status(503).json({ error: "Sipariş sistemi şu anda yapılandırılmamış. Lütfen daha sonra tekrar dene." });
    }

    const username = minecraftUsername.trim();
    const date = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "full", timeStyle: "long", timeZone: "Europe/Istanbul"
    }).format(new Date());
    const emailText = [
      "MorCraft SMP — Yeni VIP sipariş talebi", "",
      `Paket: ${selectedPackage}`,
      `Minecraft kullanıcı adı: ${username}`,
      `Sipariş tarihi: ${date}`, "",
      "Not: Bu bir satın alma talebidir; ödeme alınmamıştır. Oyuncuyla iletişime geçerek ödeme ve teslimatı ayrıca teyit edin."
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL, to: [process.env.TO_EMAIL],
        subject: `MorCraft SMP — ${selectedPackage} VIP talebi`, text: emailText
      })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend gönderim hatası:", response.status, detail);
      return res.status(502).json({ error: "E-posta gönderilemedi. Lütfen biraz sonra tekrar dene." });
    }
    const result = await response.json();
    return res.status(201).json({ ok: true, orderId: result.id });
  } catch (error) {
    console.error("Sipariş API hatası:", error.message);
    return res.status(500).json({ error: "Beklenmeyen bir hata oluştu." });
  }
});
app.listen(PORT, () => console.log(`MorCraft order API ${PORT} portunda çalışıyor.`));