import { useState } from "react";
import { analyzeReceipt } from "../api/receiptApi.js";
import { validateReceipt } from "../utils/receiptValidation.js";

// 今日の日付を YYYY-MM-DD で返す（日付が読み取れなかったときに使う）
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * レシート画像を選んで読み取り、結果を onAdd に渡すコンポーネント
 * 検証で警告が出た場合は、ユーザーが確認してから登録する
 */
export default function ReceiptUploader({ receipts, onAdd }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // 警告が出て登録を保留しているレシートと、その警告
  const [pending, setPending] = useState(null);

  const register = (receipt, note = "") => {
    onAdd(receipt);
    setMessage(`${receipt.items.length} 件の商品を登録しました${note}`);
    setPending(null);
  };

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
    setPending(null);
    setLoading(true);

    try {
      const result = await analyzeReceipt(file);
      if (result.items.length === 0) {
        throw new Error("商品を読み取れませんでした。別の画像でお試しください");
      }
      const dateMissing = !/^\d{4}-\d{2}-\d{2}$/.test(result.date);
      const receipt = {
        ...result,
        date: dateMissing ? today() : result.date,
        time: /^\d{2}:\d{2}$/.test(result.time) ? result.time : "",
      };
      const note = dateMissing ? "（日付が読み取れなかったため今日の日付にしました）" : "";

      const warnings = validateReceipt(receipt, receipts);
      if (warnings.length === 0) {
        register(receipt, note);
      } else {
        setPending({ receipt, warnings, note });
      }
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
      {pending && (
        <div className="warning">
          <p>
            <strong>確認してください</strong>
          </p>
          <ul>
            {pending.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <button onClick={() => register(pending.receipt, pending.note)}>登録する</button>
          <button
            className="secondary"
            onClick={() => {
              setPending(null);
              setMessage("登録を取り消しました");
            }}
          >
            登録しない
          </button>
        </div>
      )}
      {preview && <img className="preview" src={preview} alt="選択したレシート" />}
    </section>
  );
}
