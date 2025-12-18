// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaChartLine,
  FaBox,
  FaShoppingCart,
  FaCashRegister,
  FaMoneyBillWave,
  FaChartPie,
  FaBell,
  FaFileAlt,
} from "react-icons/fa";

const menuSections = [
  {
    section: "Dashboard",
    items: [{ path: "/", label: "Dashboard", icon: <FaChartLine /> }],
  },
  {
    section: "Inventory",
    items: [
      { path: "/products", label: "Products", icon: <FaBox /> },
      { path: "/purchases", label: "Purchases", icon: <FaShoppingCart /> },
    ],
  },
  {
    section: "Sales",
    items: [
      { path: "/sales", label: "Sales & Billing", icon: <FaCashRegister /> },
    ],
  },
  {
    section: "Finance",
    items: [
      { path: "/expenses", label: "Expenses", icon: <FaMoneyBillWave /> },
      { path: "/analytics", label: "Profit & Analytics", icon: <FaChartPie /> },
    ],
  },
  {
    section: "System",
    items: [
      { path: "/capital", label: "Invest Capital", icon: <FaBell /> },
      { path: "/alerts", label: "Alerts", icon: <FaBell /> },
      { path: "/reports", label: "Reports", icon: <FaFileAlt /> },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[25%] bg-linear-to-b from-indigo-700 to-purple-800 text-white">
      <div className="h-full overflow-y-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold">Kaushik's Stationery Paradise</h1>

        {menuSections.map((section, i) => (
          <div key={i}>
            <p className="text-xs uppercase tracking-wider text-indigo-200 mb-3">
              {section.section}
            </p>

            <ul className="space-y-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-white text-indigo-700 font-semibold shadow"
                        : "hover:bg-indigo-600/60"
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
