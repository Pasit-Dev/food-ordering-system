'use client';

import { useEffect, useState } from 'react';
import { useOrderStore } from '@/app/store/useOrderStore';
import { useRouter, useSearchParams } from "next/navigation";
import axios from 'axios';

export default function HistoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || '';

    const { orderItems = [], isLoading, error, fetchOrderItems, updateOrderItemStatus } = useOrderStore();

    useEffect(() => {
        if (orderId) {
            fetchOrderItems(orderId);
        }
    }, [orderId, fetchOrderItems]);

    // คำนวณราคารวม โดยกรองรายการที่ไม่ใช่ Cancelled
    const totalPrice = orderItems
        .filter(item => item.order_item_status !== 'Cancelled')
        .reduce((sum, item) => sum + Number(item.price), 0);

    const formattedTotalPrice = new Intl.NumberFormat('th-TH').format(totalPrice);

    // ฟังก์ชันเปลี่ยนสถานะเป็น "Cancelled"
    const handleCancelOrder = async (orderItemId) => {
        const confirmCancel = window.confirm("คุณต้องการยกเลิกรายการนี้หรือไม่?");
        if (confirmCancel) {
            try {
                const response = await axios.put(`http://localhost:8080/order-items/${orderItemId}/status`, {
                    new_status: 'Cancelled',
                    user: 'customer',
                    change_reason: 'ผู้ใช้ยกเลิกคำสั่งซื้อ'
                });
                
                if (response.status === 200) {
                    alert(`Order Item id: ${orderItemId} ยกเลิกรายการเรียบร้อย `);
                    fetchOrderItems(orderId);
                } else {
                    alert(`เกิดข้อผิดพลาด: ${response.data.message}`);
                }
            } catch (error) {
                alert(`เกิดข้อผิดพลาดในการติดต่อกับเซิร์ฟเวอร์: ${error.message}`);
            }
        }
    };

    // ใช้ useState เพื่อจัดเรียงรายการ
    const [sortedOrderItems, setSortedOrderItems] = useState([]);

    useEffect(() => {
        const statusOrder = ['Pending', 'Preparing', 'Served', 'Cancelled'];
        const sortedItems = [...orderItems].sort((a, b) => 
            statusOrder.indexOf(a.order_item_status) - statusOrder.indexOf(b.order_item_status)
        );
        setSortedOrderItems(sortedItems);
    }, [orderItems]);  // Correctly setting dependencies

    if (isLoading) {
        return <div className="text-center text-lg text-gray-600">กำลังโหลดข้อมูล...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;
    }

    return (
        <div className="container bg-white text-black mx-auto p-6 mb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ประวัติการสั่งซื้อ</h1>
                <div className="text-xl font-semibold text-red-500">
                    ยอดรวม: {formattedTotalPrice} บาท
                </div>
            </div>

            <div className="space-y-4">
                {sortedOrderItems.length === 0 ? (
                    <p className="text-center text-lg text-gray-500">ไม่พบรายการในคำสั่งซื้อ</p>
                ) : (
                    sortedOrderItems.map((item) => (
                        <div key={item.order_item_id} className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg">
                            <div className="p-4 flex gap-4">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                    {item.menu_image ? (
                                        <img src={item.menu_image} alt={item.menu_name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">{item.menu_name}</h3>
                                        <div className={`badge ${item.order_item_status === 'Pending' ? 'bg-yellow-500' : 
                  item.order_item_status === 'Preparing' ? 'bg-blue-500' : 
                  item.order_item_status === 'Served' ? 'bg-green-500' : 
                  'bg-red-500'} text-white`}>
    {item.order_item_status}
</div>

                                    </div>

                                    <div className="text-sm text-gray-500 mt-2">
                                        {item.menu_option_names ? (
                                            item.menu_option_names.split(', ').map((option, idx) => (
                                                <span key={idx} className="inline-block mr-2">
                                                    {option}
                                                    {item.total_additional_price !== "0" && (
                                                        <span className="text-primary"> (+{item.total_additional_price}฿)</span>
                                                    )}
                                                </span>
                                            ))
                                        ) : (
                                            <span>ไม่มีตัวเลือกที่เลือก</span>
                                        )}
                                    </div>

                                    {item.order_item_note && (
                                        <p className="text-xs italic mt-2 text-gray-600">
                                            <span className="font-semibold">หมายเหตุ:</span> {item.order_item_note}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-primary font-bold">{item.price} ฿</div>

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