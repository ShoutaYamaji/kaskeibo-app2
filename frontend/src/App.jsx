import ReceiptUploader from "./components/ReceiptUploader.jsx";
import ReceiptList from "./components/ReceiptList.jsx";
import CategoryPieChart from "./components/CategoryPieChart.jsx";
import MonthlyBarChart from "./components/MonthlyBarChart.jsx";
import { useReceipts } from "./hooks/useReceipts.js";

export default function App() {
  const { receipts, addReceipt, deleteReceipt } = useReceipts();

  return (
    <div className="app">
      <header>
        <h1>レシート家計簿</h1>
        <p>レシートの写真を読み込むと、商品と金額を自動で記録・集計します。</p>
      </header>
      <main>
        <ReceiptUploader onAdd={addReceipt} />
        <div className="charts">
          <CategoryPieChart receipts={receipts} />
          <MonthlyBarChart receipts={receipts} />
        </div>
        <ReceiptList receipts={receipts} onDelete={deleteReceipt} />
      </main>
    </div>
  );
}
