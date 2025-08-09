import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  className = '',
  variant = 'spinner',
  ...props
}) => {
  const sizeClasses = {
    sm: { width: '16px', height: '16px' },
    md: { width: '20px', height: '20px' },
    lg: { width: '24px', height: '24px' },
    xl: { width: '32px', height: '32px' },
  };

  if (variant === 'dots') {
    return (
      <div className={`loading-dots ${className}`} {...props}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    );
  }

  return (
    <div
      className={`loading-spinner ${className}`}
      style={sizeClasses[size]}
      {...props}
    />
  );
};

export default LoadingSpinner;
