import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../services/api";
import PurchaseFormModal from "../components/PurchaseFormModal";
import { generatePDF } from "../utils/pdf";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchPurchases = async () => {
    try {
      const res = await api.get("/purchases");
      setPurchases(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // ================= SEARCH FILTER =================
  const filteredPurchases = purchases.filter((p) => {
    const q = search.toLowerCase();

    return (
      p.supplierName?.toLowerCase().includes(q) ||
      p.billNumber?.toLowerCase().includes(q) ||
      p.items.some((i) => i.product?.name?.toLowerCase().includes(q))
    );
  });

  // ================= PRINT =================
  const printPurchaseInvoice = (purchase) => {
    const rows = purchase.items.map((i) => [
      i.product?.name || "N/A",
      i.quantity,
      `₹${i.costPrice}`,
      `₹${i.quantity * i.costPrice}`,
    ]);

    generatePDF(
      "Purchase Invoice",
      ["Product", "Qty", "Rate", "Amount"],
      rows,
      {
        header: [
          `Bill No: ${purchase.billNumber}`,
          `Supplier: ${purchase.supplierName}`,
          `Date: ${new Date(purchase.purchaseDate).toLocaleDateString()}`,
        ],
        totalLabel: "Total Amount",
        totalAmount: purchase.totalAmount,
        footer: "This is a computer generated purchase invoice.",
      }
    );
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Purchases</h2>
          <p className="text-sm text-gray-500">
            Supplier bills & stock inward entries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search supplier, bill, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm"
          >
            <FaPlus size={14} /> Add Purchase
          </button>
        </div>
      </div>

      {/* ================= PURCHASE LIST ================= */}
      <div className="space-y-4">
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            No purchases match your search 🔍
          </div>
        ) : (
          filteredPurchases.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start p-5 bg-gray-50 border-b">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {p.supplierName}
                  </h3>

                  <div className="text-sm text-gray-500 flex gap-3">
                    <span>
                      Bill: <b>{p.billNumber}</b>
                    </span>
                    <span>•</span>
                    <span>{new Date(p.purchaseDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ₹{p.totalAmount}
                  </p>

                  <button
                    onClick={() => printPurchaseInvoice(p)}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-100"
                  >
                    🖨️ Print Invoice
                  </button>
                </div>
              </div>

              {/* ITEMS */}
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {p.items.map((i, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="py-2 text-gray-700">
                          {i.product?.name || "N/A"}
                        </td>
                        <td className="py-2 text-center">{i.quantity}</td>
                        <td className="py-2 text-right">₹{i.costPrice}</td>
                        <td className="py-2 text-right font-medium">
                          ₹{i.costPrice * i.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      <PurchaseFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchPurchases}
      />
    </motion.div>
  );
}
