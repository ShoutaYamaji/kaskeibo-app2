import { useEffect, useState } from "react";

const STORAGE_KEY = "kakeibo-receipts";

// ローカルストレージから保存済みのレシートを読み込む
function loadReceipts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

/**
 * レシート一覧の状態を管理し、変更のたびにローカルストレージへ保存するフック
 */
export function useReceipts() {
  const [receipts, setReceipts] = useState(loadReceipts);

  // 一覧が変わるたびに保存して、リロード後も消えないようにする
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  // 読み取り結果を新しいレシートとして追加する
  const addReceipt = (receipt) => {
    const newReceipt = {
      ...receipt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const deleteReceipt = (id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  return { receipts, addReceipt, deleteReceipt };
}
