import React, { useEffect, useState } from "react";
import api from "../services/api";
import clsx from "clsx";

export default function PurchaseFormModal({ open, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    supplierName: "",
    gst: 0,
  });

  useEffect(() => {
    if (open) {
      api.get("/products").then((res) => setProducts(res.data.data));
    }
  }, [open]);

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const labelClass = "text-sm font-medium text-gray-600";

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, costPrice: 0 }]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + i.quantity * i.costPrice,
    0
  );

  const submit = async () => {
    if (!form.supplierName || items.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    await api.post("/purchases", {
      ...form,
      items,
      totalAmount,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold">Add Purchase</h3>

        {/* ================= BILL INFO ================= */}
        <div className="grid grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className={labelClass}>Bill Number</label>
            <input
              className={clsx("bg-gray-100 cursor-not-allowed", inputClass)}
              value="Auto Generated"
              disabled
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Supplier Name</label>
            <input
              className={inputClass}
              placeholder="e.g. ABC Traders"
              value={form.supplierName}
              onChange={(e) =>
                setForm({ ...form, supplierName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>GST Rate</label>
            <select
              className={inputClass}
              value={form.gst}
              onChange={(e) =>
                setForm({ ...form, gst: Number(e.target.value) })
              }
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g} value={g}>
                  {g}%
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= ITEMS ================= */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Purchase Items</h4>
            <button
              onClick={addItem}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Add Item
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-sm text-gray-500">
              No items added yet. Click “Add Item”.
            </p>
          )}

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              {/* PRODUCT */}
              <div className="space-y-1">
                <label className={labelClass}>Product</label>
                <select
                  className={inputClass}
                  value={item.product}
                  onChange={(e) => updateItem(i, "product", e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* QTY */}
              <div className="space-y-1">
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(i, "quantity", Number(e.target.value))
                  }
                />
              </div>

              {/* COST */}
              <div className="space-y-1">
                <label className={labelClass}>Cost Price (₹)</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Cost per unit"
                  value={item.costPrice}
                  onChange={(e) =>
                    updateItem(i, "costPrice", Number(e.target.value))
                  }
                />
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeItem(i)}
                className="text-sm text-red-600 hover:text-red-800 pb-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* ================= TOTAL ================= */}
        <div className="flex justify-end">
          <div className="bg-gray-50 px-4 py-2 rounded-lg font-semibold">
            Total Amount: ₹{totalAmount}
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
