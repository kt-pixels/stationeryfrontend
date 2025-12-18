import React, { useEffect, useState } from "react";
import api from "../services/api";
import { FaPlus, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import ExpenseFormModal from "../components/ExpenseFormModal";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ================= CREATE =================
  const addExpense = async (data) => {
    await api.post("/expenses", data);
    setOpenModal(false);
    fetchExpenses();
  };

  // ================= DELETE =================
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  // ================= SEARCH FILTER =================
  const filteredExpenses = expenses.filter((e) => {
    const q = search.toLowerCase();

    return (
      e.title?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      new Date(e.date).toLocaleDateString().toLowerCase().includes(q)
    );
  });

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-16 bg-gray-200 rounded" />
        <div className="h-16 bg-gray-200 rounded" />
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
          <h2 className="text-3xl font-semibold text-gray-800">Expenses</h2>
          <p className="text-sm text-gray-500">
            Track operational & miscellaneous expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search title, category, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm"
          >
            <FaPlus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* ================= EXPENSE LIST ================= */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            No expenses match your search 🔍
          </div>
        ) : (
          filteredExpenses.map((e) => (
            <div
              key={e._id}
              className="bg-white rounded-xl shadow border hover:shadow-md transition flex justify-between items-center p-4"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-gray-800">{e.title}</p>
                <p className="text-sm text-gray-500">
                  {e.category} • {new Date(e.date).toLocaleDateString()}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-5">
                <span className="text-lg font-bold text-red-600">
                  ₹{e.amount}
                </span>

                <FaTrash
                  title="Delete"
                  className="cursor-pointer text-gray-400 hover:text-red-600 transition"
                  onClick={() => deleteExpense(e._id)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      <ExpenseFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={addExpense}
      />
    </motion.div>
  );
}
