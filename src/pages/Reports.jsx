import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaFilePdf,
  FaChartBar,
  FaBox,
  FaRupeeSign,
  FaShoppingCart,
} from "react-icons/fa";
import api from "../services/api";
import { generatePDF } from "../utils/pdf";

export default function Reports() {
  // ================= DATE HELPERS =================
  const getMonthRange = (months = 0) => {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const from = new Date(now.getFullYear(), now.getMonth() - months, 1);

    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  };

  const getYearRange = () => {
    const now = new Date();
    return {
      from: `${now.getFullYear()}-01-01`,
      to: `${now.getFullYear()}-12-31`,
    };
  };

  // ================= STATE =================
  const [range, setRange] = useState(() => {
    const saved = localStorage.getItem("reportRange");
    return saved ? JSON.parse(saved) : getMonthRange(0);
  });

  useEffect(() => {
    localStorage.setItem("reportRange", JSON.stringify(range));
  }, [range]);

  // ================= COMMON ERROR HANDLER =================
  const handleEmpty = (rows) => {
    if (!rows.length) {
      alert("No data found for selected period");
      return true;
    }
    return false;
  };

  // ================= SALES REPORT =================
  const salesReport = useCallback(async () => {
    try {
      const res = await api.get("/sales", { params: range });
      const rows = [];

      res.data.data.forEach((sale) => {
        sale.items.forEach((item) => {
          rows.push([
            sale.invoiceNumber,
            new Date(sale.saleDate).toLocaleDateString(),
            sale.customerName,
            item.product?.name || "N/A",
            item.quantity,
            item.sellingPrice,
            item.quantity * item.sellingPrice,
            (item.sellingPrice - item.costPrice) * item.quantity,
          ]);
        });
      });

      if (handleEmpty(rows)) return;

      generatePDF(
        `Sales_Report_${range.from}_to_${range.to}`,
        [
          "Invoice",
          "Date",
          "Customer",
          "Product",
          "Qty",
          "Sell Price",
          "Amount",
          "Profit",
        ],
        rows
      );
    } catch (err) {
      alert("Failed to generate Sales Report");
    }
  }, [range]);

  // ================= PURCHASE REPORT =================
  const purchaseReport = async () => {
    try {
      const res = await api.get("/purchases", { params: range });
      const rows = [];

      res.data.data.forEach((purchase) => {
        purchase.items.forEach((item) => {
          rows.push([
            purchase.billNumber,
            new Date(purchase.purchaseDate).toLocaleDateString(),
            purchase.supplierName,
            item.product?.name || "N/A",
            item.quantity,
            item.costPrice,
            item.quantity * item.costPrice,
          ]);
        });
      });

      if (handleEmpty(rows)) return;

      generatePDF(
        "Purchase_Report",
        ["Bill", "Date", "Supplier", "Product", "Qty", "Cost Price", "Amount"],
        rows
      );
    } catch {
      alert("Failed to generate Purchase Report");
    }
  };

  // ================= EXPENSE REPORT =================
  const expenseReport = async () => {
    try {
      const res = await api.get("/expenses", { params: range });

      const rows = res.data.data.map((e) => [
        e.title,
        e.category,
        e.amount,
        new Date(e.date).toLocaleDateString(),
      ]);

      if (handleEmpty(rows)) return;

      generatePDF(
        "Expense_Report",
        ["Title", "Category", "Amount", "Date"],
        rows
      );
    } catch {
      alert("Failed to generate Expense Report");
    }
  };

  // ================= STOCK REPORT =================
  const stockReport = async () => {
    try {
      const res = await api.get("/products");

      const rows = res.data.data.map((p) => [
        p.name,
        p.category,
        p.stock,
        p.minStock,
        p.stock <= p.minStock ? "LOW" : "OK",
      ]);

      if (handleEmpty(rows)) return;

      generatePDF(
        "Stock_Report",
        ["Product", "Category", "Stock", "Min Stock", "Status"],
        rows
      );
    } catch {
      alert("Failed to generate Stock Report");
    }
  };

  // ================= PROFIT REPORT =================
  const profitReport = async () => {
    try {
      const res = await api.get("/sales", { params: range });
      const rows = [];

      res.data.data.forEach((sale) => {
        sale.items.forEach((item) => {
          rows.push([
            new Date(sale.saleDate).toLocaleDateString(),
            sale.invoiceNumber,
            item.product?.name || "N/A",
            item.quantity * item.sellingPrice,
            item.quantity * item.costPrice,
            (item.sellingPrice - item.costPrice) * item.quantity,
          ]);
        });
      });

      if (handleEmpty(rows)) return;

      generatePDF(
        "Profit_Report",
        ["Date", "Invoice", "Product", "Revenue", "Cost", "Profit"],
        rows
      );
    } catch {
      alert("Failed to generate Profit Report");
    }
  };

  // ================= GST REPORT =================
  const gstReport = async () => {
    try {
      const res = await api.get("/sales", { params: range });
      const rows = [];

      res.data.data.forEach((sale) => {
        sale.items.forEach((item) => {
          const taxable = item.quantity * item.sellingPrice;
          const gstAmount = (taxable * sale.gst) / 100;

          rows.push([
            sale.invoiceNumber,
            new Date(sale.saleDate).toLocaleDateString(),
            item.product?.name || "N/A",
            taxable,
            `${sale.gst}%`,
            gstAmount,
            taxable + gstAmount,
          ]);
        });
      });

      if (handleEmpty(rows)) return;

      generatePDF(
        "GST_Report",
        ["Invoice", "Date", "Product", "Taxable", "GST", "GST Amt", "Total"],
        rows
      );
    } catch {
      alert("Failed to generate GST Report");
    }
  };

  // ================= REPORT LIST =================
  const reports = [
    {
      title: "Sales Report",
      desc: "Invoice-wise sales summary",
      icon: <FaShoppingCart />,
      action: salesReport,
    },
    {
      title: "Stock Report",
      desc: "Current & low stock status",
      icon: <FaBox />,
      action: stockReport,
    },
    {
      title: "Profit Report",
      desc: "Sale-wise profit analysis",
      icon: <FaRupeeSign />,
      action: profitReport,
    },
    {
      title: "Expense Report",
      desc: "All business expenses",
      icon: <FaChartBar />,
      action: expenseReport,
    },
    {
      title: "Purchase Report",
      desc: "Supplier & bill history",
      icon: <FaShoppingCart />,
      action: purchaseReport,
    },
    {
      title: "GST Report",
      desc: "GST summary for filing",
      icon: <FaRupeeSign />,
      action: gstReport,
    },
  ];

  // ================= UI =================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold">Reports</h2>

      {/* DATE FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-end">
        <button
          onClick={() => setRange(getMonthRange(0))}
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"
        >
          This Month
        </button>
        <button
          onClick={() => setRange(getMonthRange(2))}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          Last 3 Months
        </button>
        <button
          onClick={() => setRange(getMonthRange(5))}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          Last 6 Months
        </button>
        <button
          onClick={() => setRange(getYearRange())}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          This Year
        </button>

        <div className="flex gap-2">
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="border rounded px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* REPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow space-y-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              {r.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{r.title}</h3>
              <p className="text-sm text-gray-500">{r.desc}</p>
            </div>
            <button
              onClick={r.action}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              <FaFilePdf /> Download PDF
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-700">
        📌 These reports are generated using live business data and are
        accountant-ready PDFs.
      </div>
    </motion.div>
  );
}
