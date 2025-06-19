import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ConnectionCard from '@/components/organisms/ConnectionCard';
import ConnectionForm from '@/components/organisms/ConnectionForm';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { connectionService } from '@/services';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const navigate = useNavigate();

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await connectionService.getAll();
      setConnections(result);
    } catch (err) {
      setError(err.message || 'Failed to load connections');
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleNewConnection = () => {
    setEditingConnection(null);
    setShowForm(true);
  };

  const handleEditConnection = (connection) => {
    setEditingConnection(connection);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingConnection(null);
    loadConnections();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConnection(null);
  };

  const handleConnect = (connection) => {
    // Navigate to query editor after successful connection
    navigate('/query');
  };

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.database.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  };

  const gridVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <ConnectionForm
          connection={editingConnection}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-7xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Database Connections</h1>
          <p className="text-slate-400">
            Manage your database connections and connect to start querying
          </p>
        </div>
        <Button
          onClick={handleNewConnection}
          icon="Plus"
          size="lg"
        >
          New Connection
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <ApperIcon name="Database" size={16} />
          <span>
            {filteredConnections.length} of {connections.length} connections
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} height="h-64" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <ErrorState message={error} onRetry={loadConnections} />
      )}

      {/* Empty State */}
      {!loading && !error && connections.length === 0 && (
        <EmptyState
          icon="Database"
          title="No database connections"
          description="Create your first database connection to start querying data"
          actionLabel="Create Connection"
          onAction={handleNewConnection}
        />
      )}

      {/* No Search Results */}
      {!loading && !error && connections.length > 0 && filteredConnections.length === 0 && (
        <EmptyState
          icon="Search"
          title="No connections found"
          description={`No connections match "${searchTerm}"`}
        />
      )}

      {/* Connections Grid */}
      {!loading && !error && filteredConnections.length > 0 && (
        <motion.div
          variants={gridVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredConnections.map((connection) => (
            <motion.div key={connection.Id} variants={cardVariants}>
              <ConnectionCard
                connection={connection}
                onEdit={handleEditConnection}
                onConnect={handleConnect}
                onRefresh={loadConnections}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Connections;