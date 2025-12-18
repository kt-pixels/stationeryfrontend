import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />

      {/* RIGHT SIDE CONTENT */}
      <main className="ml-[25%] p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
