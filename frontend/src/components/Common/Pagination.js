import React from 'react';

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  const getPageNumbers = (maxPages = 7) => {
    const pages = [];
    
    if (lastPage <= maxPages) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(maxPages - 2, lastPage); i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      } else if (currentPage >= lastPage - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = lastPage - (maxPages - 3); i <= lastPage; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(lastPage);
      }
    }
    
    return pages;
  };

  const getMobilePageNumbers = () => {
    const pages = [];
    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, '...', lastPage);
      } else if (currentPage >= lastPage - 1) {
        pages.push(1, '...', lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, '...', currentPage, '...', lastPage);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const mobilePageNumbers = getMobilePageNumbers();

  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Mobile pagination */}
      <div className="flex-1 flex flex-col items-center gap-2 sm:hidden">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-0.5">Prev</span>
          </button>

          {mobilePageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`m-ellipsis-${index}`}
                  className="relative inline-flex items-center px-2 py-1.5 border border-gray-300 bg-white text-xs font-medium text-gray-500"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={`m-${page}`}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-2.5 py-1.5 border text-xs font-medium ${
                  currentPage === page
                    ? 'z-10 bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="relative inline-flex items-center px-2.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="mr-0.5">Next</span>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
        <p className="text-xs text-gray-500">
          Page {currentPage} of {lastPage}
        </p>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{lastPage}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === page
                      ? 'z-10 bg-primary border-primary text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-primary-50'
                  } text-sm font-medium`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

