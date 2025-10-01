import React from 'react';

const Loading = ({ size = 'md', text = 'Yükleniyor...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`${sizes[size]} animate-spin rounded-full border-2 border-primary-200 border-t-primary-600`}></div>
        </div>
        {text && (
          <p className="text-slate-600 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;