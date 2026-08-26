import React from 'react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(value);
      }}
      className={`d-flex align-items-center position-relative ${className}`}
      style={{ maxWidth: '600px', width: '100%' }}
    >
      <input
        type="text"
        className="form-control rounded-pill px-4 py-2 border-light-subtle shadow-sm fs-6"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          paddingRight: '40px',
          backgroundColor: '#ffffff',
        }}
      />
      <button
        type="submit"
        className="btn position-absolute end-0 me-2 p-1 text-muted border-0"
        title="Search"
      >
        🔍︎
      </button>
    </form>
  );
};

export default SearchBar;