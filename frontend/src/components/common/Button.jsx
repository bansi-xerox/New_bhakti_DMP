import React from 'react';

const Button = ({
  children,
  type = 'button',
  onClick,
  className = 'btn-primary-modern',
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          <span>{children}</span>
          {icon && <span className="btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;