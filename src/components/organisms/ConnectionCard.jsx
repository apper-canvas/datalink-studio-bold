import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/molecules/Card';
import { connectionService } from '@/services';

const ConnectionCard = ({ connection, onEdit, onConnect, onRefresh }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectionService.connect(connection.Id);
      toast.success(`Connected to ${connection.name}`);
      onConnect?.(connection);
      onRefresh?.();
    } catch (error) {
      toast.error(`Failed to connect: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await connectionService.disconnect();
      toast.success('Disconnected');
      onRefresh?.();
    } catch (error) {
      toast.error(`Failed to disconnect: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${connection.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await connectionService.delete(connection.Id);
      toast.success('Connection deleted');
      onRefresh?.();
    } catch (error) {
      toast.error(`Failed to delete connection: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = () => {
    const icons = {
      mysql: 'Database',
      postgresql: 'Server',
      sqlite: 'HardDrive'
    };
    return icons[connection.type] || 'Database';
  };

  const getTypeColor = () => {
    const colors = {
      mysql: 'primary',
      postgresql: 'info',
      sqlite: 'success'
    };
    return colors[connection.type] || 'default';
  };

  const cardVariants = {
    hover: { y: -4, scale: 1.02 }
  };

  return (
    <motion.div
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${connection.isActive ? 'bg-success/20' : 'bg-surface-700'}`}>
              <ApperIcon 
                name={getTypeIcon()} 
                size={20} 
                className={connection.isActive ? 'text-success' : 'text-slate-400'} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {connection.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getTypeColor()} size="xs">
                  {connection.type.toUpperCase()}
                </Badge>
                {connection.isActive && (
                  <Badge variant="success" size="xs" icon="Zap">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              icon="Edit"
              onClick={() => onEdit?.(connection)}
              disabled={isConnecting || isDeleting}
            />
            <Button
              size="sm"
              variant="ghost"
              icon="Trash2"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isConnecting}
            />
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Host:</span>
            <span className="text-slate-300">{connection.host}</span>
          </div>
          {connection.port > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Port:</span>
              <span className="text-slate-300">{connection.port}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-400">
            <span>Database:</span>
            <span className="text-slate-300 truncate ml-2">{connection.database}</span>
          </div>
          {connection.username && (
            <div className="flex justify-between text-slate-400">
              <span>User:</span>
              <span className="text-slate-300">{connection.username}</span>
            </div>
          )}
        </div>

        {connection.lastConnected && (
          <div className="text-xs text-slate-500 mb-4">
            Last connected {formatDistanceToNow(new Date(connection.lastConnected))} ago
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-surface-700">
          {connection.isActive ? (
            <Button
              size="sm"
              variant="secondary"
              icon="Unlink"
              onClick={handleDisconnect}
              className="flex-1"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              icon="Plug"
              onClick={handleConnect}
              loading={isConnecting}
              className="flex-1"
            >
              Connect
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ConnectionCard;