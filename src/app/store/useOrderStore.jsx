import { create } from 'zustand';
import axios from 'axios';

export const useOrderStore = create((set, get) => ({
    orderItems: [],
    isLoading: true,
    error: null,
    fetchOrderItems: async (orderId) => {
        console.log(`OrderId: ${orderId}`)
        set({ isLoading: true });

        try {
            const response = await axios.get(`http://localhost:8080/order-items/${orderId}`);
            console.log("Response Data: ", response.data);
            if (response.data.order_items.length !== 0) {
                if (JSON.stringify(get().orderItems) !== JSON.stringify(response.data.order_items)) {
                    set({orderItems: response.data.order_items, isLoading: false})
                } else {
                    set({ isLoading: false})
                }
            } else {
                set({ isLoading: false })
            }
            // if (response.data.data.length === 0) {
            //     if (JSON.stringify(get().orderItems) !== JSON.stringify(response.data.order_items)) {
            //         console.log("Order ", get().orderItems)
            //         set({ orderItems: response.data.data , isLoading: false });
            //     } else {
            //         console.log("Order Items is empty");
            //         set({ isLoading: false , error: "ไม่พบรายการคำสั่งซื้อ"});
            //     }
            // }
        } catch (error) {
            console.log("Error: ", error)
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    }
}));
