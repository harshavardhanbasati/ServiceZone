import React from 'react';

export function TechBadge({ status, label, className = '' }) {
  const normStatus = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normStatus) {
      case 'PENDING':
      case 'WAITING_FOR_CUSTOMER_APPROVAL':
      case 'WAITING_FOR_PARTS':
        return 'bg-amber/10 border-amber text-amber';
      case 'CONFIRMED':
      case 'READY_FOR_PICKUP':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green/10 border-green text-green';
      case 'IN_PROGRESS':
      case 'DIAGNOSING':
        return 'bg-electric/10 border-electric text-electric';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-crimson/10 border-crimson text-crimson';
      case 'NOT_STARTED':
      default:
        return 'bg-techgrey-200 border-techgrey-400 text-techgrey-600';
    }
  };

  const displayText = label || normStatus.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-quantico font-bold tracking-wider uppercase border rounded-none select-none ${getStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-none mr-1.5 bg-current opacity-80" />
      {displayText}
    </span>
  );
}
