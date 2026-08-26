import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage = false,
  hasPrevPage = false,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const buttonStyle = {
    minWidth: '38px',
    height: '38px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    padding: '0 8px',
  };

  const activeStyle = {
    ...buttonStyle,
    backgroundColor: '#f97316',
    borderColor: '#f97316',
    color: '#ffffff',
    boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
  };

  const disabledStyle = {
    ...buttonStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div className="d-flex align-items-center justify-content-center gap-2 my-3">
      {/* Previous Button (<) */}
      <button
        type="button"
        style={hasPrevPage ? buttonStyle : disabledStyle}
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
        title="Previous Page"
      >
        ❮
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          style={pageNum === currentPage ? activeStyle : buttonStyle}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      {/* Next Button (>) */}
      <button
        type="button"
        style={hasNextPage ? buttonStyle : disabledStyle}
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        title="Next Page"
      >
        ❯
      </button>
    </div>
  );
};

export default Pagination;