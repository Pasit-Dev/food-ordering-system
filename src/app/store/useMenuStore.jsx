import { create } from "zustand";
import axios from "axios";

const useMenuStore = create((set) => ({
  menus: [],
  loading: false,
  error: null,

  fetchMenus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("https://api.pasitlab.com/menus");
      set({ menus: response.data, loading: false });
    } catch (error) {
      set({ error: "โหลดเมนูไม่สำเร็จ", loading: false });
    }
  },
}));

export default useMenuStore;
