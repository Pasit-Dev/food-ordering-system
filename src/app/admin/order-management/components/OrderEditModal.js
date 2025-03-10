import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderEditModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const [updatedStatus, setUpdatedStatus] = useState(order.status);
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method || ''); // Default to existing payment method
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);

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
  }, [order]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatedStatus(newStatus);
    setStatusLoading(true); // Start loading

    try {
      const response = await axios.put(`http://localhost:8080/orders/${order.id}/status`, {
        order_status: newStatus
      });
      setStatusLoading(false); // Stop loading
      if (response.status === 200) {
        alert("Order status updated successfully");
      } else {
        console.error('Error updating order status:', response.data.message);
        alert("Error saving order status");
      }
    } catch (error) {
      setStatusLoading(false); // Stop loading
      console.error('Error updating order status:', error);
      alert("Error saving order status");
    }
  };

  const handlePaymentMethodChange = async (e) => {
    const newPaymentMethod = e.target.value;
    setPaymentMethod(newPaymentMethod);
    setPaymentMethodLoading(true); // Start loading

    try {
      const response = await axios.put(`http://localhost:8080/orders/${order.id}/payment-method`, {
        payment_method: newPaymentMethod
      });
      setPaymentMethodLoading(false); // Stop loading
      if (response.status === 200) {
        alert("Payment method updated successfully");
      } else {
        console.error('Error updating payment method:', response.data.message);
        alert("Error saving payment method");
      }
    } catch (error) {
      setPaymentMethodLoading(false); // Stop loading
      console.error('Error updating payment method:', error);
      alert("Error saving payment method");
    }
  };

  const handleItemStatusChange = async (itemId, newStatus) => {
    try {
      const updatedItems = orderItems.map(item =>
        item.order_item_id === itemId
          ? { ...item, order_item_status: newStatus }
          : item
      );
      setOrderItems(updatedItems);

      const changeReason = 'ร้านค้าปรับสถานะรายการ';

      const response = await axios.put(`http://localhost:8080/order-items/${itemId}/status`, {
        new_status: newStatus,
        user: 'restaurant',
        change_reason: changeReason
      });

      if (response.status === 200) {
        console.log(`Order Item id: ${itemId} updated successfully`);
      } else {
        console.error('Error updating item status:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-3/4 max-w-4xl text-black">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Edit Order {order.id}</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Table</p>
              <p className="font-medium">{order.tableNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium">฿{Number(order.total).toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                <select 
                  value={updatedStatus} 
                  onChange={handleStatusChange}
                  className="select select-bordered select-sm w-full"
                  disabled={statusLoading} // Disable while loading
                >
                  <option value="Not Paid">Not Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              {statusLoading && <p>Updating status...</p>}
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <div className="mt-1">
                <select 
                  value={paymentMethod} 
                  onChange={handlePaymentMethodChange}
                  className="select select-bordered select-sm w-full"
                  disabled={paymentMethodLoading} // Disable while loading
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="promptpay">PromptPay</option>
                </select>
              </div>
              {paymentMethodLoading && <p>Updating payment method...</p>}
            </div>
          </div>

          <h4 className="font-bold mt-6 mb-2">Order Items</h4>
          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Options</th>
                    {/* <th>Status</th> */}
                    <th>Quantity</th>
                    <th>Price</th>
                    
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map(item => (
                    <tr key={item.order_item_id}>
                      <td>{item.menu_name}</td>
                      <td>
    {item.options && item.options.length > 0
        ? item.options.map(option => `${option.option_name}`).join(', ') // ใช้ map() เพื่อดึง option_name และ join() เพื่อรวมเป็นสตริง
        : 'ไม่มีตัวเลือกเพิ่มเติม'}
</td>
                      {/* <td>{item.order_item_status}</td> */}
                      <td>{item.quantity}</td>
                      <td>฿{parseFloat(item.price).toFixed(2)}</td>
                     
                      <td>
                        <select
                          value={item.order_item_status}
                          onChange={(e) => handleItemStatusChange(item.order_item_id, e.target.value)}
                          className="select select-bordered select-sm w-full"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Served">Served</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right font-semibold">Total:</td>
                    <td className="font-semibold">฿{Number(order.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default OrderEditModal;
