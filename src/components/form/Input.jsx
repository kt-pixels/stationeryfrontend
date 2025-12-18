import React, { useEffect, useState } from "react";
export function Input({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="
          w-full rounded-lg border border-gray-300
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500
        "
      />
    </div>
  );
}
