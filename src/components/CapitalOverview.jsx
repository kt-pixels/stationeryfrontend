import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  FaWallet,
  FaBoxes,
  FaHandHoldingUsd,
  FaMoneyBillWave,
  FaBalanceScale,
} from "react-icons/fa";
import "chart.js/auto";

export default function CapitalOverview() {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({});
  const [capitalTrend, setCapitalTrend] = useState([]);
  const [cashFlow, setCashFlow] = useState({ in: 0, out: 0 });
  const [breakEven, setBreakEven] = useState({ revenue: 0, expenses: 0 });
  const [reinvestment, setReinvestment] = useState({
    inventory: 0,
    expenses: 0,
    freeCash: 0,
  });

  useEffect(() => {
    loadCapital();
  }, []);

  const loadCapital = async () => {
    const [productsRes, salesRes, purchasesRes, expensesRes] =
      await Promise.all([
        api.get("/products"),
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/expenses"),
      ]);

    const products = productsRes.data.data;
    const sales = salesRes.data.data;
    const purchases = purchasesRes.data.data;
    const expenses = expensesRes.data.data;

    /* ================= INVENTORY VALUE ================= */
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0
    );

    /* ================= RECEIVABLES ================= */
    const receivables = sales
      .filter((s) => s.paymentMode !== "Cash")
      .reduce((sum, s) => sum + s.totalAmount, 0);

    /* ================= PAYABLES ================= */
    const payables = purchases
      .filter((p) => p.paymentStatus !== "Paid")
      .reduce((sum, p) => sum + p.totalAmount, 0);

    /* ================= EXPENSES ================= */
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    /* ================= NET CAPITAL ================= */
    const netCapital = inventoryValue + receivables - payables - totalExpenses;

    setSummary({
      inventoryValue,
      receivables,
      payables,
      expenses: totalExpenses,
      netCapital,
    });

    /* ================= MONTH-WISE CAPITAL TREND ================= */
    const monthly = {};

    sales.forEach((s) => {
      const key = new Date(s.saleDate).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[key] = monthly[key] || { revenue: 0, expenses: 0 };
      monthly[key].revenue += s.totalAmount;
    });

    expenses.forEach((e) => {
      const key = new Date(e.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[key] = monthly[key] || { revenue: 0, expenses: 0 };
      monthly[key].expenses += e.amount;
    });

    setCapitalTrend(
      Object.entries(monthly).map(([label, v]) => ({
        label,
        net: v.revenue - v.expenses,
      }))
    );

    /* ================= CASH FLOW ================= */
    const cashIn = sales
      .filter((s) => s.paymentMode === "Cash")
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const cashOut =
      purchases.reduce((sum, p) => sum + p.totalAmount, 0) +
      expenses.reduce((sum, e) => sum + e.amount, 0);

    setCashFlow({ in: cashIn, out: cashOut });

    /* ================= BREAK-EVEN (CURRENT MONTH) ================= */
    const currentMonth = new Date().toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    setBreakEven({
      revenue: monthly[currentMonth]?.revenue || 0,
      expenses: monthly[currentMonth]?.expenses || 0,
    });

    /* ================= PROFIT REINVESTMENT ================= */
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);

    setReinvestment({
      inventory: inventoryValue,
      expenses: totalExpenses,
      freeCash: totalProfit - inventoryValue - totalExpenses,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Capital Management</h2>
        <p className="text-sm text-gray-500">
          Complete business capital & cash flow analysis
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <Card
          title="Inventory Value"
          value={summary.inventoryValue}
          icon={<FaBoxes />}
        />
        <Card
          title="Receivables"
          value={summary.receivables}
          icon={<FaHandHoldingUsd />}
        />
        <Card
          title="Payables"
          value={summary.payables}
          icon={<FaMoneyBillWave />}
        />
        <Card title="Expenses" value={summary.expenses} icon={<FaWallet />} />
        <Card
          title="Net Capital"
          value={summary.netCapital}
          icon={<FaBalanceScale />}
          highlight
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Capital Trend (Month-wise)">
          <Line
            data={{
              labels: capitalTrend.map((c) => c.label),
              datasets: [
                {
                  data: capitalTrend.map((c) => c.net),
                  borderColor: "#4f46e5",
                  backgroundColor: "rgba(79,70,229,0.15)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="Cash Flow (In / Out)">
          <Bar
            data={{
              labels: ["Cash In", "Cash Out"],
              datasets: [
                {
                  data: [cashFlow.in, cashFlow.out],
                  backgroundColor: ["#22c55e", "#ef4444"],
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="Break-even (Current Month)">
          <Doughnut
            data={{
              labels: ["Revenue", "Expenses"],
              datasets: [
                {
                  data: [breakEven.revenue, breakEven.expenses],
                  backgroundColor: ["#22c55e", "#ef4444"],
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="Profit Reinvestment">
          <Doughnut
            data={{
              labels: ["Inventory", "Expenses", "Free Cash"],
              datasets: [
                {
                  data: [
                    reinvestment.inventory,
                    reinvestment.expenses,
                    reinvestment.freeCash,
                  ],
                  backgroundColor: ["#6366f1", "#f59e0b", "#22c55e"],
                },
              ],
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, value, icon, highlight }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 ${
        highlight ? "border-2 border-indigo-300" : ""
      }`}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">₹{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-300px">{children}</div>
    </div>
  );
}
