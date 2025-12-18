import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaExclamationTriangle,
  FaFire,
  FaCheckCircle,
  FaBell,
} from "react-icons/fa";
import api from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    generateAlerts();
  }, []);

  const generateAlerts = async () => {
    const [productsRes, salesRes, expensesRes] = await Promise.all([
      api.get("/products"),
      api.get("/sales"),
      api.get("/expenses"),
    ]);

    const products = productsRes.data.data;
    const sales = salesRes.data.data;
    const expenses = expensesRes.data.data;

    const generatedAlerts = [];

    // ================= LOW STOCK =================
    products.forEach((p) => {
      if (p.stock <= p.minStock) {
        generatedAlerts.push({
          id: `low-stock-${p._id}`,
          title: "Low Stock Alert",
          message: `${p.name} stock is low (${p.stock} left)`,
          severity: "high",
        });
      }
    });

    // ================= FAST MOVING =================
    const productSalesCount = {};
    sales.forEach((s) => {
      s.items.forEach((i) => {
        productSalesCount[i.product?._id] =
          (productSalesCount[i.product?._id] || 0) + i.quantity;
      });
    });

    const fastMoving = Object.entries(productSalesCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (fastMoving) {
      const product = products.find((p) => p._id === fastMoving[0]);
      if (product) {
        generatedAlerts.push({
          id: "fast-moving",
          title: "Fast Moving Product",
          message: `${product.name} is selling fast (${fastMoving[1]} units sold recently)`,
          severity: "medium",
        });
      }
    }

    // ================= TODAY EXPENSE =================
    const today = new Date().toDateString();
    const todayExpense = expenses
      .filter((e) => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + e.amount, 0);

    if (todayExpense > 2000) {
      generatedAlerts.push({
        id: "high-expense",
        title: "High Expense Warning",
        message: `Today's expenses are high (₹${todayExpense})`,
        severity: "high",
      });
    }

    // ================= DAILY SALES SUMMARY =================
    const todaySales = sales.filter(
      (s) => new Date(s.saleDate).toDateString() === today
    );

    if (todaySales.length) {
      const totalSales = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalProfit = todaySales.reduce((sum, s) => sum + s.profit, 0);

      generatedAlerts.push({
        id: "daily-summary",
        title: "Daily Sales Summary",
        message: `Today's Sales: ₹${totalSales} | Profit: ₹${totalProfit}`,
        severity: "low",
      });
    }

    setAlerts(generatedAlerts);
  };

  // ================= UI HELPERS =================
  const severityStyle = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  const severityIcon = {
    high: <FaExclamationTriangle />,
    medium: <FaFire />,
    low: <FaCheckCircle />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold">Alerts & Notifications</h2>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Total Alerts" value={alerts.length} />
        <SummaryCard
          title="High Priority"
          value={alerts.filter((a) => a.severity === "high").length}
          color="text-red-600"
        />
        <SummaryCard
          title="Medium Priority"
          value={alerts.filter((a) => a.severity === "medium").length}
          color="text-yellow-600"
        />
        <SummaryCard
          title="Low Priority"
          value={alerts.filter((a) => a.severity === "low").length}
          color="text-green-600"
        />
      </div>

      {/* ================= ALERT LIST ================= */}
      <div className="bg-white rounded-2xl shadow-sm divide-y">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-4 p-5 hover:bg-gray-50 transition"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                severityStyle[a.severity]
              }`}
            >
              {severityIcon[a.severity]}
            </div>

            <div className="flex-1">
              <h4 className="font-semibold">{a.title}</h4>
              <p className="text-sm text-gray-600">{a.message}</p>
            </div>

            <FaBell className="text-gray-400 mt-1" />
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No alerts right now 🎉
          </div>
        )}
      </div>

      {/* ================= INFO ================= */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-sm text-indigo-700">
        🔔 Alerts are auto-generated using live stock, sales & expense data.
        High priority alerts need immediate attention.
      </div>
    </motion.div>
  );
}

// ================= SUMMARY CARD =================
function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-2xl font-bold ${color || ""}`}>{value}</h3>
    </div>
  );
}
