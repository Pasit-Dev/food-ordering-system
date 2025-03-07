import React from 'react';

const OrderFilter = ({ currentStatus, onStatusChange }) => {
  const statuses = ['all', 'Not Paid', 'Paid', 'Cancelled'];

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <span className="text-lg font-medium my-auto text-black">Filter by status:</span>
      <div className="join">
        {statuses.map((status) => (
          <button
            key={status}
            className={`join-item btn btn-sm ${currentStatus === status ? 'btn-active' : ''}`}
            onClick={() => onStatusChange(status)}
          >
            {status === 'all' ? 'All Orders' : status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderFilter;
