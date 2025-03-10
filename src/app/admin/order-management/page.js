'use client';

import { useState, useEffect } from 'react';
import OrderFilter from './components/OrderFilter';
import OrderList from './components/OrderList';
import OrderDetailModal from './components/OrderDetailModal';
import OrderEditModal from './components/OrderEditModal';
import axios from 'axios'; // import axios
import moment from 'moment';

export default function OrdersPage() {
  const today = moment().format('YYYY-MM-DD');
  const [status, setStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMode, setSelectedMode] = useState('all');  // 'all' or 'selectDate'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);


  
  useEffect(() => {
    fetchOrders();
  }, []); // เพิ่ม empty array เพื่อให้เรียกแค่ครั้งเดียวเมื่อ component ติดตั้ง

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://api.pasitlab.com/orders');
      const data = response.data.orders;
      
      // ปรับวันที่ให้ตรงกับ Time Zone ที่คุณต้องการ
      const transformedOrders = transformOrderData(data);
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  const transformOrderData = (orderItems) => {
    const groupedOrders = {};
    orderItems.forEach(item => {
      if (!groupedOrders[item.order_id]) {
        groupedOrders[item.order_id] = {
          id: item.order_id,
          tableNumber: item.table_number || 'Takeaway', // Adjust table number from the API
          orderDate: moment(item.order_date).format('YYYY-MM-DD'), // ใช้ moment.js เพื่อจัดการเวลา
          total: 0, // เริ่มต้น total เป็น 0
          status: item.order_status,
          items: []
        };
      }

      // คำนวณ total_amount จาก items ที่ไม่ใช่ 'Cancelled'
      if (item.order_item_status !== 'Cancelled') {
        groupedOrders[item.order_id].items.push({
          id: item.order_id, 
          name: item.customer_name || 'Unknown', 
          quantity: 1,
          price: item.total_amount, // ราคาสินค้าจาก OrderItem
          options: item.order_type,
        });
        groupedOrders[item.order_id].total += item.total_amount; // รวม total
      }
    });
    return Object.values(groupedOrders);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
    if (event.target.value === 'all') {
      setSelectedDate(today);  // Reset to today when choosing "All Days"
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const closeViewModal = () => {
    
    setIsViewModalOpen(false);
  };

  const closeEditModal = () => {
    console.log("Closing edit modal");
    fetchOrders();
    setIsEditModalOpen(false);
  };
  
  

  const getFilteredOrders = () => {
    let filteredOrders = orders;
  
    // If the selected mode is 'selectDate', filter by selected date
    if (selectedMode === 'selectDate') {
      filteredOrders = filteredOrders.filter(order => order.orderDate === selectedDate);
    }
  
    // If the selected mode is not 'all', filter by order status
    if (status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status.toLowerCase() === status.toLowerCase());
    }
  
    return filteredOrders;
  };
  
  const getSortedOrders = () => {
    return getFilteredOrders().sort((a, b) => moment(b.orderDate).unix() - moment(a.orderDate).unix());
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Order Management</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        {/* Mode selection: All Days or Specific Date */}
        <div className="flex items-center space-x-4">
          <span className="mr-2 text-black">View:</span>
          <select 
            value={selectedMode} 
            onChange={handleModeChange} 
            className="select select-bordered w-auto text-black"
          >
            <option value="all">All Days</option>
            <option value="selectDate">Select Date</option>
          </select>
          
          {/* Show date picker only if 'Select Date' is selected */}
          {selectedMode === 'selectDate' && (
            <div className="flex items-center">
              <span className="mr-2 text-black">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="input input-bordered w-auto text-black"
              />
            </div>
          )}
        </div>

        <OrderFilter currentStatus={status} onStatusChange={handleStatusChange} />
      </div>

      <div className="bg-base-100 shadow-xl rounded-box p-6 text-black">
        <OrderList orders={getSortedOrders()} onViewOrder={handleViewOrder} onEditOrder={handleEditOrder} />
      </div>

      <OrderDetailModal order={selectedOrder} isOpen={isViewModalOpen} onClose={closeViewModal} />
      {selectedOrder && isEditModalOpen && (
  <OrderEditModal 
    order={selectedOrder} 
    isOpen={isEditModalOpen} 
    onClose={closeEditModal} 
  />
)}


    </div>
  );
}
