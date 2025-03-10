"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useMenuStore from "../store/useMenuStore";
import { Search, ShoppingBag } from "lucide-react";

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <OrderContent />
    </Suspense>
  );
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId") || "";
  const orderId = searchParams.get("orderId") || "";
  const { menus, fetchMenus, loading, error } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    async function checkOrderId() {
      try {
        const response = await fetch(window.location.href, { method: "HEAD" });
        const setOrderId = response.headers.get("Set-OrderId");
        const clearOrderId = response.headers.get("Clear-OrderId");

        if (clearOrderId) localStorage.removeItem("orderId");
        if (setOrderId) localStorage.setItem("orderId", setOrderId);
      } catch (error) {
        console.error("Error fetching order headers:", error);
      }
    }

    checkOrderId();

    if (tableId && tableId !== "takeaway") {
      fetch(`https://api.pasitlab.com/tables/${tableId}`)
        .then((res) => res.json())
        .then((data) => setTableNumber(data.table_number))
        .catch((err) => console.error("Error fetching table number:", err));
    }
    fetchMenus();
  }, [tableId, fetchMenus]);

  const handleMenuClick = (item) => {
    if (item.menu_status === "Available") {
      router.push(`/order/menu/${item.menu_id}?tableId=${tableId}&orderId=${orderId}`);
    }
  };

  const filteredMenus = Array.isArray(menus) ? menus.filter((menu) => menu.menu_name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen text-gray-800">
      <header className="fixed top-0 inset-x-0 z-10 bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">เมนูอาหาร</h1>
      </header>

      <main className="pt-24 px-4 pb-4">
        <input
          type="text"
          placeholder="ค้นหาเมนู..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-100 rounded-lg"
        />
        {loading ? (
          <p>กำลังโหลดเมนู...</p>
        ) : error ? (
          <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMenus.map((item) => (
              <div
                key={item.menu_id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm ${
                  item.menu_status === "Unavailable" ? "opacity-70" : "cursor-pointer"
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <Image src={item.image} alt={item.menu_name} width={150} height={150} className="object-cover" />
                <h2 className="font-medium text-sm p-2">{item.menu_name}</h2>
                <p className="text-blue-600 font-bold p-2">{item.price} ฿</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}