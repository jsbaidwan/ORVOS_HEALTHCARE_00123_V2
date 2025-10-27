import React from 'react';

const Filters = ({ filters = [], onFilterChange }) => {
  const handleInputChange = (key, value) => {
    onFilterChange(key, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-3">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 p-5 gap-4">
        {filters.map((filter, index) => {
          if (filter.type === 'text') {
            return (
              <div key={index}>
                <input
                  type="text"
                  placeholder={filter.placeholder}
                  value={filter.value}
                  onChange={(e) => handleInputChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            );
          }

          if (filter.type === 'select') {
            return (
              <div key={index}>
                <select
                  value={filter.value}
                  onChange={(e) => handleInputChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

export default Filters;

