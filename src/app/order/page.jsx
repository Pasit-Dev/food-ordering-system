"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useMenuStore from "../store/useMenuStore";
import { Search, ShoppingBag, ChevronLeft } from "lucide-react";
import { nanoid } from "nanoid";

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
  const orderIdFromUrl = searchParams.get("orderId") || "";

  const { menus, fetchMenus, loading, error } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    let storedOrderId = localStorage.getItem("orderId");

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      localStorage.setItem("orderId", orderIdFromUrl);
    } else if (storedOrderId) {
      setOrderId(storedOrderId);
      router.replace(`/order?tableId=${tableId}&orderId=${storedOrderId}`);
    } else {
      const newOrderId = nanoid(8);
      setOrderId(newOrderId);
      localStorage.setItem("orderId", newOrderId);
      router.replace(`/order?tableId=${tableId}&orderId=${newOrderId}`);
    }
  }, [orderIdFromUrl, tableId, router]);

  useEffect(() => {
    if (tableId && tableId !== "takeaway") {
      fetch(`https://api.pasitlab.com/tables/${tableId}`)
        .then((response) => response.json())
        .then((data) => {
          setTableNumber(data.table_number);
        })
        .catch((error) => {
          console.error("Error fetching table number:", error);
        });
    }
    fetchMenus();
  }, [tableId, fetchMenus]);

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen text-gray-800">
      <header className="fixed top-0 inset-x-0 z-10 bg-white text-gray-800 shadow-md">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">เมนูอาหาร</h1>
        </div>
      </header>

      <main className="pt-48 px-4 pb-4">
        {loading ? (
          <div className="text-center py-10">กำลังโหลด...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">เกิดข้อผิดพลาด</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {menus.map((item) => (
              <div key={item.menu_id} className="bg-white rounded-xl shadow p-4">
                <Image src={item.image} alt={item.menu_name} width={100} height={100} />
                <p>{item.menu_name}</p>
                <p>{item.price} ฿</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
