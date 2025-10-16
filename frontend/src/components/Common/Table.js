import React, { useState, useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const Table = ({ columns, data, onRowClick, emptyMessage = 'No data available' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const column = columns.find(col => col.accessor === sortConfig.key);
      
      // Get values - use sortValue if provided, otherwise accessor
      let aValue = column?.sortValue ? column.sortValue(a) : a[sortConfig.key];
      let bValue = column?.sortValue ? column.sortValue(b) : b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to string for comparison if needed
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  // Handle column header click for sorting
  const handleSort = (accessor, sortable) => {
    if (sortable === false) return; // Don't sort if explicitly disabled

    let direction = 'asc';
    if (sortConfig.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: accessor, direction });
  };

  // Render sort icon
  const renderSortIcon = (accessor, sortable) => {
    if (sortable === false) return null;

    if (sortConfig.key !== accessor) {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-card">
      <table className="min-w-full divide-y divide-gray-200 ">
        <thead className="bg-primary text-white">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleSort(column.accessor, column.sortable)}
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  column.sortable !== false ? 'cursor-pointer select-none text-white border-r border-white hover:bg-primary-600 transition-colors duration-150' : ''
                }`}
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column.accessor, column.sortable)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <PlusIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">{emptyMessage}</h3>
                  </div>
                </div>
              </td>
 
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-primary-50' : ' odd:bg-white even:bg-gray-50  hover:bg-primary-50'} transition-colors duration-150`}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;


