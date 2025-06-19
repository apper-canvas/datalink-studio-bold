const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock schema data for different database types
const mockSchemas = {
  mysql: {
    database: 'ecommerce_db',
    tables: [
      {
        name: 'users',
        type: 'table',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI', extra: 'auto_increment' },
          { name: 'username', type: 'varchar(50)', nullable: false, key: 'UNI' },
          { name: 'email', type: 'varchar(100)', nullable: false, key: 'UNI' },
          { name: 'password_hash', type: 'varchar(255)', nullable: false },
          { name: 'first_name', type: 'varchar(50)', nullable: true },
          { name: 'last_name', type: 'varchar(50)', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
          { name: 'status', type: "enum('active','inactive','pending')", nullable: false, default: 'pending' }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], unique: true },
          { name: 'username_unique', columns: ['username'], unique: true },
          { name: 'email_unique', columns: ['email'], unique: true },
          { name: 'idx_status', columns: ['status'], unique: false }
        ]
      },
      {
        name: 'products',
        type: 'table',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI', extra: 'auto_increment' },
          { name: 'name', type: 'varchar(200)', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'price', type: 'decimal(10,2)', nullable: false },
          { name: 'category_id', type: 'int', nullable: true },
          { name: 'supplier_id', type: 'int', nullable: true },
          { name: 'sku', type: 'varchar(50)', nullable: false, key: 'UNI' },
          { name: 'stock_quantity', type: 'int', nullable: false, default: '0' },
          { name: 'created_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], unique: true },
          { name: 'sku_unique', columns: ['sku'], unique: true },
          { name: 'idx_category', columns: ['category_id'], unique: false },
          { name: 'idx_supplier', columns: ['supplier_id'], unique: false }
        ]
      },
      {
        name: 'orders',
        type: 'table',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI', extra: 'auto_increment' },
          { name: 'user_id', type: 'int', nullable: false },
          { name: 'total_amount', type: 'decimal(10,2)', nullable: false },
          { name: 'status', type: "enum('pending','processing','shipped','delivered','cancelled')", nullable: false, default: 'pending' },
          { name: 'shipping_address', type: 'text', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], unique: true },
          { name: 'idx_user', columns: ['user_id'], unique: false },
          { name: 'idx_status', columns: ['status'], unique: false },
          { name: 'idx_created_at', columns: ['created_at'], unique: false }
        ]
      },
      {
        name: 'categories',
        type: 'table',
        columns: [
          { name: 'id', type: 'int', nullable: false, key: 'PRI', extra: 'auto_increment' },
          { name: 'name', type: 'varchar(100)', nullable: false },
          { name: 'parent_id', type: 'int', nullable: true },
          { name: 'description', type: 'text', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' }
        ],
        indexes: [
          { name: 'PRIMARY', columns: ['id'], unique: true },
          { name: 'idx_parent', columns: ['parent_id'], unique: false }
        ]
      }
    ],
    views: [
      {
        name: 'user_order_summary',
        type: 'view',
        definition: 'SELECT u.id, u.username, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.username'
      },
      {
        name: 'product_inventory',
        type: 'view',
        definition: 'SELECT p.id, p.name, p.sku, p.stock_quantity, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id'
      }
    ],
    procedures: [
      {
        name: 'GetUserOrders',
        type: 'procedure',
        parameters: ['user_id INT'],
        definition: 'Returns all orders for a specific user'
      },
      {
        name: 'UpdateProductStock',
        type: 'procedure',
        parameters: ['product_id INT', 'quantity INT'],
        definition: 'Updates product stock quantity'
      }
    ]
  },
  postgresql: {
    database: 'analytics_db',
    tables: [
      {
        name: 'events',
        type: 'table',
        columns: [
          { name: 'id', type: 'bigserial', nullable: false, key: 'PRI' },
          { name: 'user_id', type: 'integer', nullable: true },
          { name: 'event_type', type: 'varchar(50)', nullable: false },
          { name: 'properties', type: 'jsonb', nullable: true },
          { name: 'timestamp', type: 'timestamptz', nullable: false, default: 'now()' },
          { name: 'session_id', type: 'uuid', nullable: true }
        ],
        indexes: [
          { name: 'events_pkey', columns: ['id'], unique: true },
          { name: 'idx_events_user_id', columns: ['user_id'], unique: false },
          { name: 'idx_events_timestamp', columns: ['timestamp'], unique: false },
          { name: 'idx_events_properties', columns: ['properties'], unique: false, type: 'gin' }
        ]
      },
      {
        name: 'sessions',
        type: 'table',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, key: 'PRI', default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'integer', nullable: true },
          { name: 'started_at', type: 'timestamptz', nullable: false },
          { name: 'ended_at', type: 'timestamptz', nullable: true },
          { name: 'ip_address', type: 'inet', nullable: true },
          { name: 'user_agent', type: 'text', nullable: true }
        ],
        indexes: [
          { name: 'sessions_pkey', columns: ['id'], unique: true },
          { name: 'idx_sessions_user_id', columns: ['user_id'], unique: false },
          { name: 'idx_sessions_started_at', columns: ['started_at'], unique: false }
        ]
      }
    ],
    views: [
      {
        name: 'daily_events',
        type: 'view',
        definition: 'SELECT date_trunc(\'day\', timestamp) as day, event_type, count(*) as event_count FROM events GROUP BY 1, 2 ORDER BY 1 DESC'
      }
    ],
    procedures: [
      {
        name: 'cleanup_old_sessions',
        type: 'function',
        parameters: ['days_old INTEGER DEFAULT 30'],
        definition: 'Removes sessions older than specified days'
      }
    ]
  }
};

