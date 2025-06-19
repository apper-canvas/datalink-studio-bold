import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const TableDetails = ({ table, onGenerateQuery }) => {
  if (!table) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <ApperIcon name="Table" size={48} className="mx-auto mb-3 opacity-50" />
          <p>Select a table to view details</p>
        </div>
      </div>
    );
  }

  const getColumnIcon = (column) => {
    if (column.key === 'PRI') return 'Key';
    if (column.key === 'UNI') return 'Hash';
    if (column.key === 'MUL') return 'Link';
    return 'Minus';
  };

  const getColumnBadgeVariant = (column) => {
    if (column.key === 'PRI') return 'warning';
    if (column.key === 'UNI') return 'info';
    if (column.nullable === false) return 'error';
    return 'default';
  };

  const generateSelectQuery = () => {
    const query = `SELECT ${table.columns.map(col => col.name).join(', ')}\nFROM ${table.name}\nLIMIT 10;`;
    onGenerateQuery?.(query);
  };

  const generateInsertQuery = () => {
    const columns = table.columns.filter(col => !col.extra?.includes('auto_increment'));
    const query = `INSERT INTO ${table.name} (${columns.map(col => col.name).join(', ')})\nVALUES (${columns.map(() => '?').join(', ')});`;
    onGenerateQuery?.(query);
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const columnVariants = {
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
      {/* Table Header */}
      <div className="p-4 border-b border-surface-700 bg-surface-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ApperIcon name="Table" size={24} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-white font-mono">
                {table.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary" size="sm">
                  {table.type}
                </Badge>
                {table.rowCount && (
                  <Badge variant="info" size="sm">
                    {table.rowCount.toLocaleString()} rows
                  </Badge>
                )}
                {table.columns && (
                  <Badge variant="default" size="sm">
                    {table.columns.length} columns
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon="Eye"
              onClick={generateSelectQuery}
            >
              SELECT
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon="Plus"
              onClick={generateInsertQuery}
            >
              INSERT
            </Button>
          </div>
        </div>
      </div>

      {/* Table Metadata */}
      {(table.tableSize || table.lastUpdated) && (
        <div className="p-4 border-b border-surface-700 bg-surface-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {table.rowCount && (
              <div>
                <span className="text-slate-500">Rows:</span>
                <span className="ml-2 font-mono text-slate-300">
                  {table.rowCount.toLocaleString()}
                </span>
              </div>
            )}
            {table.tableSize && (
              <div>
                <span className="text-slate-500">Size:</span>
                <span className="ml-2 font-mono text-slate-300">
                  {table.tableSize}
                </span>
              </div>
            )}
            {table.lastUpdated && (
              <div>
                <span className="text-slate-500">Updated:</span>
                <span className="ml-2 font-mono text-slate-300">
                  {new Date(table.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Columns */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Column
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Nullable
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Default
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Extra
              </th>
            </tr>
          </thead>
          <tbody>
            {table.columns?.map((column, index) => (
              <motion.tr
                key={column.name}
                variants={columnVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
                className="border-t border-surface-700 hover:bg-surface-700/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ApperIcon
                      name={getColumnIcon(column)}
                      size={14}
                      className={`${
                        column.key === 'PRI' ? 'text-warning' :
                        column.key === 'UNI' ? 'text-info' :
                        'text-slate-500'
                      }`}
                    />
                    <span className="font-mono text-slate-200 font-medium">
                      {column.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-sm bg-surface-700 px-2 py-1 rounded text-info">
                    {column.type}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={column.nullable ? 'success' : 'error'}
                    size="xs"
                  >
                    {column.nullable ? 'YES' : 'NO'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {column.key && (
                    <Badge variant={getColumnBadgeVariant(column)} size="xs">
                      {column.key}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {column.default && (
                    <code className="text-sm text-slate-400 font-mono">
                      {column.default}
                    </code>
                  )}
                </td>
                <td className="px-4 py-3">
                  {column.extra && (
                    <code className="text-sm text-slate-400 font-mono">
                      {column.extra}
                    </code>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Indexes */}
      {table.indexes && table.indexes.length > 0 && (
        <div className="border-t border-surface-700">
          <div className="p-4 bg-surface-900">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Indexes</h4>
            <div className="space-y-2">
              {table.indexes.map((index, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-surface-800 rounded">
                  <div className="flex items-center gap-2">
                    <ApperIcon
                      name={index.unique ? 'Key' : 'Database'}
                      size={14}
                      className={index.unique ? 'text-warning' : 'text-slate-500'}
                    />
                    <span className="font-mono text-sm text-slate-200">
                      {index.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-400">
                      {index.columns.join(', ')}
                    </code>
                    {index.unique && (
                      <Badge variant="warning" size="xs">
                        UNIQUE
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TableDetails;