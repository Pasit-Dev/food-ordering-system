'use client';
import { useEffect } from 'react';
import axios from 'axios';
import TableGrid from './components/TableGrid';
import AddTableModal from './components/AddTableModal';
import useTableStore from '../../store/useTableStore';

export default function TableManagementPage() {
  // ใช้ state จาก zustand
  const { tables, isModalOpen, loading, setTables, setIsModalOpen, setLoading } = useTableStore();

  useEffect(() => {
    // Fetch tables from the server and generate the QR code URL for each table
    const fetchTables = async () => {
      try {
        setLoading(true);
        await useTableStore.getState().fetchTables();  // เรียกฟังก์ชัน fetchTables จาก store
      } catch (error) {
        console.error('Error fetching tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [setLoading]); // เรียกใช้เมื่อ component mount

  const handleAddTable = async (newTable) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/tables', {
        table_number: newTable.table_number,
        table_status: newTable.table_status,
      });

      if (response.status === 201) {
        // Add table to state with generated QR code URL
        const domain = window.location.origin;
        const newTableWithQR = {
          ...response.data,
          qrcode: `${domain}/order?tableId=${response.data.table_id}`,
        };
        setTables([...tables, newTableWithQR]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Failed to add table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Table Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn bg-blue-600 hover:bg-blue-700 border-none text-white shadow-lg"
          disabled={loading}
        >
          {loading ? 'Adding...' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Table
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p>Loading tables...</p>
        ) : tables.length === 0 ? (
          <p>No tables available. Please add a new table.</p>
        ) : (
          <TableGrid tables={tables} />
        )}
      </div>

      <AddTableModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddTable={handleAddTable}
      />
    </div>
  );
}
