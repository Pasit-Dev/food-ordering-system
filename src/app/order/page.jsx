"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useMenuStore from "../store/useMenuStore";
import { Search, ShoppingBag, ChevronLeft } from "lucide-react"; // เพิ่ม icon

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId") || "";
  const orderId = searchParams.get("orderId") || "";

  const { menus, fetchMenus, loading, error } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [tableNumber, setTableNumber] = useState(""); // สถานะเก็บหมายเลขโต๊ะ

  useEffect(() => {
    // ดึงหมายเลขโต๊ะจาก API
    if (tableId && tableId !== "takeaway") {
      fetch(`https://api.pasitlab.com/tables/${tableId}`)
        .then((response) => response.json())
        .then((data) => {
          setTableNumber(data.table_number); // เก็บหมายเลขโต๊ะ
        })
        .catch((error) => {
          console.error("Error fetching table number:", error);
        });
    }
    fetchMenus();
  }, [tableId, fetchMenus]);

  const handleMenuClick = (item) => {
    if (item.menu_status === "Available") {
      router.push(`/order/menu/${item.menu_id}?tableId=${tableId}&orderId=${orderId}`);
    }
  };

  // กรองเมนูตามการค้นหา
  const filteredMenus = menus.filter(menu => {
    return menu.menu_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full pb-20 bg-gray-50 min-h-screen text-gray-800">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-10 bg-white text-gray-800 shadow-md">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            {/* <Link href={`/?tableId=${tableId}&orderId=${orderId}`} className="text-gray-600">
              <ChevronLeft size={24} />
            </Link> */}
            <h1 className="text-xl font-bold">เมนูอาหาร</h1>
          </div>
          {/* <Link 
            href={`/order/cart?tableId=${tableId}&orderId=${orderId}`} 
            className="relative p-2 rounded-full bg-blue-50 text-blue-600"
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Link> */}
        </div>

        {/* Status badge */}
        <div className="px-4 pb-2">
          {tableId === "takeaway" ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm">
              <ShoppingBag size={16} />
              <span>สั่งกลับบ้าน (Take Away)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18M3 11h18M3 15h18M3 19h18"></path>
              </svg>
              <span>กินที่ร้าน (Dine-in) โต๊ะ {tableNumber || tableId}</span>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-48 px-4 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดเมนู...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            <p className="font-medium">เกิดข้อผิดพลาด</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => fetchMenus()}
              className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm"
            >
              ลองใหม่
            </button>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13h.01M12 18a6 6 0 100-12 6 6 0 000 12z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mt-4">ไม่พบเมนูที่ค้นหา</h3>
            <p className="text-gray-500 mt-1">ลองค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMenus.map((item) => (
              <div
                key={item.menu_id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                  item.menu_status === "Unavailable" ? "opacity-70" : "cursor-pointer"
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <div className="relative h-32 w-full">
                  <Image 
                    src={item.image} 
                    alt={item.menu_name} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {item.menu_status === "Unavailable" && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        สินค้าหมด
                      </div>
                    </div>
                  )}
                  {item.is_recommended && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        แนะนำ
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="font-medium text-sm line-clamp-1">{item.menu_name}</h2>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-blue-600 font-bold">{item.price} ฿</p>
                    {item.menu_status === "Available" && (
                      <button className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
