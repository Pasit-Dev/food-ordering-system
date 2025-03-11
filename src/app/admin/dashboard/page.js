import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("https://test-server-2mtj.onrender.com/orders");
        const data = await response.json();
        setOrders(data);

        // คำนวณยอดขายรวมและจำนวนออเดอร์
        let revenue = 0;
        data.forEach(order => {
          revenue += order.total_amount;
        });

        setTotalRevenue(revenue);
        setTotalOrders(data.length);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, []);

  // แปลงข้อมูลออเดอร์ให้เป็นรูปแบบที่ใช้ในกราฟรายได้
  const revenueData = orders.map(order => ({
    date: format(new Date(order.order_date), "dd MMM yyyy", { locale: th }),
    revenue: order.total_amount,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-xl font-bold">฿{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
