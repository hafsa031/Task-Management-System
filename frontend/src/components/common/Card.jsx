import React from 'react';

export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-md rounded-xl p-6 border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}