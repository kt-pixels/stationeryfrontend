import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Doughnut, Line } from "react-chartjs-2";
import {
  FaRupeeSign,
  FaChartLine,
  // FaExclamationTriangle,
  FaWallet,
  FaArrowTrendUp,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import "chart.js/auto";

export default function Analytics() {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/sales"),
      api.get("/expenses"),
      api.get("/products"),
    ]).then(([salesRes, expRes, prodRes]) => {
      setSales(salesRes.data.data);
      setExpenses(expRes.data.data);
      setProducts(prodRes.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  /* ================= CALCULATIONS ================= */
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const profitMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  /* ================= MONTHLY DATA PREP ================= */
  const monthlyMap = {};
  sales.forEach((s) => {
    const key = new Date(s.saleDate).toLocaleString("default", {
      month: "short",
    });
    monthlyMap[key] = (monthlyMap[key] || 0) + s.totalAmount;
  });

  const monthlyLabels = Object.keys(monthlyMap);
  const monthlyData = Object.values(monthlyMap);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1 space-y-8 max-w-1600px mx-auto"
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Financial Intelligence
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Detailed breakdown of your business economy
          </p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200">
          Profit Margin: {profitMargin}%
        </div>
      </div>

      {/* ================= KPI ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          title="Gross Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<FaArrowTrendUp />}
          bg="bg-emerald-50"
          color="text-emerald-600"
          sub="Total inflows"
        />
        <KPI
          title="Operating Costs"
          value={`₹${totalExpenses.toLocaleString()}`}
          icon={<FaWallet />}
          bg="bg-red-50"
          color="text-red-600"
          sub="Total outflows"
        />
        <KPI
          title="Net Earnings"
          value={`₹${netProfit.toLocaleString()}`}
          icon={<FaRupeeSign />}
          bg="bg-indigo-50"
          color="text-indigo-600"
          sub="After expenses"
        />
        <KPI
          title="Stock Risk"
          value={lowStockCount}
          icon={<FaChartLine />}
          bg="bg-orange-50"
          color="text-orange-600"
          sub="Items to restock"
        />
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Monthly Trend - Larger View */}
        <Card title="Revenue Growth Path" className="xl:col-span-2">
          <Line
            data={{
              labels: monthlyLabels,
              datasets: [
                {
                  label: "Monthly Sales",
                  data: monthlyData,
                  borderColor: "#4f46e5",
                  backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, "rgba(79, 70, 229, 0.2)");
                    gradient.addColorStop(1, "rgba(79, 70, 229, 0)");
                    return gradient;
                  },
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: "#4f46e5",
                  borderWidth: 3,
                },
              ],
            }}
            options={lineOptions}
          />
        </Card>

        {/* Expense Distribution */}
        <Card title="Budget Allocation">
          <div className="relative h-full flex flex-col items-center justify-center">
            <Doughnut
              data={{
                labels: ["Revenue", "Expenses"],
                datasets: [
                  {
                    data: [totalRevenue, totalExpenses],
                    backgroundColor: ["#10b981", "#f43f5e"],
                    hoverOffset: 10,
                    borderWidth: 0,
                    cutout: "75%",
                  },
                ],
              }}
              options={donutOptions}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
              <p className="text-xs text-gray-400 font-bold uppercase">
                Efficiency
              </p>
              <p className="text-2xl font-black text-gray-800">
                {100 - ((totalExpenses / totalRevenue) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= SMART INSIGHT ================= */}
      <div
        className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
          netProfit >= 0
            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            netProfit >= 0 ? "bg-emerald-500" : "bg-rose-500"
          } text-white shadow-lg`}
        >
          {netProfit >= 0 ? "✓" : "!"}
        </div>
        <div>
          <p className="font-bold text-lg">
            {netProfit >= 0
              ? "Financial Health: Strong"
              : "Financial Health: Critical"}
          </p>
          <p className="text-sm opacity-90">
            {netProfit >= 0
              ? `Your business is operating at a ${profitMargin}% profit margin. Consider reinvesting into low stock items.`
              : "Your cash outflow is currently higher than inflow. Analyze your daily expenses to find leakages."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================= STYLIZED SUB-COMPONENTS ================= */

function KPI({ title, value, icon, bg, color, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">
            {title}
          </p>
          <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center text-xl shadow-inner`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs font-medium text-gray-400 mt-4 italic">{sub}</p>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-7 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
        {title}
      </h3>
      <div className="h-320px">{children}</div>
    </div>
  );
}

/* ================= CHART CONFIGURATIONS ================= */

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8", font: { weight: "600" } },
    },
    y: {
      grid: { color: "#f1f5f9", drawBorder: false },
      ticks: {
        color: "#94a3b8",
        font: { weight: "600" },
        callback: (val) => "₹" + val / 1000 + "k",
      },
    },
  },
};

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 25,
        usePointStyle: true,
        font: { size: 12, weight: "700" },
        color: "#64748b",
      },
    },
  },
};
