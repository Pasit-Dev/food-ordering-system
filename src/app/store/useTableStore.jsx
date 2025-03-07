
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:8080/tables';

const useTableStore = create((set) => ({
  tables: [{
    table_id: '',
    table_number: 'takeaway',
    table_status: 'Available',
  }],
  isModalOpen: false,
  loading: false,
  setTables: (newTables) => set({ tables: newTables }),
  setIsModalOpen: (value) => set({ isModalOpen: value }),
  setLoading: (value) => set({ loading: value }),

  fetchTables: async () => {
    try {
      set({ loading: true });
      const response = await axios.get(API_URL);
      const domain = window.location.origin;
      const tablesWithQRCodes = response.data.map((table) => ({
        ...table,
        qrcode: `${domain}/order?tableId=${table.table_id}`,
      }));

      // เพิ่มโต๊ะ "takeaway" ถ้ายังไม่มี
      const takeawayExists = tablesWithQRCodes.some((table) => table.table_number === 'takeaway');
      if (!takeawayExists) {
        tablesWithQRCodes.push({
          table_id: 'takeaway',
          table_number: 'takeaway',
          table_status: 'Available',
          qrcode: `${domain}/order?tableId=takeaway`,
        });
      }

      // ย้าย "takeaway" โต๊ะให้อยู่ที่ตำแหน่งแรก
      const sortedTables = [tablesWithQRCodes.find((table) => table.table_number === 'takeaway'), 
                            ...tablesWithQRCodes.filter((table) => table.table_number !== 'takeaway')];

      // จัดเรียงโต๊ะตาม table_number ที่ไม่ใช่ 'takeaway'
      const finalSortedTables = sortedTables.sort((a, b) => {
        // เช็คว่า table_number เป็น 'takeaway' หรือไม่ ถ้าไม่ใช่ ให้จัดเรียงตามเลขน้อยไปมาก
        if (a.table_number === 'takeaway') return -1;
        if (b.table_number === 'takeaway') return 1;
        return a.table_number - b.table_number; // การเรียงลำดับจากน้อยไปมาก
      });

      set({ tables: finalSortedTables });
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      set({ loading: false });
    }
  },

  addTable: async (newTable) => {
    try {
      set({ loading: true });
      const response = await axios.post(API_URL, {
        table_number: newTable.table_number,
        table_status: newTable.table_status,
      });

      if (response.status === 201) {
        const domain = window.location.origin;
        const newTableWithQR = {
          ...response.data,
          qrcode: `${domain}/order?tableId=${response.data.table_id}`,
        };

        // เพิ่มโต๊ะใหม่ลงใน state
        const updatedTables = [...useTableStore.getState().tables, newTableWithQR];

        // จัดเรียงโต๊ะหลังจากเพิ่มใหม่
        const finalSortedTables = updatedTables.sort((a, b) => {
          // เช็คว่า table_number เป็น 'takeaway' หรือไม่ ถ้าไม่ใช่ ให้จัดเรียงตามเลขน้อยไปมาก
          if (a.table_number === 'takeaway') return -1;
          if (b.table_number === 'takeaway') return 1;
          return a.table_number - b.table_number; // การเรียงลำดับจากน้อยไปมาก
        });

        set((state) => ({
          tables: finalSortedTables,
        }));
      }
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Failed to add table. Please try again.');
    } finally {
      set({ loading: false });
    }
  },

  removeTable: async (tableId) => {
    try {
      await axios.delete(`${API_URL}/${tableId}`);
      set((state) => {
        const updatedTables = state.tables.filter((table) => table.table_id !== tableId);

        // จัดเรียงโต๊ะหลังจากการลบ
        const finalSortedTables = updatedTables.sort((a, b) => {
          // เช็คว่า table_number เป็น 'takeaway' หรือไม่ ถ้าไม่ใช่ ให้จัดเรียงตามเลขน้อยไปมาก
          if (a.table_number === 'takeaway') return -1;
          if (b.table_number === 'takeaway') return 1;
          return a.table_number - b.table_number; // การเรียงลำดับจากน้อยไปมาก
        });

        return { tables: finalSortedTables };
      });
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  },

  // ฟังก์ชันการแก้ไขโต๊ะ
  editTable: async (updatedTable) => {
    try {
      await axios.put(`${API_URL}/${updatedTable.table_id}`, updatedTable);
      set((state) => {
        const updatedTables = state.tables.map((table) =>
          table.table_id === updatedTable.table_id ? { ...updatedTable } : table
        );

        // จัดเรียงโต๊ะหลังจากการแก้ไข
        const finalSortedTables = updatedTables.sort((a, b) => {
          // เช็คว่า table_number เป็น 'takeaway' หรือไม่ ถ้าไม่ใช่ ให้จัดเรียงตามเลขน้อยไปมาก
          if (a.table_number === 'takeaway') return -1;
          if (b.table_number === 'takeaway') return 1;
          return a.table_number - b.table_number; // การเรียงลำดับจากน้อยไปมาก
        });

        return { tables: finalSortedTables };
      });
    } catch (error) {
      console.error('Error updating table:', error);
    }
  },
}));

export default useTableStore;
