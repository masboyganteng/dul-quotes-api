# DUL Quotes API

API berbayar kecil buat quest vAPI "List your API on vAPI" (500 poin).
GET /v1/quote — 1 quote inspirasi Bahasa Indonesia acak per panggilan.
Harga: $0,001 USDC per panggilan, Base mainnet (eip155:8453), x402 v2 exact.
payTo: dompet owner Bro 0xBf6656E720bE8Fd2c6f53B611EeA9Cf0D4201C51.
Facilitator: PayAI (https://facilitator.payai.network).
Primer gagal settle (wallet gas-nya kosong); x402.org hanya testnet.

## File
- `app.js` — Express app (dipakai lokal + Vercel).
- `server.js` — entry lokal (listen :3000), dipakai tunnel localhost.run.
- `api/index.js` — entry Vercel serverless (export app).
- `vercel.json` — rewrite semua path ke /api/index.
- `proxy_connect.py` — helper ssh ProxyCommand buat tunnel (egress VM cuma lewat proxy).

## Deploy ke Vercel (URL tetap, gratis)
1. Push folder ini ke repo GitHub Bro (misal `dul-quotes-api`).
2. Di vercel.com → Add New → Project → Import repo itu → Deploy.
   Tidak perlu env var apa pun. Framework preset: Other.
3. Dapat URL tetap, misal https://dul-quotes-api.vercel.app.
4. Cek: buka URL itu (health JSON) dan `vapi check <url>/v1/quote`
   (atau `curl <url>/v1/quote` — harus 402 Payment Required).
5. Update URL endpoint di listing vAPI (My APIs) ke URL Vercel yang baru,
   supaya probe per jam vAPI tidak gagal. Setelah itu tunnel localhost.run
   + cron `jaga-api-dul-quotes` boleh dimatikan.

## Uji lokal
- `node server.js` → http://localhost:3000/ (health), /v1/quote (402).
- Simulasi Vercel: jalankan api/index.js sebagai handler di port lain,
  hasilnya sama (sudah dites 7 Nov 2026 00:57 WIB: health OK, 402 OK,
  /.well-known/x402 OK).
- Uji bayar end-to-end (sudah sukses 7 Nov 00:39 WIB):
  `vapi pay <url>/v1/quote --method GET` → HTTP 200, settlement on-chain.
  Catatan: vapi pay butuh preload DNS+proxy (~/vapi-fix-dns.cjs,
  ~/vapi-fix-proxy.cjs) dan VAPI_FIX_HOSTS berisi host tunnel/URL.
