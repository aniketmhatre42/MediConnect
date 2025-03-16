import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export const Input = ({ type, placeholder, className, ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full p-2 border border-gray-300 rounded-md ${className}`}
      {...props}
    />
  );
};

export const Button = ({ children, onClick, disabled, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};
