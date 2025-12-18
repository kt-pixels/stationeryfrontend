import React, { useState, useEffect } from "react";

const categories = [
  "Pen",
  "Notebook",
  "Paper",
  "Art",
  "Office",
  "School",
  "Other",
];

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const [form, setForm] = useState({
    name: "",
    category: "Pen",
    brand: "",
    costPrice: "",
    sellingPrice: "",
    stock: "",
    minStock: 10,
    supplierName: "",
    gst: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "Pen",
        brand: initialData.brand || "",
        costPrice: initialData.costPrice || "",
        sellingPrice: initialData.sellingPrice || "",
        stock: initialData.stock || "",
        minStock: initialData.minStock || 10,
        supplierName: initialData.supplierName || "",
        gst: initialData.gst || 0,
      });
    }
  }, [initialData]);

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const labelClass = "text-sm font-medium text-gray-600";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold">
          {initialData ? "Edit Product" : "Add Product"}
        </h3>

        <div className="grid grid-cols-2 gap-5">
          {/* PRODUCT NAME */}
          <div className="space-y-1 col-span-2">
            <label className={labelClass}>Product Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Ball Pen"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-1">
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* BRAND */}
          <div className="space-y-1">
            <label className={labelClass}>Brand</label>
            <input
              className={inputClass}
              placeholder="e.g. Cello"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>

          {/* COST PRICE */}
          <div className="space-y-1">
            <label className={labelClass}>Cost Price (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="Purchase cost"
              value={form.costPrice}
              onChange={(e) =>
                setForm({ ...form, costPrice: Number(e.target.value) })
              }
            />
          </div>

          {/* SELLING PRICE */}
          <div className="space-y-1">
            <label className={labelClass}>Selling Price (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="Customer price"
              value={form.sellingPrice}
              onChange={(e) =>
                setForm({ ...form, sellingPrice: Number(e.target.value) })
              }
            />
          </div>

          {/* STOCK */}
          <div className="space-y-1">
            <label className={labelClass}>Current Stock</label>
            <input
              type="number"
              className={inputClass}
              placeholder="Available quantity"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Number(e.target.value) })
              }
            />
          </div>

          {/* MIN STOCK */}
          <div className="space-y-1">
            <label className={labelClass}>Minimum Stock Alert</label>
            <input
              type="number"
              className={inputClass}
              placeholder="Low stock threshold"
              value={form.minStock}
              onChange={(e) =>
                setForm({ ...form, minStock: Number(e.target.value) })
              }
            />
          </div>

          {/* SUPPLIER */}
          <div className="space-y-1 col-span-2">
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

          {/* GST */}
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

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(form)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
