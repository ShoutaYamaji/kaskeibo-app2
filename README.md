# レシート家計簿

レシートの画像をアップロードすると、Claude API が商品名・金額・日付を読み取り、カテゴリ別・月別に集計する家計簿 Web アプリです。

## 主な機能

- レシート画像（JPEG / PNG / GIF / WebP、5MB まで）を読み取り、商品ごとに自動登録
- 商品を「食費・外食・日用品・交通費・医療・健康・衣服・美容・趣味・娯楽・その他」に自動分類
- カテゴリ別の円グラフ（月で絞り込み可能）と月別の棒グラフ
- データはブラウザのローカルストレージに保存（リロードしても消えません）

## セットアップ

Node.js 20.12 以上が必要です。

```bash
npm install
cp backend/.env.example backend/.env   # .env を開いて ANTHROPIC_API_KEY を設定
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 構成

- `frontend/` — React + Vite + Chart.js。`/api` へのリクエストは Vite がバックエンドへ転送します
- `backend/` — Node.js + Express。Claude API（`claude-haiku-4-5`）を呼び出します。API キーはバックエンドだけが持ち、ブラウザには渡しません
