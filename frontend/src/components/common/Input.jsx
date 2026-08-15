import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group-modern">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-icon-wrapper">
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-control-modern ${leftIcon ? 'has-left-icon' : ''} ${className}`}
          {...props}
        />
        {rightIcon && <div className="input-icon-right">{rightIcon}</div>}
      </div>
    </div>
  );
};

export default Input;