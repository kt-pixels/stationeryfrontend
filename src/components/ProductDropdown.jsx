import React from "react";
import { createPortal } from "react-dom";

export default function ProductDropdown({
  anchorRef,
  products,
  search,
  setSearch,
  onSelect,
  onClose,
}) {
  if (!anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();

  return createPortal(
    <div
      className="fixed z-9999 bg-white border rounded-lg shadow-xl"
      style={{
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      }}
    >
      <input
        autoFocus
        className="w-full px-3 py-2 border-b text-sm outline-none"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="max-h-56 overflow-y-auto">
        {products.map((p) => (
          <div
            key={p._id}
            onClick={() => onSelect(p)}
            className="px-3 py-2 cursor-pointer hover:bg-indigo-50"
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-500">₹{p.sellingPrice}</div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-400">
            No product found
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
