# MorCraft SMP sitesi

Türkçe, responsive MorCraft SMP tanıtım sitesi ve VIP sipariş e-posta API'si.

## Dosyalar
- `index.html`, `style.css`, `script.js`: Site arayüzü
- `config.js`: Sunucu IP'si, paket fiyatları ve API adresi
- `backend/`: Node.js + Express sipariş API'si
- E-posta Resend ile sunucu tarafında gönderilir; API anahtarı tarayıcıya konulmaz.

## Yayına alma
1. GitHub deposunda **Settings → Pages** bölümüne gir.
2. **Deploy from a branch** seç; Branch olarak `main`, klasör olarak `/(root)` seç ve kaydet.
3. `config.js` içindeki VIP fiyatlarını belirle.
4. Sipariş e-postaları için Resend hesabı aç, gönderen alan adını doğrula ve API key oluştur.
5. Render'da bu depoyu Web Service olarak bağla; Root Directory `backend`, Build Command `npm install`, Start Command `npm start`.
6. Render Environment değişkenlerine `.env.example` içindeki değerleri gir. `TO_EMAIL` zaten yönetici e-posta adresine ayarlı.
7. `ALLOWED_ORIGINS` değerini GitHub Pages adresin yap; `config.js` içindeki `apiBaseUrl` değerini Render URL'siyle değiştir.

**Güvenlik:** `RESEND_API_KEY` yalnızca Render Environment'da tutulmalı; frontend'e eklenmemeli.

**Önemli:** VIP formu yalnızca satın alma talebi e-postası gönderir; ödeme almaz ve otomatik VIP tanımlamaz. Ödeme ve teslimatı yönetici ayrıca teyit eder. Yayına çıkmadan önce gizlilik/KVKK ve satış koşullarını ekle.