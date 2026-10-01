import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { CATEGORY_COLORS } from "../constants/categories.js";
import { formatYen, sumByCategory, toMonth } from "../utils/aggregate.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * カテゴリ別の支出を円グラフと表で表示するコンポーネント（月で絞り込み可能）
 */
export default function CategoryPieChart({ receipts }) {
  const [month, setMonth] = useState("all");

  // 絞り込み用の月一覧（新しい順）
  const months = [...new Set(receipts.map((r) => toMonth(r.date)))].sort().reverse();
  const target = month === "all" ? receipts : receipts.filter((r) => toMonth(r.date) === month);
  const totals = sumByCategory(target);
  const grandTotal = totals.reduce((sum, t) => sum + t.amount, 0);

  const data = {
    labels: totals.map((t) => t.category),
    datasets: [
      {
        data: totals.map((t) => t.amount),
        backgroundColor: totals.map((t) => CATEGORY_COLORS[t.category]),
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatYen(ctx.parsed)}` } },
    },
  };

  return (
    <section className="card">
      <div className="card-title">
        <h2>カテゴリ別の支出</h2>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">全期間</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {totals.length === 0 ? (
        <p className="empty">データがありません</p>
      ) : (
        <>
          <div className="chart">
            <Pie data={data} options={options} />
          </div>
          <table>
            <tbody>
              {totals.map((t) => (
                <tr key={t.category}>
                  <td>{t.category}</td>
                  <td className="amount">{formatYen(t.amount)}</td>
                  <td className="amount">{Math.round((t.amount / grandTotal) * 100)}%</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>合計</td>
                <td className="amount">{formatYen(grandTotal)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
