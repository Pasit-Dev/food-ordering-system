'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, History } from "lucide-react"; // import History icon
import useCartStore from "../store/useCartStore"; // import Zustand store

export default function BottomNav() {
  const pathname = usePathname(); // Get the current path
  const [tableId, setTableId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [cartCount, setCartCount] = useState(0); // state to store cart count

  const cartItems = useCartStore((state) => state.cartItems); // Get cartItems from Zustand store

  // Run this only on the client side
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableIdFromUrl = urlParams.get("tableId");
    const orderIdFromUrl = urlParams.get("orderId");

    setTableId(tableIdFromUrl);
    setOrderId(orderIdFromUrl);
  }, []); // Empty dependency array means this will run only once after the component mounts

  // Update cart count whenever cartItems changes
  useEffect(() => {
    setCartCount(cartItems.length);
  }, [cartItems]); // The effect will run every time cartItems changes

  // If tableId and orderId are not available yet, don't render links
  if (!tableId || !orderId) {
    return null; // or render a loading spinner, etc.
  }

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 z-20">
      <Link href={`/order?tableId=${tableId}&orderId=${orderId}`} className="flex flex-col items-center">
        <Home size={24} className={pathname === "/order" ? "text-blue-500" : "text-gray-500"} />
        <span className={pathname === "/order" ? "text-blue-500" : "text-gray-500"}>Menu</span>
      </Link>
      <Link href={`/order/cart?tableId=${tableId}&orderId=${orderId}`} className="flex flex-col items-center relative">
        <ShoppingCart size={24} className={pathname === "/order/cart" ? "text-blue-500" : "text-gray-500"} />
        {cartCount > 0 && (
          <span className="absolute top-[-8] right-[-4] bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span className={pathname === "/order/cart" ? "text-blue-500" : "text-gray-500"}>Cart</span>
      </Link>
      <Link href={`/order/history?tableId=${tableId}&orderId=${orderId}`} className="flex flex-col items-center">
        <History size={24} className={pathname === "/order/history" ? "text-blue-500" : "text-gray-500"} />
        <span className={pathname === "/order/history" ? "text-blue-500" : "text-gray-500"}>History</span>
      </Link>
    </nav>
  );
}
