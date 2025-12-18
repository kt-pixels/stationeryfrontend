import React, { useState } from "react";
import api from "../services/api";

export default function ReturnSaleModal({ sale, onClose, onSuccess }) {
  const [items, setItems] = useState(
    sale.items.map((i) => ({
      productId: i.product._id,
      name: i.product.name,
      soldQty: i.quantity,
      returnQty: 0,
      reason: "",
    }))
  );

  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-red-500";

  const labelClass = "text-sm font-medium text-gray-600";

  const updateQty = (index, value) => {
    const updated = [...items];
    updated[index].returnQty = Math.min(
      Math.max(value, 0),
      updated[index].soldQty
    );
    setItems(updated);
  };

  const updateReason = (index, value) => {
    const updated = [...items];
    updated[index].reason = value;
    setItems(updated);
  };

  const submit = async () => {
    const returnItems = items.filter((i) => i.returnQty > 0);

    if (returnItems.length === 0) {
      alert("Please enter return quantity");
      return;
    }

    setLoading(true);

    try {
      // 🔁 Process returns sequentially
      for (const item of returnItems) {
        await api.post(`/sales/${sale._id}/return`, {
          productId: item.productId,
          quantity: item.returnQty,
          reason: item.reason || "Customer Return",
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Return failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold text-red-600">
          Return Items — Invoice #{sale.invoiceNumber}
        </h3>

        {/* ITEMS */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {items.map((item, idx) => (
            <div
              key={item.productId}
              className="grid grid-cols-4 gap-3 items-end"
            >
              {/* PRODUCT */}
              <div className="space-y-1 col-span-2">
                <label className={labelClass}>Product</label>
                <input
                  value={item.name}
                  disabled
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* SOLD QTY */}
              <div className="space-y-1">
                <label className={labelClass}>Sold</label>
                <input
                  value={item.soldQty}
                  disabled
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* RETURN QTY */}
              <div className="space-y-1">
                <label className={labelClass}>Return</label>
                <input
                  type="number"
                  min="0"
                  max={item.soldQty}
                  value={item.returnQty}
                  onChange={(e) => updateQty(idx, Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              {/* REASON */}
              <div className="col-span-4">
                <input
                  type="text"
                  placeholder="Return reason (optional)"
                  value={item.reason}
                  onChange={(e) => updateReason(idx, e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Process Return"}
          </button>
        </div>
      </div>
    </div>
  );
}
