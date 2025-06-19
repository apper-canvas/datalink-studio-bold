import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { connectionService } from '@/services';

const ConnectionStatus = () => {
  const [activeConnection, setActiveConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load active connection on mount
    const connection = connectionService.getActiveConnection();
    setActiveConnection(connection);
  }, []);

  const statusVariants = {
    connected: { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 2 } },
    connecting: { rotate: 360, transition: { repeat: Infinity, duration: 1 } }
  };

  const getStatusColor = () => {
    if (isLoading) return 'warning';
    if (activeConnection?.isActive) return 'success';
    return 'error';
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (activeConnection?.isActive) return `Connected to ${activeConnection.name}`;
    if (activeConnection) return `Disconnected from ${activeConnection.name}`;
    return 'No connection';
  };

  const getStatusIcon = () => {
    if (isLoading) return 'Loader2';
    if (activeConnection?.isActive) return 'CheckCircle';
    return 'AlertCircle';
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div
        variants={statusVariants}
        animate={isLoading ? 'connecting' : activeConnection?.isActive ? 'connected' : 'initial'}
      >
        <ApperIcon 
          name={getStatusIcon()} 
          size={16} 
          className={`${
            getStatusColor() === 'success' 
              ? 'text-success' 
              : getStatusColor() === 'warning'
              ? 'text-warning'
              : 'text-error'
          } ${isLoading ? 'animate-spin' : ''}`} 
        />
      </motion.div>
      
      <Badge variant={getStatusColor()} size="sm">
        {getStatusText()}
      </Badge>
      
      {activeConnection?.isActive && (
        <div className="text-xs text-slate-500 font-mono">
          {activeConnection.type.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;