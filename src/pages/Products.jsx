import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import api from "../services/api";
import ProductFormModal from "../components/ProductFormModal";

export default function Products() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (data) => {
    await api.post("/products", data);
    setModalOpen(false);
    fetchProducts();
  };

  const updateProduct = async (data) => {
    await api.put(`/products/${editProduct._id}`, data);
    setEditProduct(null);
    setModalOpen(false);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();

    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  });

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
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
          <h2 className="text-3xl font-semibold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500">
            Manage your inventory & pricing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search product, category, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2.5 rounded-lg shadow-sm"
        >
          <FaPlus size={14} /> Add Product
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No products match your search 🔍
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Profit</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p, index) => {
                const lowStock = p.stock <= p.minStock;

                return (
                  <tr
                    key={p._id}
                    className={`border-t hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="p-4 font-medium text-gray-800">{p.name}</td>

                    <td className="p-4 text-center text-gray-600">
                      {p.category}
                    </td>

                    <td className="p-4 text-center font-medium">
                      ₹{p.sellingPrice}
                    </td>

                    <td className="p-4 text-center text-green-600 font-semibold">
                      {p.profitMargin.toFixed(1)}%
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          lowStock
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {p.stock}
                        {lowStock && <FaExclamationTriangle />}
                      </span>
                    </td>

                    <td className="p-4 flex justify-end gap-4">
                      <FaEdit
                        title="Edit"
                        className="text-indigo-600 cursor-pointer hover:scale-110 transition"
                        onClick={() => {
                          setEditProduct(p);
                          setModalOpen(true);
                        }}
                      />
                      <FaTrash
                        title="Delete"
                        className="text-red-600 cursor-pointer hover:scale-110 transition"
                        onClick={() => deleteProduct(p._id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditProduct(null);
        }}
        initialData={editProduct}
        onSubmit={editProduct ? updateProduct : createProduct}
      />
    </motion.div>
  );
}
