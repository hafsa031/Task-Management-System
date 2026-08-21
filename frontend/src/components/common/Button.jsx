import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary-button", 
  isLoading = false,
  className = "" 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${variant} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}