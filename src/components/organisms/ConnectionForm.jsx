import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import { connectionService } from '@/services';

const ConnectionForm = ({ connection, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    name: connection?.Name || '',
    type: connection?.type || 'mysql',
    host: connection?.host || '',
    port: connection?.port || '',
    database: connection?.database || '',
    username: connection?.username || '',
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errors, setErrors] = useState({});

  const databaseTypes = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Connection name is required';
    }

    if (!formData.host.trim() && formData.type !== 'sqlite') {
      newErrors.host = 'Host is required';
    }

    if (!formData.database.trim()) {
      newErrors.database = 'Database is required';
    }

    if (!formData.username.trim() && formData.type !== 'sqlite') {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (type) => {
    const defaultPorts = {
      mysql: 3306,
      postgresql: 5432,
      sqlite: 0
    };

    setFormData(prev => ({
      ...prev,
      type,
      port: defaultPorts[type] || '',
      host: type === 'sqlite' ? 'local' : prev.host,
      username: type === 'sqlite' ? '' : prev.username
    }));
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTesting(true);
    try {
      await connectionService.testConnection(formData);
      toast.success('Connection test successful!');
    } catch (error) {
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (connection) {
        await connectionService.update(connection.Id, formData);
        toast.success('Connection updated successfully');
      } else {
        await connectionService.create(formData);
        toast.success('Connection created successfully');
      }
      onSave?.();
    } catch (error) {
      toast.error(`Failed to save connection: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800 rounded-lg border border-surface-700 p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {connection ? 'Edit Connection' : 'New Connection'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Connection Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="My Database"
            required
          />

          <FormField
            type="select"
            label="Database Type"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            options={databaseTypes}
            required
          />
        </div>

        {formData.type !== 'sqlite' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                label="Host"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                error={errors.host}
                placeholder="localhost"
                icon="Server"
                required
              />
            </div>
            <FormField
              type="number"
              label="Port"
              value={formData.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value) || '')}
              placeholder="3306"
            />
          </div>
        )}

        <FormField
          label={formData.type === 'sqlite' ? 'Database Path' : 'Database Name'}
          value={formData.database}
          onChange={(e) => handleInputChange('database', e.target.value)}
          error={errors.database}
          placeholder={formData.type === 'sqlite' ? '/path/to/database.db' : 'my_database'}
          icon="Database"
          required
        />

        {formData.type !== 'sqlite' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              error={errors.username}
              placeholder="username"
              icon="User"
              required
            />

            <FormField
              type="password"
              label={connection ? 'Password (leave blank to keep current)' : 'Password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              icon="Lock"
              required={!connection}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            loading={isTesting}
            icon="Zap"
            disabled={isSubmitting}
          >
            Test Connection
          </Button>
          
          <div className="flex gap-3 sm:ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting || isTesting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isSubmitting}
              icon="Save"
              disabled={isTesting}
            >
              {connection ? 'Update' : 'Create'} Connection
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ConnectionForm;