// Entry lokal (tunnel localhost.run) — import app dari app.js lalu listen.
// Untuk Vercel, entry-nya api/index.js (serverless, tanpa listen).
import app from "./app.js";

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`DUL Quotes listening on :${PORT} — GET /v1/quote $0.001 -> 0xBf6656E720bE8Fd2c6f53B611EeA9Cf0D4201C51`);
});
