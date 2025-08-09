import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  outline = false,
  className = '',
  ...props
}) => {
  const classes = [
    'badge',
    `badge-${variant}`,
    outline && 'badge-outline',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
