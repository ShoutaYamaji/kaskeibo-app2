# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code へのガイドです。

## プロジェクト概要

レシート読み込み家計簿 Web アプリ（kaskeibo-app2）。レシート画像を Claude API で読み取り、商品名・金額・日付・カテゴリを記録して集計・グラフ表示する。

### 技術スタック

- npm workspaces のモノレポ（`backend/` と `frontend/`）
- フロントエンド: React + Vite + Chart.js（react-chartjs-2）。開発時は Vite が `/api` をバックエンド（:3001）へプロキシする
- バックエンド: Node.js + Express（ESM）。`@anthropic-ai/sdk` で Claude API を呼ぶ。モデルは `claude-haiku-4-5`
- データ保存: ブラウザのローカルストレージのみ（サーバー側 DB なし）

### 主要ファイル

- `backend/src/server.js` — `POST /api/analyze-receipt`（multer で画像を受け取る）
- `backend/src/claudeClient.js` — Claude 呼び出し。`messages.parse` + Zod スキーマで構造化出力を受け取る
- `backend/src/categories.js` / `frontend/src/constants/categories.js` — カテゴリ定義。**変更時は両方を揃える**
- `frontend/src/hooks/useReceipts.js` — レシート一覧の状態とローカルストレージ保存
- `frontend/src/utils/aggregate.js` — カテゴリ別・月別の集計
- `frontend/src/utils/receiptValidation.js` — 登録前の検証（負の金額・同一日時と合計金額の重複）。警告が出たらユーザーの確認後に登録する

### コマンド

```bash
npm install          # 全ワークスペースの依存関係をインストール
npm run dev          # バックエンド + フロントエンドを同時起動（http://localhost:5173）
npm run build        # フロントエンドの本番ビルド
```

テストフレームワークは未導入。追加したらここに実行方法を書くこと。

### セキュリティ

- Claude API キーは `backend/.env` の `ANTHROPIC_API_KEY` にのみ置き、ブラウザ側には渡さない。
- 環境変数を追加したら `backend/.env.example` も更新する。

## 開発の基本方針

- 応答・コード内コメント・コミットメッセージは日本語で書く。
- 既存コードの書き方（命名・コメント密度・構成）に合わせる。
- 金額は浮動小数点誤差を避けるため、整数（円単位）で扱う。
- APIキーやパスワードなどの秘密情報はコミットしない（`.env` は `.gitignore` に入れる）。

## Git 運用ルール

**コードを変更したら、そのたびにコミットして GitHub にプッシュすること。**

1. 変更が一区切りついたら、関連する変更だけをステージする（`git add -A` で無関係なファイルを巻き込まない）。
2. 変更内容がわかるコミットメッセージでコミットする。
   - 形式: `<種別>: <要約>`（例: `feat: 支出カテゴリ別の集計画面を追加`）
   - 種別: `feat`（機能追加）/ `fix`（バグ修正）/ `refactor` / `docs` / `style` / `test` / `chore`
3. コミット後、すぐに `git push` で GitHub のリモートへプッシュする。
4. プッシュに失敗した場合（競合・認証エラーなど）は、勝手に `--force` で上書きせず、状況をユーザーに報告して指示を仰ぐ。
5. `git push --force`、`git reset --hard`、履歴の書き換えなど破壊的な操作は、ユーザーの明示的な許可なしに行わない。
6. テストやビルドがある場合は、プッシュ前に通ることを確認する。失敗したままプッシュしない。
