import { create } from 'zustand';
import axios from 'axios';

export const useOrderStore = create((set) => ({
    orderItems: [],
    isLoading: true,
    error: null,
    fetchOrderItems: async (orderId) => {
        console.log(`OrderId: ${orderId}`)
        set({ isLoading: true });
        try {
            const response = await axios.get(`http://localhost:8080/order-items/${orderId}`);
            console.log("Resposne Data: ", response.data)
            set({ orderItems: response.data.order_items, isLoading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data.message : error.message, isLoading: false });
        }
    }
}));
