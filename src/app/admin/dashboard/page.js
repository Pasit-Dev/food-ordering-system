"use client";

import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "./components/Card";
import { CardContent } from "./components/CardContent";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [bestSellingMenu, setBestSellingMenu] = useState("N/A");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("https://api.pasitlab.com/orders/");
        const data = await response.json();
        const orderData = data.orders;

        const paidOrders = orderData.filter((order) => order.order_status === "Paid");
        const revenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        const orderCount = orderData.length;

        const menuCount = {};
        paidOrders.forEach((order) => {
          order.items.forEach((item) => {
            menuCount[item.name] = (menuCount[item.name] || 0) + item.quantity;
          });
        });
        
        const bestMenu = Object.keys(menuCount).reduce((a, b) => (menuCount[a] > menuCount[b] ? a : b), "N/A");

        setOrders(orderData);
        setTotalRevenue(revenue);
        setTotalOrders(orderCount);
        setBestSellingMenu(bestMenu);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
    fetchOrders();
  }, []);

  const monthlyRevenue = Array(12).fill(0);
  const monthlyOrders = Array(12).fill(0);

  orders.forEach((order) => {
    const month = new Date(order.order_date).getMonth();
    monthlyRevenue[month] += parseFloat(order.total_amount);
    monthlyOrders[month] += 1;
  });

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Revenue (฿)",
        data: monthlyRevenue,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.5,
      },
    ],
  };

  const ordersData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Orders",
        data: monthlyOrders,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-black">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">Best Selling Menu</h3>
            <p className="text-2xl font-bold">{bestSellingMenu}</p>
          </CardContent>
        </Card>
      </div>

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
