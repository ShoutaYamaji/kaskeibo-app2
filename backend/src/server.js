import express from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeReceipt } from "./claudeClient.js";

const PORT = process.env.PORT || 3001;

// Claude API が受け付ける画像形式
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// アップロード画像はディスクに保存せずメモリ上で扱う（上限 5MB）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const app = express();

// レシート画像を受け取り、Claude で読み取った結果を返す
app.post("/api/analyze-receipt", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "画像ファイルが送信されていません" });
  }
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({ error: "対応している画像形式は JPEG / PNG / GIF / WebP です" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ error: "Claude API キーが設定されていません（backend/.env を確認してください）" });
  }

  try {
    const receipt = await analyzeReceipt(req.file.buffer, req.file.mimetype);
    res.json(receipt);
  } catch (err) {
    console.error(err);
    // API キー未設定・不正はサーバー側の設定ミスとして扱う
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "Claude API キーが正しく設定されていません" });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "混み合っています。しばらくしてから再度お試しください" });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "Claude API の呼び出しに失敗しました" });
    }
    res.status(500).json({ error: err.message || "レシートの読み取りに失敗しました" });
  }
});

// multer のファイルサイズ超過などのエラー処理
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "画像サイズは 5MB 以下にしてください" : err.message;
    return res.status(400).json({ error: message });
  }
  next(err);
});

app.listen(PORT, () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("警告: ANTHROPIC_API_KEY が設定されていません（backend/.env を確認してください）");
  }
  console.log(`バックエンドを起動しました: http://localhost:${PORT}`);
});