const schemaService = {
  async getSchema(connectionId) {
    await delay(800);
    
    // In a real implementation, this would fetch schema from the actual database
    // For now, we'll return mock data based on connection type
    const mockConnection = {
      Id: parseInt(connectionId, 10),
      type: connectionId % 2 === 0 ? 'postgresql' : 'mysql' // Alternate between types
    };
    
    const schemaData = mockSchemas[mockConnection.type] || mockSchemas.mysql;
    
    return {
      ...schemaData,
      connectionId: parseInt(connectionId, 10),
      refreshedAt: new Date().toISOString()
    };
  },

  async getTableDetails(connectionId, tableName) {
    await delay(500);
    
    const schema = await this.getSchema(connectionId);
    const table = schema.tables.find(t => t.name === tableName);
    
    if (!table) {
      throw new Error(`Table '${tableName}' not found`);
    }

    return {
      ...table,
      rowCount: Math.floor(Math.random() * 10000) + 100, // Mock row count
      tableSize: `${Math.floor(Math.random() * 500) + 50} MB`, // Mock table size
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  },

  async refreshSchema(connectionId) {
    await delay(1200); // Longer delay for refresh operation
    
    // Simulate schema refresh
    const schema = await this.getSchema(connectionId);
    
    return {
      ...schema,
      refreshedAt: new Date().toISOString(),
      message: 'Schema refreshed successfully'
    };
  },

  async searchSchema(connectionId, searchTerm) {
    await delay(300);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        tables: [],
        columns: [],
        indexes: []
      };
    }

    const schema = await this.getSchema(connectionId);
    const term = searchTerm.toLowerCase();
    
    // Search tables
    const matchingTables = schema.tables.filter(table => 
      table.name.toLowerCase().includes(term)
    );

    // Search columns
    const matchingColumns = [];
    schema.tables.forEach(table => {
      table.columns.forEach(column => {
        if (column.name.toLowerCase().includes(term)) {
          matchingColumns.push({
            ...column,
            tableName: table.name
          });
        }
      });
    });

    // Search views
    const matchingViews = schema.views.filter(view =>
      view.name.toLowerCase().includes(term)
    );

    return {
      tables: matchingTables,
      columns: matchingColumns,
      views: matchingViews,
      searchTerm
    };
  }
};

export default schemaService;