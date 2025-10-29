import React from 'react';

/**
 * A reusable table component for displaying data.
 * @param {Array} columns - Defines table columns: [{ header: string, accessor: string, render?: function }]
 * @param {Array} data - The array of data objects to display (e.g., list of complaints).
 */
export default function Table({ columns = [], data = [] }) {

  // Safety check: Ensure data is an array before trying to map it
  const tableData = Array.isArray(data) ? data : [];

  if (tableData.length === 0) {
    // Return a graceful message instead of trying to render an empty table structure.
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        
        {/* Table Header */}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {tableData.map((item, rowIndex) => (
            <tr key={item._id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                >
                  {/*
                    If a custom render function is provided in the column definition, use it.
                    Otherwise, fall back to the accessor to pull the data property.
                  */}
                  {column.render 
                    ? column.render(item) 
                    : item[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
