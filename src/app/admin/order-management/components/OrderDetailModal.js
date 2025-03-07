import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from './StatusBadge';

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order && order.id) {
      const fetchOrderItems = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8080/order-items/${order.id}`);
          setOrderItems(response.data.order_items);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching order items:', error);
          setLoading(false);
        }
      };

      fetchOrderItems();
    }
  }, [order]); // Run the effect when `order` changes

  // คำนวณ total price จาก orderItems
  const calculateTotalPrice = () => {
    const totalPrice = orderItems
      .filter(item => item.order_item_status !== 'Cancelled') // กรองเฉพาะรายการที่ไม่ใช่ 'Cancelled'
      .reduce((sum, item) => sum + (Number(item.price) + Number(item.total_additional_price)), 0); // คำนวณราคา
    return totalPrice.toFixed(2); // คืนค่าราคาในรูปแบบ 2 ตำแหน่งทศนิยม
  };

  if (!order) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-3/4 max-w-4xl text-black"> {/* เพิ่มขนาดที่นี่ */}
        <h3 className="font-bold text-lg">Order {order.id}</h3>
        <div className="py-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <p className="text-sm text-gray-500">Table</p>
              <p>{order.tableNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p>{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p>${loading ? 'Loading...' : calculateTotalPrice()}</p> {/* แสดง total price ที่คำนวณได้ */}
            </div>
          </div>
          
          <h4 className="font-bold mt-4 mb-2">Order Items</h4>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Menu Price</th>
                  <th>Options</th>
                  <th>Additional Price</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map(item => (
                  <tr key={item.order_item_id}>
                    <td>{item.menu_name}</td>
                    <td className={item.order_item_status === 'Cancelled' ? 'text-red-500' : ''}>{item.order_item_status}</td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>${parseFloat(item.menu_price).toFixed(2)}</td>
                    <td>{item.menu_option_names}</td>
                    <td>${parseFloat(item.total_additional_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default OrderDetailModal;
