'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import useTableStore from '../../../store/useTableStore'; // นำเข้า useTableStore

export default function TableItem({ table }) {
  const { removeTable, editTable } = useTableStore(); // ใช้ฟังก์ชันจาก store
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTable, setUpdatedTable] = useState({
    ...table,
  });

  // กำหนดสีตามสถานะของโต๊ะ
  const getStatusColor = () => {
    switch (table.table_status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-red-100 text-red-800';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'Takeaway':  // สำหรับโต๊ะที่ใช้สำหรับ "กลับบ้าน"
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // สร้าง QR Code สำหรับโต๊ะนี้
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const domain = window.location.origin;
        // เช็คว่าเป็นโต๊ะ "กลับบ้าน" หรือไม่
        const qrCodeData = table.table_number === 'takeaway' // ใช้ 'takeaway' เป็น table_number
          ? `${domain}/order?tableId=takeaway`  // ถ้าเป็นโต๊ะพิเศษให้ใช้ 'takeaway' เป็น QR Code
          : table.qrcode; // ถ้าไม่ใช่ ก็ใช้ qrcode ของโต๊ะ

        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        setQrCodeImageUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [table]);

  // ดาวน์โหลด QR Code เป็นรูปภาพ
  const downloadQRCode = () => {
    if (!qrCodeImageUrl) {
      console.error('QR Code is not generated yet');
      return;
    }

    const link = document.createElement('a');
    link.href = qrCodeImageUrl;
    link.download = `qrcode-table-${table.table_number}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // การลบโต๊ะ
  const handleDelete = () => {
    removeTable(table.table_id);
  };

  // การเปิด/ปิดโหมดแก้ไข
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  // การอัพเดตข้อมูลโต๊ะ
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTable((prev) => ({
      ...prev,
      [name]: name === 'table_number' ? parseInt(value) : value,
    }));
  };

  // การบันทึกการแก้ไข
  const handleSaveEdit = () => {
    editTable(updatedTable);
    toggleEdit(); // ปิดโหมดแก้ไข
  };

  return (
    <div className="text-black border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-600">Table {table.table_number}</h3>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {table.table_number === 'takeaway' ? 'Takeaway' : table.table_status} {/* ถ้าเป็น 'takeaway' แสดงข้อความ 'Takeaway' */}
          </span>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <p className="text-gray-600 text-sm mb-2">Table QR Code</p>
          {qrCodeImageUrl ? (
            <img
              src={qrCodeImageUrl}
              alt={`QR Code for ${table.name}`}
              className="w-32 h-32 mb-4"
            />
          ) : (
            <p>Loading QR Code...</p>
          )}
          <button
            onClick={downloadQRCode}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download QR Code
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="table_number" className="text-gray-600">Table Number</label>
            <input
              id="table_number"
              name="table_number"
              type="number"
              value={updatedTable.table_number}
              onChange={handleEditChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="table_status" className="text-gray-600">Table Status</label>
            <select
              id="table_status"
              name="table_status"
              value={updatedTable.table_status}
              onChange={handleEditChange}
              className="select select-bordered w-full"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm  bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={toggleEdit}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 border-none text-white"
              onClick={handleSaveEdit}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 flex justify-end gap-2">
        <button
          className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none"
          onClick={toggleEdit}
        >
          Edit
        </button>
        {/* <button
          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
          onClick={handleDelete}
        >
          Delete
        </button> */}
      </div>
    </div>
  );
}
