import React, { useEffect, useState } from "react";

export function Select({ label, value, onChange, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <select
        value={value}
        onChange={onChange}
        className="
          w-full rounded-lg border border-gray-300
          px-3 py-2 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500
        "
      >
        {children}
      </select>
    </div>
  );
}
