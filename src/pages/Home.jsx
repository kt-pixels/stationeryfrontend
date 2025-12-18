import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { FaArrowUp, FaArrowDown, FaCalendarAlt } from "react-icons/fa";
import api from "../services/api";
import "chart.js/auto";

// Light Mode Constants
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const BG_LIGHT = "bg-gray-50";
const CARD_BG = "bg-white";
const BORDER_COLOR = "border-gray-200";

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    todaySales: 0,
    todayProfit: 0,
    totalProducts: 0,
    lowStockAlerts: 0,
    salesGrowth: 0,
    outstandingCredit: 0, // ✅ NEW
    creditSalesCount: 0, // ✅ NEW
  });

  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [prodRes, salesRes, expRes, credRes] = await Promise.all([
        api.get("/products"),
        api.get("/sales"),
        api.get("/expenses"),
        api.get("/creditors"),
      ]);

      const products = prodRes.data.data;
      const sales = salesRes.data.data;
      const today = new Date().toDateString();
      const creditors = credRes.data.data;

      // 1. Calculate Today's KPIs
      const todaySalesEntries = sales.filter(
        (s) => new Date(s.saleDate).toDateString() === today
      );
      const cashSalesToday = todaySalesEntries.filter(
        (s) => s.paymentStatus === "PAID"
      );

      const todaySales = cashSalesToday.reduce(
        (sum, s) => sum + s.totalAmount,
        0
      );

      const todayProfit = cashSalesToday.reduce((sum, s) => sum + s.profit, 0);

      const lowStockCount = products.filter(
        (p) => p.stock <= p.minStock
      ).length;

      const totalOutstandingCredit = creditors.reduce(
        (sum, c) => sum + c.balance,
        0
      );

      const creditSalesCount = creditors.reduce(
        (sum, c) => sum + c.sales.length,
        0
      );

      setKpis({
        todaySales,
        todayProfit,
        totalProducts: products.length,
        lowStockAlerts: lowStockCount,
        salesGrowth: 12.5,
        outstandingCredit: totalOutstandingCredit, // ✅
        creditSalesCount, // ✅
      });

      // 2. Prepare Category Split (Doughnut)
      const categories = {};
      products.forEach((p) => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      setCategoryData(
        Object.entries(categories).map(([name, total]) => ({ name, total }))
      );

      // 3. Prepare Sales Trend (Last 6 entries/days)
      setSalesData(
        sales
          .filter((s) => s.paymentStatus === "PAID")
          .slice(-6)
          .map((s) => ({
            label: new Date(s.saleDate).toLocaleDateString(undefined, {
              weekday: "short",
            }),
            total: s.totalAmount,
          }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Analysing business data...
      </div>
    );

  return (
    <div className={`min-h-screen ${BG_LIGHT} p-6 font-sans text-gray-800`}>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Store Dashboard</h2>
          <p className="text-gray-500">
            Real-time business performance & inventory insights
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium">
          <FaCalendarAlt className="text-indigo-600" />
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPI
          title="Today's Sales"
          value={`₹${kpis.todaySales.toLocaleString()}`}
          trend="up"
          color="text-indigo-600"
        />
        <KPI
          title="Today's Profit"
          value={`₹${kpis.todayProfit.toLocaleString()}`}
          trend="up"
          color="text-emerald-600"
        />
        <KPI
          title="Total Items"
          value={kpis.totalProducts}
          trend="neutral"
          color="text-gray-900"
        />
        <KPI
          title="Low Stock Items"
          value={kpis.lowStockAlerts}
          trend={kpis.lowStockAlerts > 0 ? "down" : "up"}
          color="text-orange-600"
        />
        <KPI
          title="Outstanding Credit"
          value={`₹${kpis.outstandingCredit.toLocaleString()}`}
          trend="down"
          color="text-red-600"
        />

        <KPI
          title="Credit Sales"
          value={kpis.creditSalesCount}
          trend="neutral"
          color="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card title="Revenue Trend (Recent Sales)" className="lg:col-span-2">
          <div className="h-300px">
            <Bar
              data={{
                labels: salesData.map((d) => d.label),
                datasets: [
                  {
                    label: "Revenue",
                    data: salesData.map((d) => d.total),
                    backgroundColor: "#6366f1",
                    borderRadius: 6,
                  },
                ],
              }}
              options={barOptions}
            />
          </div>
        </Card>

        {/* Category Split */}
        <Card title="Inventory by Category">
          <div className="h-300px flex items-center justify-center">
            <Doughnut
              data={{
                labels: categoryData.map((c) => c.name),
                datasets: [
                  {
                    data: categoryData.map((c) => c.total),
                    backgroundColor: COLORS,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    cutout: "75%",
                  },
                ],
              }}
              options={donutOptions}
            />
          </div>
        </Card>

        {/* Summary Footer Section */}
        <Card title="Quick Action Alerts" className="lg:col-span-3">
          <div className="flex gap-4 items-center overflow-x-auto pb-2">
            {kpis.lowStockAlerts > 0 && (
              <div className="shrink-0 bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <strong>Action Needed:</strong> {kpis.lowStockAlerts} items are
                below minimum stock level.
              </div>
            )}
            <div className="shrink-0 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl border border-indigo-100 text-sm">
              💡 Top Category: <b>{categoryData[0]?.name || "N/A"}</b>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- REUSABLE SUB-COMPONENTS ---------- */

function KPI({ title, value, trend, color }) {
  return (
    <div
      className={`${CARD_BG} border ${BORDER_COLOR} rounded-2xl p-6 shadow-sm`}
    >
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
            trend === "up"
              ? "bg-emerald-50 text-emerald-600"
              : trend === "down"
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {trend === "up" ? (
            <FaArrowUp className="mr-1" />
          ) : trend === "down" ? (
            <FaArrowDown className="mr-1" />
          ) : null}
          {trend === "neutral" ? "Stable" : "In Sync"}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          Since last session
        </span>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div
      className={`${CARD_BG} border ${BORDER_COLOR} rounded-2xl p-6 shadow-sm ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
      {children}
    </div>
  );
}

/* ---------- CHART CONFIG (LIGHT MODE) ---------- */

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
    y: {
      grid: { borderDash: [5, 5], color: "#e2e8f0" },
      ticks: { color: "#94a3b8" },
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
        color: "#64748b",
        usePointStyle: true,
        padding: 20,
        font: { size: 12, weight: "600" },
      },
    },
  },
};
