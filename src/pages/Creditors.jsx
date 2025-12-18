import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Creditors() {
  const [creditors, setCreditors] = useState([]);
  // const [amount, setAmount] = useState("");
  const [payAmounts, setPayAmounts] = useState({});

  const load = async () => {
    const res = await api.get("/creditors");
    setCreditors(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const pay = async (id) => {
    const amt = Number(payAmounts[id]);
    if (!amt) return alert("Enter amount");

    await api.post(`/creditors/${id}/pay`, { amount: amt });

    setPayAmounts({ ...payAmounts, [id]: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Creditors</h2>

      <div className="bg-white rounded-xl shadow divide-y">
        {creditors.map((c) => (
          <div key={c._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.customerName}</p>
              <p className="text-sm text-gray-500">
                Credit: ₹{c.totalCredit} | Paid: ₹{c.totalPaid}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-red-600">₹{c.balance}</span>

              <input
                type="number"
                placeholder="Pay"
                value={payAmounts[c._id] || ""}
                onChange={(e) =>
                  setPayAmounts({ ...payAmounts, [c._id]: e.target.value })
                }
                className="w-24 border px-2 py-1 rounded"
              />

              <button
                onClick={() => pay(c._id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
