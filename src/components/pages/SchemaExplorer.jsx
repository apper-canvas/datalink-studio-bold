import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SchemaTree from '@/components/organisms/SchemaTree';
import TableDetails from '@/components/organisms/TableDetails';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { connectionService, schemaService } from '@/services';

const SchemaExplorer = () => {
  const [schema, setSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchema = async (connectionId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await schemaService.getSchema(connectionId);
      setSchema(result);
      // Auto-select first table if available
      if (result.tables && result.tables.length > 0) {
        const firstTable = result.tables[0];
        const tableDetails = await schemaService.getTableDetails(connectionId, firstTable.name);
        setSelectedTable(tableDetails);
      }
    } catch (err) {
      setError(err.message || 'Failed to load schema');
      toast.error('Failed to load database schema');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchema = async () => {
    if (!activeConnection) return;
    
    setRefreshing(true);
    try {
      const result = await schemaService.refreshSchema(activeConnection.Id);
      setSchema(result);
      toast.success('Schema refreshed successfully');
    } catch (err) {
      toast.error(`Failed to refresh schema: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const connection = connectionService.getActiveConnection();
    setActiveConnection(connection);
    
    if (connection) {
      loadSchema(connection.Id);
    }
  }, []);

  const handleTableSelect = async (table) => {
    if (!activeConnection) return;
    
    try {
      const tableDetails = await schemaService.getTableDetails(activeConnection.Id, table.name);
      setSelectedTable(tableDetails);
    } catch (err) {
      toast.error(`Failed to load table details: ${err.message}`);
    }
  };

  const handleGenerateQuery = (query) => {
    // In a real app, this would send the query to the query editor
    navigator.clipboard.writeText(query).then(() => {
      toast.success('Query copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy query');
    });
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  };

  if (!activeConnection) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="h-full flex items-center justify-center"
      >
        <EmptyState
          icon="Database"
          title="No database connection"
          description="Connect to a database to explore its schema structure"
          actionLabel="Go to Connections"
          onAction={() => window.location.href = '/connections'}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col max-w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-surface-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Schema Explorer</h1>
            <p className="text-slate-400">
              Browse database structure and generate queries
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              icon="RefreshCw"
              onClick={refreshSchema}
              loading={refreshing}
              disabled={loading}
            >
              Refresh Schema
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Schema Tree Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-surface-700 bg-surface-800">
          {loading && (
            <div className="p-4">
              <SkeletonLoader count={8} height="h-8" />
            </div>
          )}
          
          {error && !loading && (
            <div className="p-4">
              <ErrorState message={error} onRetry={() => loadSchema(activeConnection.Id)} />
            </div>
          )}
          
          {!loading && !error && schema && (
            <SchemaTree
              schema={schema}
              onTableSelect={handleTableSelect}
              selectedTable={selectedTable}
            />
          )}
        </div>

        {/* Table Details */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading && (
            <SkeletonLoader count={1} height="h-96" />
          )}
          
          {!loading && !error && (
            <TableDetails
              table={selectedTable}
              onGenerateQuery={handleGenerateQuery}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SchemaExplorer;