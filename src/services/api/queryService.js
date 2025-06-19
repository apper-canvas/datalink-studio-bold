const STORAGE_KEY = 'datalink_queries';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load queries from localStorage
const loadQueries = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading queries:', error);
    return [];
  }
};

// Save queries to localStorage
const saveQueries = (queries) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
  } catch (error) {
    console.error('Error saving queries:', error);
  }
};

// Generate mock result data based on SQL query
const generateMockResults = (sql) => {
  const normalizedSql = sql.toLowerCase().trim();
  
  if (normalizedSql.includes('select') && normalizedSql.includes('users')) {
    return {
      columns: ['id', 'name', 'email', 'created_at', 'status'],
      rows: [
        [1, 'John Doe', 'john@example.com', '2024-01-15 10:30:00', 'active'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-16 14:22:00', 'active'],
        [3, 'Bob Johnson', 'bob@example.com', '2024-01-17 09:15:00', 'inactive'],
        [4, 'Alice Brown', 'alice@example.com', '2024-01-18 16:45:00', 'active'],
        [5, 'Charlie Wilson', 'charlie@example.com', '2024-01-19 11:20:00', 'pending']
      ]
    };
  }
  
  if (normalizedSql.includes('select') && normalizedSql.includes('products')) {
    return {
      columns: ['id', 'name', 'price', 'category', 'stock', 'supplier'],
      rows: [
        [1, 'Laptop Pro 15', 1299.99, 'Electronics', 25, 'TechCorp'],
        [2, 'Wireless Mouse', 29.99, 'Electronics', 150, 'AccessoryMaker'],
        [3, 'Office Chair', 249.99, 'Furniture', 8, 'FurniturePlus'],
        [4, 'Desk Lamp', 79.99, 'Furniture', 32, 'LightingCo'],
        [5, 'Notebook Set', 15.99, 'Stationery', 200, 'PaperWorks']
      ]
    };
  }
  
  if (normalizedSql.includes('select') && normalizedSql.includes('orders')) {
    return {
      columns: ['id', 'customer_id', 'total', 'status', 'order_date'],
      rows: [
        [1001, 15, 99.99, 'completed', '2024-01-20 12:30:00'],
        [1002, 23, 249.50, 'processing', '2024-01-20 14:15:00'],
        [1003, 8, 75.00, 'shipped', '2024-01-19 16:22:00'],
        [1004, 42, 189.99, 'completed', '2024-01-19 10:45:00']
      ]
    };
  }
  
  // Default result for other queries
  return {
    columns: ['result'],
    rows: [['Query executed successfully']]
  };
};

const queryService = {
  async getAll() {
    await delay(200);
    const queries = loadQueries();
    return [...queries];
  },

  async getById(id) {
    await delay(200);
    const queries = loadQueries();
    const query = queries.find(q => q.Id === parseInt(id, 10));
    return query ? { ...query } : null;
  },

  async create(queryData) {
    await delay(300);
    const queries = loadQueries();
    const maxId = queries.length > 0 ? Math.max(...queries.map(q => q.Id)) : 0;
    
    const newQuery = {
      Id: maxId + 1,
      connectionId: queryData.connectionId,
      sql: queryData.sql,
      executedAt: new Date().toISOString(),
      executionTime: queryData.executionTime || 0,
      rowCount: queryData.rowCount || 0,
      isFavorite: false,
      status: queryData.status || 'completed'
    };

    queries.unshift(newQuery); // Add to beginning for recent queries
    
    // Keep only last 100 queries
    if (queries.length > 100) {
      queries.splice(100);
    }
    
    saveQueries(queries);
    return { ...newQuery };
  },

  async update(id, queryData) {
    await delay(300);
    const queries = loadQueries();
    const index = queries.findIndex(q => q.Id === parseInt(id, 10));
    
    if (index === -1) {
      throw new Error('Query not found');
    }

    const updatedQuery = {
      ...queries[index],
      ...queryData,
      updatedAt: new Date().toISOString()
    };

    queries[index] = updatedQuery;
    saveQueries(queries);
    return { ...updatedQuery };
  },

  async delete(id) {
    await delay(200);
    const queries = loadQueries();
    const filteredQueries = queries.filter(q => q.Id !== parseInt(id, 10));
    
    if (filteredQueries.length === queries.length) {
      throw new Error('Query not found');
    }

    saveQueries(filteredQueries);
    return true;
  },

  async execute(connectionId, sql) {
    const startTime = Date.now();
    await delay(Math.random() * 1500 + 500); // 500-2000ms execution time
    
    if (!sql || !sql.trim()) {
      throw new Error('SQL query cannot be empty');
    }

    // Simulate potential SQL errors
    if (Math.random() < 0.1) { // 10% chance of error
      throw new Error('Syntax error: Invalid SQL statement');
    }

    const executionTime = Date.now() - startTime;
    const results = generateMockResults(sql);
    
    // Save query to history
    await this.create({
      connectionId: parseInt(connectionId, 10),
      sql: sql.trim(),
      executionTime,
      rowCount: results.rows.length,
      status: 'completed'
    });

    return {
      columns: results.columns,
      rows: results.rows,
      executionTime,
      rowCount: results.rows.length,
      affectedRows: results.rows.length
    };
  },

  async getFavorites() {
    await delay(200);
    const queries = loadQueries();
    return queries.filter(q => q.isFavorite);
  },

  async toggleFavorite(id) {
    await delay(200);
    const queries = loadQueries();
    const index = queries.findIndex(q => q.Id === parseInt(id, 10));
    
    if (index === -1) {
      throw new Error('Query not found');
    }

    queries[index].isFavorite = !queries[index].isFavorite;
    saveQueries(queries);
    return { ...queries[index] };
  },

  async getRecentQueries(limit = 10) {
    await delay(200);
    const queries = loadQueries();
    return queries.slice(0, limit);
  }
};

export default queryService;