import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const combinedClassName = `bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`;
  
  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;