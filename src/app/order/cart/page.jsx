"use client";

import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import useCartStore from "../../store/useCartStore";

export default function CartPage() {
  return (
    <Suspense fallback={<div>Loading ... </div>}>
      <CartContent />
    </Suspense>
  )
}

function CartContent() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId') || '';
  const orderId = searchParams.get('orderId') || '';

  const { cartItems, setCartItems, removeItem, updateItem, loadCart } = useCartStore();

  // โหลดตะกร้าจาก localStorage เมื่อหน้าโหลด
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
  
    // ตรวจสอบว่า index ที่ได้รับมีรายการใน cartItems หรือไม่
    const item = cartItems[index];
    if (!item) {
      console.error("Item at index", index, "is undefined");
      return;
    }
  
    // คำนวณราคาที่อัปเดตตาม quantity ใหม่
    const basePrice = parseFloat(item.base_price);
    let addOnPrice = 0;
  
    item.selected_options.forEach((opt) => {
      addOnPrice += parseInt(opt.additional_price);
    });
    console.log(addOnPrice)
  
    // คำนวณ total_price ใหม่
    const newTotalPrice = ((basePrice + addOnPrice) * newQuantity).toFixed(0);
  
    // อัปเดตข้อมูลเฉพาะรายการที่ตรงกับ index
    updateItem(index, {
      quantity: newQuantity,
      total_price: newTotalPrice,
    });
  };
  
  

  const handleEditNote = (index) => {
    const updatedItems = cartItems.map((item, idx) => {
      if (idx === index) {
        return { ...item, isEditingNote: true, newNote: item.note }; // ตั้งค่าการแก้ไขหมายเหตุ
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  const handleNoteChange = (e, index) => {
    const updatedItems = [...cartItems];
    updatedItems[index].newNote = e.target.value; // อัปเดตหมายเหตุใหม่เฉพาะที่ตำแหน่ง index
    setCartItems(updatedItems); // อัปเดต state ใหม่
  };

  const handleSaveNote = (index) => {
    const updatedItems = [...cartItems];
    updatedItems[index] = {
      ...updatedItems[index],
      note: updatedItems[index].newNote,
      isEditingNote: false,
    }; // บันทึกหมายเหตุและปิดโหมดแก้ไข
    setCartItems(updatedItems); // อัปเดต state ใหม่
  };

  const handleCancelEdit = (index) => {
    const updatedItems = [...cartItems];
    updatedItems[index].isEditingNote = false; // ยกเลิกการแก้ไขหมายเหตุ
    setCartItems(updatedItems); // อัปเดต state ใหม่
  };

  const handleRemoveItem = (index) => {
    removeItem(index);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("กรุณาเพิ่มรายการอาหารก่อนสั่ง");
      return;
    }
    const checkName = await axios.get(`https://api.pasitlab.com/orders/status/${orderId}`);
    console.log("customer name ", checkName.data.customer)
    let customerName = '';
    if (!checkName.data.customer) {
      console.log('have customer name',)
     
      customerName = prompt("กรุณากรอกชื่อผู้ใช้:");
      if (!customerName) {
        alert("กรุณากรอกชื่อผู้ใช้เพื่อดำเนินการสั่งซื้อ");
        return;
      }
    } 


    const orderData = {
      order_id: orderId,
      customer_name: customerName,
      table_id: tableId,
      items: cartItems.map(item => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        note: item.note,
        price: Number(item.total_price),
        options: item.selected_options.map(option => ({
          menu_option_id: option.option_id,
          additional_price: Number(option.additional_price) || 0,
        })),
      })),
    };

    try {
      const response = await axios.post('https://api.pasitlab.com/orders', orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        alert('สั่งซื้อสำเร็จ!');
        localStorage.removeItem('cart');
        setCartItems([]);
      } else {
        alert(response.data.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="w-full pt-10 pb-34 bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-10 bg-white text-gray-800 shadow-md">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">ตะกร้าของคุณ</h1>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-4 pb-2">
          {tableId === "takeaway" ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm">
              <span>สั่งกลับบ้าน (Take Away)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md text-sm">
              <span>กินที่ร้าน (Dine-in)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content with Scroll */}
      <main className="flex-grow pt-20 px-4 pb-4 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-gray-500">ไม่มีรายการในตะกร้า</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="flex gap-3 p-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.menu_name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{item.menu_name}</h3>
                      <button onClick={() => handleRemoveItem(idx)} className="btn btn-xs btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Options */}
                    <div className="text-xs text-gray-500 mt-1">
                      {item.selected_options.map(opt => (
                        <p key={opt.option_id}>{opt.option_name}</p>
                      ))}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-2">
                      <button onClick={() => handleQuantityChange(idx, item.quantity - 1)} className="btn btn-xs btn-ghost">-</button>
<span className="text-sm font-medium">{item.quantity}</span>
<button onClick={() => handleQuantityChange(idx, item.quantity + 1)} className="btn btn-xs btn-ghost">+</button>

                      </div>
                      <span className="font-semibold">{item.total_price} ฿</span>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      {item.isEditingNote ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={item.newNote || ''}
                            onChange={(e) => handleNoteChange(e, idx)}
                            className="input input-sm border-gray-300 w-full"
                            placeholder="หมายเหตุ"
                          />
                          <button onClick={() => handleSaveNote(idx)} className="btn btn-xs btn-success ml-2">บันทึก</button>
                          <button onClick={() => handleCancelEdit(idx)} className="btn btn-xs btn-ghost ml-2">ยกเลิก</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">{item.note || 'ไม่มีหมายเหตุ'}</p>
                          <button onClick={() => handleEditNote(idx)} className="btn btn-xs btn-link text-blue-600">แก้ไข</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mt-6">
              <span className="text-lg font-semibold">รวมทั้งหมด</span>
              <span className="text-lg font-semibold">{calculateTotal()} ฿</span>
            </div>

            {/* Checkout Button */}
            <div className="flex justify-center mt-6">
              <button onClick={handleCheckout} className="btn btn-primary bg-blue-600 hover:bg-blue-700 border-none">ดำเนินการชำระเงิน</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 