import React from 'react';
import StatusBadge from './StatusBadge';

const OrderList = ({ orders, onViewOrder, onEditOrder }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Table</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                
                <td>{order.tableNumber}</td>
                <td>{order.customer_name}</td>
                <td>{order.orderDate}</td>
                <td><StatusBadge status={order.status} /></td>
                <td>฿{Number(order.total).toFixed(2)}</td>
                <td>
                  <button 
                    className="btn btn-sm mr-2"
                    onClick={() => onViewOrder(order)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm mr-2"
                    onClick={() => onEditOrder(order)}
                    disabled={order.status === 'Paid' || order.status === 'Cancelled'} // disable ปุ่มถ้าสถานะเป็น Paid หรือ Cancelled
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
