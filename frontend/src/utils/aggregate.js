import { CATEGORIES } from "../constants/categories.js";

// 金額を「¥1,234」形式で表示する
export const formatYen = (amount) => `¥${amount.toLocaleString("ja-JP")}`;

// レシートの日付から「YYYY-MM」を取り出す
export const toMonth = (date) => date.slice(0, 7);

/**
 * カテゴリ別の合計金額を求める（商品ごとのカテゴリで集計）
 * @returns {{ category: string, amount: number }[]} 金額が 0 のカテゴリは除く
 */
export function sumByCategory(receipts) {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const receipt of receipts) {
    for (const item of receipt.items) {
      totals[item.category] = (totals[item.category] ?? 0) + item.price;
    }
  }
  return Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }));
}

/**
 * 月別の合計金額を古い月から順に求める
 * @returns {{ month: string, amount: number }[]}
 */
export function sumByMonth(receipts) {
  const totals = {};
  for (const receipt of receipts) {
    const month = toMonth(receipt.date);
    const amount = receipt.items.reduce((sum, item) => sum + item.price, 0);
    totals[month] = (totals[month] ?? 0) + amount;
  }
  return Object.keys(totals)
    .sort()
    .map((month) => ({ month, amount: totals[month] }));
}
