import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatYen, sumByMonth } from "../utils/aggregate.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

/**
 * 月別の支出合計を棒グラフで表示するコンポーネント
 */
export default function MonthlyBarChart({ receipts }) {
  const totals = sumByMonth(receipts);

  const data = {
    labels: totals.map((t) => t.month),
    datasets: [
      {
        label: "支出",
        data: totals.map((t) => t.amount),
        backgroundColor: "#4e79a7",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${formatYen(ctx.parsed.y)}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => formatYen(value) } },
    },
  };

  return (
    <section className="card">
      <h2>月別の支出</h2>
      {totals.length === 0 ? (
        <p className="empty">データがありません</p>
      ) : (
        <div className="chart">
          <Bar data={data} options={options} />
        </div>
      )}
    </section>
  );
}
