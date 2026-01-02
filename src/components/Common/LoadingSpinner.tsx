import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'orange' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    orange: 'border-orange-500',
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-gray-700 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;