import React, { useEffect, useState } from "react";
import api from "../services/api";
import ProductFormModal from "../components/ProductFormModal";

export default function SaleFormModal({ open, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [showProductModal, setShowProductModal] = useState(false);

  const [form, setForm] = useState({
    customerName: "Walk-in",
    paymentMode: "Cash",
    gst: 0,
  });

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data.data);
  };

  useEffect(() => {
    if (open) fetchProducts();
  }, [open]);

  if (!open) return null;

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none";

  /* ================= ITEMS ================= */
  const addItem = () =>
    setItems([...items, { product: null, quantity: 1, sellingPrice: 0 }]);

  const selectProduct = (i, p) => {
    const copy = [...items];
    copy[i] = { ...copy[i], product: p, sellingPrice: p.sellingPrice };
    setItems(copy);
    setActiveIndex(null);
    setSearch("");
  };

  /* ================= TOTALS ================= */
  const subTotal = items.reduce(
    (sum, i) => sum + i.quantity * i.sellingPrice,
    0
  );
  const totalAmount = subTotal + (subTotal * form.gst) / 100;

  /* ================= SUBMIT SALE ================= */
  const submit = async () => {
    if (!items.length) return alert("Add items");

    if (items.some((i) => !i.product)) {
      return alert("Please select product for all items");
    }

    await api.post("/sales", {
      ...form,
      items: items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        sellingPrice: i.sellingPrice,
      })),
      subTotal,
      totalAmount,
    });

    onSuccess();
    onClose();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const removeItem = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);

    if (activeIndex === index) {
      setActiveIndex(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6 max-h-[90vh]">
          <h2 className="text-2xl font-bold">New Sale</h2>

          {form.paymentMode === "Credit" && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              ⚠️ This sale will be added to Creditors (payment pending)
            </div>
          )}

          {/* ===== BILL INFO ===== */}
          <div className="grid grid-cols-3 gap-4">
            <input
              className={input}
              placeholder="Customer name"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />

            <select
              className={input}
              value={form.paymentMode}
              onChange={(e) =>
                setForm({ ...form, paymentMode: e.target.value })
              }
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Credit">Credit (Udhaar)</option>
            </select>

            <select
              className={input}
              value={form.gst}
              onChange={(e) => setForm({ ...form, gst: +e.target.value })}
            >
              {[0, 5, 12, 18, 28].map((g) => (
                <option key={g}>{g}%</option>
              ))}
            </select>
          </div>

          {/* ===== ITEMS ===== */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Items</h3>
              <button
                onClick={addItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                + Add Item
              </button>
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-3">
              {items.map((item, i) => (
                // <div key={i} className="border rounded-xl p-4 space-y-3">
                <div
                  key={i}
                  className="border rounded-xl p-4 space-y-3 relative"
                >
                  {/* ❌ REMOVE BUTTON */}
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    ✕
                  </button>

                  {/* PRODUCT */}
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownStyle({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width,
                      });
                      setActiveIndex(i);
                    }}
                    className={`${input} text-left`}
                  >
                    {item.product?.name || "Select product"}
                  </button>

                  {/* QTY + PRICE */}
                  <div className="flex gap-4">
                    <input
                      type="number"
                      className={input}
                      value={item.quantity}
                      onChange={(e) => {
                        const c = [...items];
                        c[i].quantity = +e.target.value;
                        setItems(c);
                      }}
                    />

                    <input
                      readOnly
                      className={`${input} bg-gray-100`}
                      value={item.sellingPrice}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== TOTAL ===== */}
          <div className="flex justify-end">
            <div className="bg-gray-50 px-4 py-3 rounded-lg text-right">
              <div className="text-sm">Subtotal: ₹{subTotal}</div>
              <div className="text-lg font-bold">Total: ₹{totalAmount}</div>
            </div>
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="border px-4 py-2 rounded-lg">
              Cancel
            </button>
            <button
              onClick={submit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Complete Sale
            </button>
          </div>
        </div>

        {/* ===== DROPDOWN ===== */}
        {activeIndex !== null && (
          <div
            className="fixed z-9999 bg-white border rounded-lg shadow-xl"
            style={dropdownStyle}
          >
            <input
              autoFocus
              className="w-full px-3 py-2 border-b outline-none"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="max-h-56 overflow-y-auto">
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => selectProduct(activeIndex, p)}
                  className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">₹{p.sellingPrice}</div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div
                  onClick={() => {
                    setShowProductModal(true);
                    setActiveIndex(null);
                  }}
                  className="px-3 py-2 text-indigo-600 cursor-pointer hover:bg-indigo-50 text-sm"
                >
                  + Add new product
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== PRODUCT FORM MODAL (REUSED) ===== */}
      <ProductFormModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={async (data) => {
          const res = await api.post("/products", data);
          await fetchProducts();
          setShowProductModal(false);

          // auto-select newly added product
          selectProduct(activeIndex ?? items.length - 1, res.data.data);
        }}
      />
    </>
  );
}
