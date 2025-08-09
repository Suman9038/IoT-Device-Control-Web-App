import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const classes = [
    'input',
    error && 'input-error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <input
      ref={ref}
      type={type}
      className={classes}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
