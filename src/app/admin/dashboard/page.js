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
        const ordersResponse = await fetch("https://api.pasitlab.com/orders/");
        if (!ordersResponse.ok) throw new Error(`HTTP error! Status: ${ordersResponse.status}`);

        const ordersData = await ordersResponse.json();

        if (!ordersData || !Array.isArray(ordersData.orders)) throw new Error("Invalid data format received!");

        const orderData = ordersData.orders;

        // คำนวณยอดขายรวมจากออเดอร์ที่จ่ายเงินแล้ว
        const paidOrders = orderData.filter(order => order.order_status === "Paid");
        const revenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        // คำนวณจำนวนออเดอร์ทั้งหมด
        const orderCount = paidOrders.length;

        setOrders(paidOrders);
        setTotalRevenue(revenue);
        setTotalOrders(orderCount);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]); // ตั้งค่าเริ่มต้นเป็นอาร์เรย์ว่างถ้ามีข้อผิดพลาด
      }
    }

    async function fetchBestSellingMenu() {
      try {
        const response = await fetch("https://api.pasitlab.com/order-items/best-selling-menu");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (data.best_selling_menus && data.best_selling_menus.length > 0) {
          // เลือกเมนูที่ขายดีที่สุด
          setBestSellingMenu(data.best_selling_menus[0].menu_name);
        } else {
          setBestSellingMenu("N/A");
        }
      } catch (error) {
        console.error("Error fetching best selling menu:", error);
        setBestSellingMenu("N/A");
      }
    }

    fetchOrders();
    fetchBestSellingMenu();
  }, []);

  // สร้างข้อมูลสำหรับกราฟ
  const monthlyRevenue = Array(12).fill(0);
  const monthlyOrders = Array(12).fill(0);

  orders.forEach((order) => {
    if (!order.order_date) return;
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
      {/* Stats */}
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
