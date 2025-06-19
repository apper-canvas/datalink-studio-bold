import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'datalink_connections';
const ACTIVE_CONNECTION_KEY = 'datalink_active_connection';
const SECRET_KEY = 'datalink_secret_2024';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Encrypt password
const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

// Decrypt password
const decryptPassword = (encryptedPassword) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Load connections from localStorage
const loadConnections = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading connections:', error);
    return [];
  }
};

// Save connections to localStorage
const saveConnections = (connections) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error('Error saving connections:', error);
  }
};

// Get active connection
const getActiveConnection = () => {
  try {
    const stored = localStorage.getItem(ACTIVE_CONNECTION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading active connection:', error);
    return null;
  }
};

// Set active connection
const setActiveConnection = (connection) => {
  try {
    localStorage.setItem(ACTIVE_CONNECTION_KEY, JSON.stringify(connection));
  } catch (error) {
    console.error('Error saving active connection:', error);
  }
};

const connectionService = {
  async getAll() {
    await delay(200);
    const connections = loadConnections();
    return [...connections];
  },

  async getById(id) {
    await delay(200);
    const connections = loadConnections();
    const connection = connections.find(conn => conn.Id === parseInt(id, 10));
    return connection ? { ...connection } : null;
  },

  async create(connectionData) {
    await delay(300);
    const connections = loadConnections();
    const maxId = connections.length > 0 ? Math.max(...connections.map(c => c.Id)) : 0;
    
    const newConnection = {
      Id: maxId + 1,
      name: connectionData.name,
      type: connectionData.type,
      host: connectionData.host,
      port: connectionData.port || (connectionData.type === 'mysql' ? 3306 : connectionData.type === 'postgresql' ? 5432 : 0),
      database: connectionData.database,
      username: connectionData.username,
      passwordHash: encryptPassword(connectionData.password),
      isActive: false,
      lastConnected: null,
      createdAt: new Date().toISOString()
    };

    connections.push(newConnection);
    saveConnections(connections);
    return { ...newConnection };
  },

  async update(id, connectionData) {
    await delay(300);
    const connections = loadConnections();
    const index = connections.findIndex(conn => conn.Id === parseInt(id, 10));
    
    if (index === -1) {
      throw new Error('Connection not found');
    }

    const updatedConnection = {
      ...connections[index],
      name: connectionData.name,
      type: connectionData.type,
      host: connectionData.host,
      port: connectionData.port,
      database: connectionData.database,
      username: connectionData.username,
      passwordHash: connectionData.password ? encryptPassword(connectionData.password) : connections[index].passwordHash,
      updatedAt: new Date().toISOString()
    };

    connections[index] = updatedConnection;
    saveConnections(connections);
    return { ...updatedConnection };
  },

  async delete(id) {
    await delay(200);
    const connections = loadConnections();
    const filteredConnections = connections.filter(conn => conn.Id !== parseInt(id, 10));
    
    if (filteredConnections.length === connections.length) {
      throw new Error('Connection not found');
    }

    saveConnections(filteredConnections);
    
    // Clear active connection if deleted
    const activeConnection = getActiveConnection();
    if (activeConnection && activeConnection.Id === parseInt(id, 10)) {
      localStorage.removeItem(ACTIVE_CONNECTION_KEY);
    }

    return true;
  },

  async testConnection(connectionData) {
    await delay(1500); // Simulate connection test
    
    // Simulate connection test logic
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
    await delay(1000);
    const connections = loadConnections();
    const connection = connections.find(conn => conn.Id === parseInt(connectionId, 10));
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Simulate connection process
    const isSuccessful = Math.random() > 0.15; // 85% success rate
    
    if (!isSuccessful) {
      throw new Error('Failed to establish database connection');
    }

    // Update connection status
    const updatedConnection = {
      ...connection,
      isActive: true,
      lastConnected: new Date().toISOString()
    };

    const index = connections.findIndex(conn => conn.Id === parseInt(connectionId, 10));
    connections[index] = updatedConnection;
    saveConnections(connections);
    setActiveConnection(updatedConnection);

    return { ...updatedConnection };
  },

  async disconnect() {
    await delay(500);
    const activeConnection = getActiveConnection();
    
    if (activeConnection) {
      const connections = loadConnections();
      const index = connections.findIndex(conn => conn.Id === activeConnection.Id);
      
      if (index !== -1) {
        connections[index] = { ...connections[index], isActive: false };
        saveConnections(connections);
      }
      
      localStorage.removeItem(ACTIVE_CONNECTION_KEY);
    }

    return true;
  },

  getActiveConnection() {
    return getActiveConnection();
  },

  // Utility method to get decrypted password (for connection testing)
  getDecryptedPassword(connection) {
    try {
      return decryptPassword(connection.passwordHash);
    } catch (error) {
      console.error('Error decrypting password:', error);
      return '';
    }
  }
};

export default connectionService;