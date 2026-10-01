import { formatYen, receiptTotal } from "./aggregate.js";

/**
 * 読み取ったレシートを登録前に検証し、警告メッセージの一覧を返す
 * （警告があっても登録はできる。登録するかどうかはユーザーが決める）
 * @param {object} receipt 読み取ったレシート
 * @param {object[]} existing 登録済みのレシート
 * @returns {string[]} 警告メッセージ（問題がなければ空配列）
 */
export function validateReceipt(receipt, existing) {
  const warnings = [];

  // 金額が負の商品がないか
  const negativeItems = receipt.items.filter((item) => item.price < 0);
  if (negativeItems.length > 0) {
    const names = negativeItems.map((item) => `${item.name}（${formatYen(item.price)}）`);
    warnings.push(
      `金額がマイナスの商品があります: ${names.join("、")}。値引き・割引の行であれば問題ありません。`
    );
  }

  // 同じ日時・同じ合計金額のレシートが登録済みでないか
  const duplicate = existing.find((r) => isSameReceipt(r, receipt));
  if (duplicate) {
    warnings.push(
      `同じ日時・合計金額のレシートが既に登録されています: ` +
        `${formatDateTime(duplicate)} ${duplicate.storeName} ${formatYen(receiptTotal(duplicate))}`
    );
  }

  return warnings;
}

// 日時と合計金額が同じなら同一レシートとみなす
// 時刻はどちらかが読み取れていない場合は比較しない
function isSameReceipt(a, b) {
  if (a.date !== b.date) return false;
  if (a.time && b.time && a.time !== b.time) return false;
  return receiptTotal(a) === receiptTotal(b);
}

// 「YYYY-MM-DD HH:MM」形式で表示する（時刻がなければ日付のみ）
export const formatDateTime = (receipt) =>
  receipt.time ? `${receipt.date} ${receipt.time}` : receipt.date;
