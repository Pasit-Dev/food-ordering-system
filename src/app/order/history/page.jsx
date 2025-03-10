'use client';

import { useEffect, useState } from 'react';
import { useOrderStore } from '@/app/store/useOrderStore';
import { useRouter, useSearchParams } from "next/navigation";
import axios from 'axios';

export default function HistoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    
    const { orderItems, isLoading, error, fetchOrderItems } = useOrderStore();

    // ดึงข้อมูลเมื่อ `orderId` มีการเปลี่ยนแปลง
    useEffect(() => {
        if (orderId) {
            fetchOrderItems(orderId);
        }
    }, [orderId, orderItems, fetchOrderItems]);

    // คำนวณราคารวมเฉพาะรายการที่ไม่ถูกยกเลิก
    const totalPrice = (orderItems && orderItems.length > 0)
    ? orderItems
        .filter(item => item.order_item_status !== 'Cancelled')
        .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) // คำนวณตามจำนวน (quantity)
    : 0;

    const formattedTotalPrice = new Intl.NumberFormat('th-TH').format(totalPrice);

    // ยกเลิกรายการสั่งซื้อ
    const handleCancelOrder = async (orderItemId) => {
        if (!window.confirm("คุณต้องการยกเลิกรายการนี้หรือไม่?")) return;

        try {
            const response = await axios.put(`https://api.pasitlab.com/order-items/${orderItemId}/status`, {
                new_status: 'Cancelled',
                user: 'customer',
                change_reason: 'ผู้ใช้ยกเลิกคำสั่งซื้อ'
            });
            if (response.status === 200) {
                alert(`Order Item id: ${orderItemId} ยกเลิกรายการเรียบร้อย`);
                fetchOrderItems(orderId); // ดึงข้อมูลใหม่หลังจากยกเลิก
            } else {
                alert(`เกิดข้อผิดพลาด: ${response.data.message}`);
            }
        } catch (error) {
            if (error.status === 403) {
                alert(`เกิดข้อผิดพลาดกรุณารีเฟรชหน้าจอของคุณ`);
            } else {
                alert(`เกิดข้อผิดพลาดในการติดต่อกับเซิร์ฟเวอร์: ${error}`);
            }
        }
    };

    // จัดเรียงรายการตามลำดับสถานะ
    const [sortedOrderItems, setSortedOrderItems] = useState([]);
    const statusOrder = ['Pending', 'Preparing', 'Served', 'Cancelled'];

    useEffect(() => {
        setSortedOrderItems(
            [...orderItems].sort((a, b) => statusOrder.indexOf(a.order_item_status) - statusOrder.indexOf(b.order_item_status))
        );
    }, [orderItems]);

    // หากยังโหลดข้อมูลอยู่หรือมีข้อผิดพลาดให้แสดงข้อความ
    if (isLoading) return <div className="text-center text-lg text-gray-600">กำลังโหลดข้อมูล...</div>;
    if (error) return <div className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;

    return (
        <div className="container bg-white text-black mx-auto p-6 mb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
                <div className="text-xl font-semibold text-red-500">ยอดรวม: {formattedTotalPrice} บาท</div>
            </div>

            <div className="space-y-4">
                {sortedOrderItems.length === 0 ? (
                   <div className="flex w-full h-screen mt-[-70] align-center flex-col items-center justify-center gap-4">
                   <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke="currentColor"
                     className="w-16 h-16 text-gray-400"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       d="M9 9.75h6m-6 3h6M3.75 6h16.5M3.75 18h16.5M3 6v12a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6z"
                     />
                   </svg>
                   <p className="text-center text-lg text-gray-500">ไม่พบรายการในคำสั่งซื้อ</p>
                 </div>
                ) : (
                    sortedOrderItems.map((item) => (
                        <div key={item.order_item_id} className="card bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
                            <div className="p-4 flex gap-4">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                                    {item.menu_image ? (
                                        <img src={item.menu_image} alt={item.menu_name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">ไม่มีรูป</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">{item.menu_name}</h3>
                                        <span className={`badge text-white ${item.order_item_status === 'Pending' ? 'bg-yellow-500' : item.order_item_status === 'Preparing' ? 'bg-blue-500' : item.order_item_status === 'Served' ? 'bg-green-500' : 'bg-red-500'}`}>{item.order_item_status}</span>
                                    </div>

                                    <div className="text-sm text-gray-500 mt-2">
                                        {item.options?.length > 0 ? (
                                            item.options.map((option, idx) => (
                                                <span key={idx} className="inline-block mr-2">
                                                    {option.option_name} {option.additional_price > 0 && `(+${option.additional_price}฿)`}
                                                </span>
                                            ))
                                        ) : (
                                            <span>ไม่มีตัวเลือกเพิ่มเติม</span>
                                        )}
                                    </div>

                                    {item.order && (
                                        <p className="text-xs italic mt-2 text-gray-600">
                                            <span className="font-semibold">หมายเหตุ:</span> {item.order_item_note}
                                        </p>
                                    )}
                                    <div className="text-sm text-gray-500 mt-2"> 
                                        <span>note: {item.order_item_note}</span>
                                    </div>
                                    {/* แสดง quantity */}
                                    <div className="text-sm text-gray-500 mt-2">
                                        <span>จำนวน: {item.quantity}</span>
                                    </div>

                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-primary font-bold">{item.price} ฿</div> {/* คำนวณราคาโดยคูณกับ quantity */}
                                        {item.order_item_status === 'Pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(item.order_item_id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                                            >
                                                ยกเลิก
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
