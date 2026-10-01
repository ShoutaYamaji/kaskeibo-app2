/**
 * レシート画像をバックエンドに送り、読み取り結果を受け取る
 * （Claude API キーはバックエンドだけが持ち、ブラウザからは直接呼ばない）
 * @param {File} file レシート画像
 */
export async function analyzeReceipt(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/analyze-receipt", { method: "POST", body: formData });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "レシートの読み取りに失敗しました");
  }
  return data;
}
