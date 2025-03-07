"use client";

import { Line, Bar } from "react-chartjs-2";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";
import { Search, Bell, Phone } from "lucide-react";
import { useState } from "react";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [orders, setOrders] = useState([
    { id: "#87961", name: "Mark Allen", date: "May 25, 2023", time: "10:30 AM", amount: "$120", payment: "Online" },
    { id: "#87962", name: "John Doe", date: "May 26, 2023", time: "11:00 AM", amount: "$85", payment: "Cash" },
  ]);

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
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Orders",
        data: [500, 700, 400, 900, 600, 800],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-black">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 text-gray-500" />
          <input type="text" placeholder="Search" className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-6 h-6 text-gray-700 cursor-pointer" />
          <Phone className="w-6 h-6 text-gray-700 cursor-pointer" />
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div> */}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold">$130,800</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold">11,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Menu</h3>
            <p className="text-2xl font-bold">120</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Staff</h3>
            <p className="text-2xl font-bold">100</p>
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

      {/* Orders Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">New Orders</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Payment Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.id}</td>
                    <td>{order.name}</td>
                    <td>{order.date}</td>
                    <td>{order.time}</td>
                    <td>{order.amount}</td>
                    <td>{order.payment}</td>
                    <td>
                      <button className="btn btn-error btn-sm mr-2">Reject</button>
                      <button className="btn btn-success btn-sm">Accept</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
