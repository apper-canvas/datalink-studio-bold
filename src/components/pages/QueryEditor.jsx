import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import QueryEditor from '@/components/organisms/QueryEditor';
import ResultsTable from '@/components/organisms/ResultsTable';
import EmptyState from '@/components/molecules/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { connectionService } from '@/services';

const QueryEditorPage = () => {
  const [queryResults, setQueryResults] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null);
  const [splitView, setSplitView] = useState(true);

  useEffect(() => {
    const connection = connectionService.getActiveConnection();
    setActiveConnection(connection);
  }, []);

  const handleQueryExecute = (results) => {
    setQueryResults(results);
  };

  const handleConnectPrompt = () => {
    // This would typically open a connection selector or redirect to connections page
    toast.info('Please connect to a database first');
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
          icon="Plug"
          title="No database connection"
          description="Connect to a database to start writing and executing SQL queries"
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
      className="h-full flex flex-col p-6 max-w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Query Editor</h1>
          <p className="text-slate-400">
            Write and execute SQL queries against your connected database
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={splitView ? "PanelTopClose" : "PanelTop"}
            onClick={() => setSplitView(!splitView)}
          >
            {splitView ? 'Hide Results' : 'Show Results'}
          </Button>
        </div>
      </div>

      {/* Query Interface */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
        {/* Query Editor */}
        <div className="flex-shrink-0">
          <QueryEditor onQueryExecute={handleQueryExecute} />
        </div>

        {/* Results Section */}
        {splitView && (
          <div className="flex-1 min-h-0">
            <ResultsTable 
              results={queryResults} 
              executionTime={queryResults?.executionTime}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QueryEditorPage;