import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const Table = ({ columns, data, onRowClick, emptyMessage = 'No data available', isDataLoaded, permissions, forceLoading = 'not_loading', tableClass = "min-w-full" }) => {

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const column = columns.find(col => col.accessor === sortConfig.key);

    const indexed = data.map((row, originalIndex) => ({ row, originalIndex }));

    const sorted = indexed.sort((a, b) => {
      let aValue = column?.sortValue
        ? column.sortValue(a.row, a.originalIndex)
        : a.row[sortConfig.key];
      let bValue = column?.sortValue
        ? column.sortValue(b.row, b.originalIndex)
        : b.row[sortConfig.key];

      // Fallback to original row position when the column has no data (e.g. row-number columns)
      const aMissing = aValue === null || aValue === undefined || aValue === '';
      const bMissing = bValue === null || bValue === undefined || bValue === '';
      if (aMissing && bMissing) {
        aValue = a.originalIndex;
        bValue = b.originalIndex;
      } else {
        if (aMissing) aValue = '';
        if (bMissing) bValue = '';
      }

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

    return sorted.map(item => item.row);
  }, [data, sortConfig, columns]);

  // Map each row reference back to its index in the original (unsorted) data
  // so render() can show the original row number even after sorting.
  const originalIndexMap = useMemo(() => {
    const map = new Map();
    data?.forEach((row, i) => map.set(row, i));
    return map;
  }, [data]);

  const [loading, setLoading] = useState(() => (sortedData.length > 0 ? false : true));

  useEffect(() => {

    if (isDataLoaded) {
      setLoading(false)
    }

  }, [isDataLoaded]);

  useEffect(() => {
    if (forceLoading !== 'not_loading') {
      setLoading(true)
      setTimeout(() => setLoading(false), 1000)
    } else {
      setLoading(false)
    }
  }, [forceLoading]);

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

  let blockedTitles = [];
  if (permissions?.read === false) {
    blockedTitles = ['view', 'edit', 'delete', 'archive', 'unarchive'];
  }

  if (permissions?.write === false) {
    blockedTitles = ['edit', 'delete', 'archive', 'unarchive'];
  }

  let filteredColumns = columns.map(col => {
    if (col.accessor === 'actions' && typeof col.render === 'function') {
      const OriginalRender = col.render;

      col.render = (row) => {
        const element = OriginalRender(row);

        if (element?.props?.children) {
          // List all title 
          const newChildren = React.Children.toArray(element.props.children)
            .filter(child => {
              const title = child?.props?.title?.toLowerCase?.() || '';
              return !blockedTitles.includes(title);
            });

          return React.cloneElement(element, {}, newChildren);
        }

        return element;
      };
    }
    return col;
  });

  return (
    <div className="overflow-x-auto  shadow-card">
      <table className={`${tableClass} divide-y divide-gray-200`}>
        <thead className="bg-primary text-white">
          <tr>
            {filteredColumns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleSort(column.accessor, column.sortable)}
                className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${column.sortable !== false
                  ? 'cursor-pointer select-none   border-r border-b  hover:bg-primary-600'
                  : 'border-r border-b'
                  }  
                  ${column.className ? column.className : ''}`
                }
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column.accessor, column.sortable)}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={`${loading ? 'blur-sm animate-pulse' : ''}`}>
          {/* 🌀 Show skeleton while loading */}
          {loading ? (
            Array.from({ length: 2 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="divide-x divide-gray-100">
                {filteredColumns.map((_, colIndex) => (
                  <td key={colIndex} className="px-5 py-4 border-r border-b">
                    <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData?.length === 0 ? (
            // ❌ No data

            isDataLoaded ?
              <tr>

                <td colSpan={filteredColumns.length} className="px-6 py-8 text-center text-gray-500 border-r border-b">


                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <PlusIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">{emptyMessage}</h3>
                  </div>


                </td>
              </tr>
              : (

                Array.from({ length: 2 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="divide-x divide-gray-100 blur-sm animate-pulse">
                    {filteredColumns.map((_, colIndex) => (
                      <td key={colIndex} className="px-5 py-4 border-r border-b">
                        <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                      </td>
                    ))}
                  </tr>
                ))

              )

          ) : (
            // ✅ Actual table data
            sortedData?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`${onRowClick
                  ? 'cursor-pointer hover:bg-primary-50'
                  : 'odd:bg-white even:bg-gray-50 hover:bg-primary-50'
                  } transition-colors duration-150`}
              >
                {filteredColumns.map((column, colIndex) => {
                  const originalIndex = originalIndexMap.get(row) ?? rowIndex;
                  return (
                    <td key={colIndex} className="px-5 py-4 whitespace-normal text-sm break-words border-r border-b">
                      {column.render ? column.render(row, originalIndex) : row[column.accessor]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

};

export default Table;


