import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import EmptyState from "@/components/molecules/EmptyState";

const ResultsTable = ({ results, executionTime }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (!results) {
    return (
      <EmptyState
        icon="Play"
        title="No query results"
        description="Execute a SQL query to see results here"
      />
    );
  }

  const { columns, rows } = results;

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon="Search"
        title="No data found"
        description="The query executed successfully but returned no results"
      />
    );
  }

  const handleSort = (columnIndex, columnName) => {
    const newDirection = sortColumn === columnIndex && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnIndex);
    setSortDirection(newDirection);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (sortColumn === null) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
    if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
    
    // Try to sort as numbers if possible
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // Sort as strings
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    try {
      const csvContent = [
        columns.join(','),
        ...sortedRows.map(row => 
          row.map(cell => {
            const cellStr = String(cell || '');
            return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
              ? `"${cellStr.replace(/"/g, '""')}"` 
              : cellStr;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${new Date().toISOString().slice(0, 19)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Results exported to CSV');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const exportToJSON = () => {
    try {
      const jsonData = sortedRows.map(row => {
        const obj = {};
        columns.forEach((col, index) => {
          obj[col] = row[index];
        });
        return obj;
      });

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${new Date().toISOString().slice(0, 19)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Results exported to JSON');
    } catch (error) {
      toast.error('Failed to export JSON');
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="bg-surface-800 rounded-lg border border-surface-700 overflow-hidden"
    >
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-surface-700 bg-surface-900">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <ApperIcon name="Table" size={20} className="text-primary" />
          <h3 className="font-semibold text-white">Query Results</h3>
          <Badge variant="success" size="sm">
            {rows.length} rows
          </Badge>
          {executionTime && (
            <Badge variant="info" size="sm">
              {executionTime}ms
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon="Download"
            onClick={exportToCSV}
          >
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon="FileText"
            onClick={exportToJSON}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="bg-surface-900 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-surface-700 transition-colors"
                  onClick={() => handleSort(index, column)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{column}</span>
                    {sortColumn === index && (
                      <ApperIcon
                        name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                        size={14}
                        className="text-primary"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
{sortedRows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: rowIndex * 0.02 }}
                className="border-t border-surface-700 hover:bg-surface-700/50 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-sm font-mono text-slate-200 max-w-xs"
                  >
                    <div className="truncate" title={String(cell || '')}>
                      {cell === null || cell === undefined ? (
                        <span className="text-slate-500 italic">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-surface-900 border-t border-surface-700 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>
            Showing {sortedRows.length} of {rows.length} rows
          </span>
          {executionTime && (
            <span>
              Executed in {executionTime}ms
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsTable;