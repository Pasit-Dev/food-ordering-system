import React from 'react';

const StatusBadge = ({ status }) => {
  const badgeClasses = {
    'Not Paid': 'badge-warning',  // Class for "Not Paid"
    'Paid': 'badge-success',      // Class for "Paid"
    'Cancelled': 'badge-error',   // Class for "Cancelled"
  };

  return (
    <div className={`badge ${badgeClasses[status]}`}>
      {status}
    </div>
  );
};

export default StatusBadge;
