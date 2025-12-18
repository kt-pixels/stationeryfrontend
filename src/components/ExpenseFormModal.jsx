import React, { useState } from "react";

export default function ExpenseFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
  });

  if (!open) return null;

  const submit = () => {
    if (!form.title || !form.category || !form.amount) {
      alert("All fields are required");
      return;
    }

    onSubmit({
      ...form,
      amount: Number(form.amount),
    });

    setForm({ title: "", category: "", amount: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold">Add Expense</h3>

        {/* TITLE */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">
            Expense Title
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Electricity Bill"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* CATEGORY */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Category</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Rent, Electricity, Salary..."
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        {/* AMOUNT */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">
            Amount (₹)
          </label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}
