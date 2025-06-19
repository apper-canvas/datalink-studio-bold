import { toast } from 'react-toastify';

const ACTIVE_CONNECTION_KEY = 'datalink_active_connection';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Get active connection from localStorage
const getActiveConnection = () => {
  try {
    const stored = localStorage.getItem(ACTIVE_CONNECTION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading active connection:', error);
    return null;
  }
};

// Set active connection in localStorage
const setActiveConnection = (connection) => {
  try {
    localStorage.setItem(ACTIVE_CONNECTION_KEY, JSON.stringify(connection));
  } catch (error) {
    console.error('Error saving active connection:', error);
  }
};

const connectionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "host" } },
          { field: { Name: "port" } },
          { field: { Name: "database" } },
          { field: { Name: "username" } },
          { field: { Name: "password_hash" } },
          { field: { Name: "is_active" } },
          { field: { Name: "last_connected" } },
          { field: { Name: "created_at" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await apperClient.fetchRecords('connection', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "type" } },
          { field: { Name: "host" } },
          { field: { Name: "port" } },
          { field: { Name: "database" } },
          { field: { Name: "username" } },
          { field: { Name: "password_hash" } },
          { field: { Name: "is_active" } },
          { field: { Name: "last_connected" } },
          { field: { Name: "created_at" } }
        ]
      };

      const response = await apperClient.getRecordById('connection', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching connection:', error);
      return null;
    }
  },

  async create(connectionData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Name: connectionData.name,
            type: connectionData.type,
            host: connectionData.host,
            port: connectionData.port || (connectionData.type === 'mysql' ? 3306 : connectionData.type === 'postgresql' ? 5432 : 0),
            database: connectionData.database,
            username: connectionData.username,
            password_hash: connectionData.password,
            is_active: false,
            last_connected: null,
            created_at: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('connection', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          throw new Error('Failed to create connection');
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord ? successfulRecord.data : null;
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  },

  async update(id, connectionData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id, 10),
        Name: connectionData.name,
        type: connectionData.type,
        host: connectionData.host,
        port: connectionData.port,
        database: connectionData.database,
        username: connectionData.username,
        is_active: connectionData.is_active !== undefined ? connectionData.is_active : false
      };

      // Only include password if provided
      if (connectionData.password) {
        updateData.password_hash = connectionData.password;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('connection', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          
          throw new Error('Failed to update connection');
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord ? successfulRecord.data : null;
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('connection', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          
          throw new Error('Failed to delete connection');
        }
      }

      // Clear active connection if deleted
      const activeConnection = getActiveConnection();
      if (activeConnection && activeConnection.Id === parseInt(id, 10)) {
        localStorage.removeItem(ACTIVE_CONNECTION_KEY);
      }

      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  },

  async testConnection(connectionData) {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isValid = connectionData.host && connectionData.database && connectionData.username;
    const isReachable = Math.random() > 0.2; // 80% success rate
    
    if (!isValid) {
      throw new Error('Invalid connection parameters');
    }
    
    if (!isReachable) {
      throw new Error('Unable to reach database server');
    }

    return {
      success: true,
      message: 'Connection successful',
      serverVersion: '8.0.33',
      latency: Math.floor(Math.random() * 100) + 10
    };
  },

  async connect(connectionId) {
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const connection = await this.getById(connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Simulate connection success/failure
      const isSuccessful = Math.random() > 0.15; // 85% success rate
      
      if (!isSuccessful) {
        throw new Error('Failed to establish database connection');
      }

      // Update connection status
      const updatedConnection = await this.update(connectionId, {
        ...connection,
        is_active: true,
        last_connected: new Date().toISOString()
      });

      setActiveConnection(updatedConnection);
      return updatedConnection;
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  },

  async disconnect() {
    try {
      const activeConnection = getActiveConnection();
      
      if (activeConnection) {
        await this.update(activeConnection.Id, {
          ...activeConnection,
          is_active: false
        });
        
        localStorage.removeItem(ACTIVE_CONNECTION_KEY);
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  },

  getActiveConnection() {
    return getActiveConnection();
  }
};

export default connectionService;