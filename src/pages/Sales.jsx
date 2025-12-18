import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import api from "../services/api";
import SaleFormModal from "../components/SaleFormModal";
import ReturnSaleModal from "../components/ReturnSaleModal";
import { generatePDF } from "../utils/pdf";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [returnSale, setReturnSale] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const fetchSales = async (from = fromDate, to = toDate) => {
    setLoading(true);

    const res = await api.get("/sales", {
      params: { from, to },
    });

    setSales(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales(today, today);
  }, []);

  const openReturnModal = (sale) => {
    setReturnSale(sale);
  };

  const printInvoice = (sale) => {
    const rows = sale.items.map((i) => [
      i.product?.name || "N/A",
      i.quantity,
      i.sellingPrice,
      i.quantity * i.sellingPrice,
    ]);

    generatePDF("Sales Invoice", ["Product", "Qty", "Rate", "Amount"], rows, {
      header: [
        `Invoice No: ${sale.invoiceNumber}`,
        `Customer: ${sale.customerName}`,
        `Payment Mode: ${sale.paymentMode}`,
        `Date: ${new Date(sale.saleDate).toLocaleDateString()}`,
      ],
      totalLabel: "Total Amount",
      totalAmount: sale.totalAmount,
      footer: "Thank you for shopping with us!",
    });
  };

  // ================= SEARCH FILTER =================
  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();

    return (
      s.invoiceNumber?.toLowerCase().includes(q) ||
      s.customerName?.toLowerCase().includes(q) ||
      s.paymentMode?.toLowerCase().includes(q) ||
      s.items.some((i) => i.product?.name?.toLowerCase().includes(q))
    );
  });

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Sales</h2>
          <p className="text-sm text-gray-500">View & manage customer sales</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search invoice, customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm"
          >
            <FaPlus size={14} /> New Sale
          </button>
        </div>
      </div>

      {/* ================= DATE FILTER ================= */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow">
        <div>
          <label className="text-xs text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          />
        </div>

        <button
          onClick={() => fetchSales(fromDate, toDate)}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Apply
        </button>

        <button
          onClick={() => {
            setFromDate(today);
            setToDate(today);
            fetchSales(today, today);
          }}
          className="mt-4 border px-4 py-2 rounded-lg text-sm"
        >
          Today
        </button>
      </div>

      {/* ================= SALES LIST ================= */}
      <div className="bg-white rounded-xl shadow divide-y">
        {filteredSales.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No sales match your search 🔍
          </div>
        ) : (
          filteredSales.map((s) => (
            <div key={s._id} className="p-5 space-y-3">
              {/* HEADER */}
              {s.paymentStatus === "UNPAID" && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  CREDIT
                </span>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Invoice #{s.invoiceNumber}</h4>
                  <p className="text-sm text-gray-500">
                    {s.customerName} • {s.paymentMode} •{" "}
                    {new Date(s.saleDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">₹{s.totalAmount}</p>
                  <p className="text-sm text-green-600">Profit: ₹{s.profit}</p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="border rounded-lg divide-y">
                {s.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between px-3 py-2 text-sm"
                  >
                    <span>
                      {i.product?.name} × {i.quantity}
                    </span>
                    <span>₹{i.quantity * i.sellingPrice}</span>
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => printInvoice(s)}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Print Invoice
                </button>

                <button
                  onClick={() => openReturnModal(s)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  Return Items
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODALS ================= */}
      <SaleFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => fetchSales(fromDate, toDate)}
      />

      {returnSale && (
        <ReturnSaleModal
          sale={returnSale}
          onClose={() => setReturnSale(null)}
          onSuccess={fetchSales}
        />
      )}
    </div>
  );
}
