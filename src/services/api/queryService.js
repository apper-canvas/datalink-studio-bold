import { toast } from 'react-toastify';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
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
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "connection_id" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "is_favorite" } },
          { field: { Name: "status" } }
        ],
        orderBy: [
          { fieldName: "executed_at", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('query', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load queries');
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "connection_id" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "is_favorite" } },
          { field: { Name: "status" } }
        ]
      };

      const response = await apperClient.getRecordById('query', parseInt(id, 10), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching query:', error);
      return null;
    }
  },

  async create(queryData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Name: `Query ${Date.now()}`,
            connection_id: queryData.connectionId,
            sql: queryData.sql,
            executed_at: new Date().toISOString(),
            execution_time: queryData.executionTime || 0,
            row_count: queryData.rowCount || 0,
            is_favorite: false,
            status: queryData.status || 'completed'
          }
        ]
      };

      const response = await apperClient.createRecord('query', params);
      
      if (!response.success) {
        console.error(response.message);
        // Don't show toast for query history creation failures
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord ? successfulRecord.data : null;
      }
    } catch (error) {
      console.error('Error creating query:', error);
      return null;
    }
  },

  async update(id, queryData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [
          {
            Id: parseInt(id, 10),
            is_favorite: queryData.is_favorite,
            status: queryData.status
          }
        ]
      };

      const response = await apperClient.updateRecord('query', params);
      
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
          
          throw new Error('Failed to update query');
        }
        
        const successfulRecord = response.results.find(result => result.success);
        return successfulRecord ? successfulRecord.data : null;
      }
    } catch (error) {
      console.error('Error updating query:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('query', params);
      
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
          
          throw new Error('Failed to delete query');
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  },

  async execute(connectionId, sql) {
    const startTime = Date.now();
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
    
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
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "connection_id" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "is_favorite" } },
          { field: { Name: "status" } }
        ],
        where: [
          { FieldName: "is_favorite", Operator: "EqualTo", Values: ["true"] }
        ],
        orderBy: [
          { fieldName: "executed_at", sorttype: "DESC" }
        ]
      };

      const response = await apperClient.fetchRecords('query', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching favorite queries:', error);
      return [];
    }
  },

  async toggleFavorite(id) {
    try {
      const query = await this.getById(id);
      if (!query) {
        throw new Error('Query not found');
      }

      return await this.update(id, {
        is_favorite: !query.is_favorite
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  async getRecentQueries(limit = 10) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "connection_id" } },
          { field: { Name: "sql" } },
          { field: { Name: "executed_at" } },
          { field: { Name: "execution_time" } },
          { field: { Name: "row_count" } },
          { field: { Name: "is_favorite" } },
          { field: { Name: "status" } }
        ],
        orderBy: [
          { fieldName: "executed_at", sorttype: "DESC" }
        ],
        pagingInfo: {
          limit,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('query', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent queries:', error);
      return [];
    }
  }
};

export default queryService;