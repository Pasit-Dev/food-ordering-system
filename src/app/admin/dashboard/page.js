"use client";

import { Line, Bar } from "react-chartjs-2";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";
import { useState } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function Select({ value, onChange, children }) {
  return (
    <select
      className="p-2 border rounded-md"
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}
export default function Dashboard() {
  const [year, setYear] = useState("2024");

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Revenue",
        data: [100, 200, 300, 500, 700, 800, 900, 1000, 400, 600, 700, 900],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.5
      },
    ],
  };

  const ordersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Orders",
        data: [500, 700, 400, 900, 600, 800, 1100, 1200, 900, 1000, 750, 850],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-black">
      {/* Year Selector */}
      <div className="flex justify-end">
        <Select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold">฿130,800</p> {/* Changed $ to ฿ */}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold">100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Best Selling Menu</h3>
            <p className="text-2xl font-bold">ข้าวผัด</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <Line data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <Bar data={ordersData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
