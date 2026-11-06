// DUL Quotes API — Express app (dipakai server.js lokal + api/index.js di Vercel).
// GET /v1/quote — $0.001 USDC per call, payTo = dompet owner Bro, Base mainnet, x402 v2 exact.
import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const PAY_TO = "0xBf6656E720bE8Fd2c6f53B611EeA9Cf0D4201C51"; // dompet owner Bro (yang di-sign di form Payout)
const PRICE = "$0.001";
const NETWORK = "eip155:8453"; // Base mainnet

const QUOTES = [
  { id: 1, text: "Pelan-pelan asal jalan, yang penting nggak berhenti.", author: "DUL" },
  { id: 2, text: "Rezeki itu kayak FCFS: yang siap duluan, dia yang dapat.", author: "DUL" },
  { id: 3, text: "Nggak harus besar dulu. Mulai kecil, konsisten, nanti juga kelihatan.", author: "DUL" },
  { id: 4, text: "Hari ini mungkin sepi, tapi yang tekun tetap jalan terus.", author: "DUL" },
  { id: 5, text: "Jangan bandingin prosesmu sama hasil orang lain.", author: "DUL" },
  { id: 6, text: "Satu langkah kecil hari ini lebih baik dari seribu rencana.", author: "DUL" },
  { id: 7, text: "Gagal itu bukan akhir, itu ongkos belajar.", author: "DUL" },
  { id: 8, text: "Yang gratis dikejar, yang murah dihitung, yang mahal ditinggal.", author: "DUL" },
  { id: 9, text: "Sabar itu bukan diam. Sabar itu tetap kerja sambil nunggu hasil.", author: "DUL" },
  { id: 10, text: "Kalau jalannya buntu, cari jalan lain. Jangan berhenti di situ.", author: "DUL" },
  { id: 11, text: "Keberuntungan itu persiapan yang ketemu kesempatan.", author: "DUL" },
  { id: 12, text: "Sedikit tapi rutin, lama-lama jadi bukit.", author: "DUL" },
  { id: 13, text: "Fokus ke yang bisa dikontrol, sisanya biarin jalan.", author: "DUL" },
  { id: 14, text: "Nggak apa-apa capek, yang penting jangan nyerah.", author: "DUL" },
  { id: 15, text: "Setiap hari ada peluang baru buat yang mau nyari.", author: "DUL" },
  { id: 16, text: "Yang penting mulai. Sempurna belakangan.", author: "DUL" },
  { id: 17, text: "Uang kecil yang diurus baik, lama-lama jadi besar.", author: "DUL" },
  { id: 18, text: "Jangan takut ketinggalan. Takutlah kalau berhenti belajar.", author: "DUL" },
  { id: 19, text: "Hasil yang manis biasanya datang ke yang paling sabar.", author: "DUL" },
  { id: 20, text: "Kerja cerdas, hemat modal, tetap gas.", author: "DUL" },
  { id: 21, text: "Hari buruk bukan alasan buat berhenti. Besok masih ada.", author: "DUL" },
  { id: 22, text: "Yang konsisten itu yang menang, bukan yang paling cepat sesaat.", author: "DUL" },
  { id: 23, text: "Mimpi besar dimulai dari langkah yang kelihatan kecil.", author: "DUL" },
  { id: 24, text: "Tetap rendah hati, tetap lapar belajar.", author: "DUL" },
];

const app = express();
app.use(cors({
  origin: "*",
  exposedHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"],
}));

// Logging debug: header pembayaran + status tiap respons (buat diagnosa 402).
app.use((req, res, next) => {
  const payXP = req.headers["x-payment"];
  const payPS = req.headers["payment-signature"];
  if (payXP || payPS) {
    console.log("PAID REQ", req.method, req.path);
    if (payXP) console.log("X-PAYMENT:", String(payXP));
    if (payPS) console.log("PAYMENT-SIGNATURE:", String(payPS));
  }
  res.on("finish", () => {
    let extra = "";
    if (res.statusCode === 402) {
      try {
        const pr = res.getHeader("PAYMENT-REQUIRED");
        if (pr) extra = " err=" + (JSON.parse(Buffer.from(String(pr), "base64").toString()).error || "?");
      } catch { /* abaikan */ }
    }
    console.log("RESP", req.method, req.path, res.statusCode + extra);
  });
  next();
});

// Discovery manifest x402 v2 (biar gampang ditemukan indexer).
app.get("/.well-known/x402", (_req, res) => {
  res.json({
    x402Version: 2,
    name: "DUL Quotes",
    description: "Random inspirational quote in Bahasa Indonesia. One quote per paid call.",
    endpoints: [
      {
        path: "/v1/quote",
        method: "GET",
        description: "Random inspirational quote in Bahasa Indonesia.",
        accepts: [
          {
            scheme: "exact",
            network: NETWORK,
            amount: "1000",
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            payTo: PAY_TO,
            maxTimeoutSeconds: 60,
            extra: { name: "USD Coin", version: "2" },
          },
        ],
      },
    ],
  });
});

// Health check gratis (bukan produk berbayar).
app.get("/", (_req, res) => {
  res.json({
    service: "DUL Quotes",
    status: "ok",
    endpoint: "GET /v1/quote",
    price: "$0.001 USDC on Base (eip155:8453)",
    payTo: PAY_TO,
  });
});

const facilitatorClient = new HTTPFacilitatorClient({ url: "https://facilitator.payai.network" }); // Primer gagal: wallet gas-nya kosong (INSUFFICIENT_FUNDS); x402.org hanya testnet
const resourceServer = new x402ResourceServer(facilitatorClient).register(
  NETWORK,
  new ExactEvmScheme(),
);

app.use(
  paymentMiddleware(
    {
      "GET /v1/quote": {
        accepts: [
          {
            scheme: "exact",
            price: PRICE,
            network: NETWORK,
            payTo: PAY_TO,
            maxTimeoutSeconds: 60,
          },
        ],
        description: "Random inspirational quote in Bahasa Indonesia. One quote per paid call.",
      },
    },
    resourceServer,
  ),
);

app.get("/v1/quote", (_req, res) => {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  res.json({ id: q.id, quote: q.text, author: q.author, language: "id" });
});

export default app;
