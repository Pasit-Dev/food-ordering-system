'use client';

import { useState } from 'react';
import useTableStore from '../../../store/useTableStore'; // นำเข้า useTableStore

export default function AddTableModal({ isOpen, onClose, onAddTable }) {
  const { setTables } = useTableStore(); // ใช้ฟังก์ชันจาก store
  const [formData, setFormData] = useState({
    table_number: '',
    table_status: 'Available',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'table_number' ? parseInt(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ใช้ฟังก์ชัน onAddTable จาก props และส่ง formData
    onAddTable(formData);
    resetFormData(); // รีเซ็ตฟอร์มหลังจากส่งข้อมูลแล้ว
  };

  const resetFormData = () => {
    setFormData({
      table_number: '',
      table_status: 'Available',
    });
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box text-black">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Add New Table</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="py-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="table_number">
              Table Number
            </label>
            <input
              id="table_number"
              name="table_number"
              type="number"
              className="input input-bordered w-full"
              value={formData.table_number}
              onChange={handleChange}
              required
              placeholder="e.g. 7"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="table_status">
              Table Status
            </label>
            <select
              id="table_status"
              name="table_status"
              className="select select-bordered w-full"
              value={formData.table_status}
              onChange={handleChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>

          <div className="modal-action">
            <button type="button" className="btn bg-red-500 hover:bg-red-600 text-white border-none" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 border-none text-white border-none ">
              Save Table
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
