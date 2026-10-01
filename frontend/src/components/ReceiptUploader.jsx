import { useState } from "react";
import { analyzeReceipt } from "../api/receiptApi.js";

// 今日の日付を YYYY-MM-DD で返す（日付が読み取れなかったときに使う）
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * レシート画像を選んで読み取り、結果を onAdd に渡すコンポーネント
 */
export default function ReceiptUploader({ onAdd }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files[0];
    // 同じファイルを続けて選べるように選択状態をリセットする
    e.target.value = "";
    if (!file) return;

    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const receipt = await analyzeReceipt(file);
      if (receipt.items.length === 0) {
        throw new Error("商品を読み取れませんでした。別の画像でお試しください");
      }
      const dateMissing = !/^\d{4}-\d{2}-\d{2}$/.test(receipt.date);
      onAdd({ ...receipt, date: dateMissing ? today() : receipt.date });
      setMessage(
        `${receipt.items.length} 件の商品を登録しました` +
          (dateMissing ? "（日付が読み取れなかったため今日の日付にしました）" : "")
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>レシートを読み込む</h2>
      <label className={`upload-button ${loading ? "disabled" : ""}`}>
        {loading ? "読み取り中…" : "画像を選択"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleChange}
          disabled={loading}
          hidden
        />
      </label>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
      {preview && <img className="preview" src={preview} alt="選択したレシート" />}
    </section>
  );
}
