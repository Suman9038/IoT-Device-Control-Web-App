import React from 'react';

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`switch ${className}`} {...props}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="switch-slider"></span>
    </label>
  );
};

export default Switch;
