import { CATEGORY_COLORS } from "../constants/categories.js";
import { formatYen, receiptTotal } from "../utils/aggregate.js";
import { formatDateTime } from "../utils/receiptValidation.js";

/**
 * 登録済みレシートの一覧（商品名・金額・日付）を表示するコンポーネント
 */
export default function ReceiptList({ receipts, onDelete }) {
  if (receipts.length === 0) {
    return (
      <section className="card">
        <h2>登録したレシート</h2>
        <p className="empty">まだレシートがありません。画像を読み込むとここに表示されます。</p>
      </section>
    );
  }

  // 日時の新しい順に並べる
  const sorted = [...receipts].sort((a, b) => formatDateTime(b).localeCompare(formatDateTime(a)));

  const handleDelete = (receipt) => {
    if (window.confirm(`${formatDateTime(receipt)} ${receipt.storeName || "レシート"} を削除しますか？`)) {
      onDelete(receipt.id);
    }
  };

  return (
    <section className="card">
      <h2>登録したレシート</h2>
      {sorted.map((receipt) => (
        <div key={receipt.id} className="receipt">
          <div className="receipt-header">
            <span>
              <strong>{formatDateTime(receipt)}</strong> {receipt.storeName}
            </span>
            <span>
              合計 <strong>{formatYen(receiptTotal(receipt))}</strong>
              <button className="delete-button" onClick={() => handleDelete(receipt)}>
                削除
              </button>
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>商品名</th>
                <th>カテゴリ</th>
                <th className="amount">金額</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>
                    <span
                      className="category-badge"
                      style={{ background: CATEGORY_COLORS[item.category] }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className={`amount ${item.price < 0 ? "negative" : ""}`}>
                    {formatYen(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
