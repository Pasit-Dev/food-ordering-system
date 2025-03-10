import { create } from "zustand";

const useCartStore = create((set) => ({
  cartItems: [],

  // ฟังก์ชันตั้งค่ารายการในตะกร้า
  setCartItems: (items) => {
    set({ cartItems: items });
    localStorage.setItem("cart", JSON.stringify(items)); // อัปเดต localStorage
  },

  // ฟังก์ชันเพิ่มรายการใหม่
  addItem: (item) =>
    set((state) => {
      const newCart = [...state.cartItems, item];
      localStorage.setItem("cart", JSON.stringify(newCart)); // อัปเดต localStorage
      return { cartItems: newCart };
    }),

  // ฟังก์ชันลบรายการจากตะกร้าตาม index
removeItem: (index) =>
  set((state) => {
    const newCart = state.cartItems.filter((_, idx) => idx !== index);
    localStorage.setItem("cart", JSON.stringify(newCart)); // อัปเดต localStorage
    return { cartItems: newCart };
  }),


  // ฟังก์ชันอัปเดตรายการในตะกร้า
  updateItem: (index, newData) =>
    set((state) => {
      const newCart = state.cartItems.map((item, idx) =>
        idx === index ? { ...item, ...newData } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart)); // อัปเดต localStorage
      return { cartItems: newCart };
    }),
  
  // ฟังก์ชันโหลดข้อมูลตะกร้าจาก localStorage
  loadCart: () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      set({ cartItems: JSON.parse(storedCart) });
    }
  },
}));

export default useCartStore;
