import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { connectionService, queryService } from '@/services';

const QueryEditor = ({ onQueryExecute }) => {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeConnection, setActiveConnection] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const connection = connectionService.getActiveConnection();
    setActiveConnection(connection);
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure SQL syntax highlighting
    monaco.languages.setMonarchTokensProvider('sql', {
      keywords: [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
        'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'INSERT', 'UPDATE', 'DELETE',
        'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE',
        'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
        'DISTINCT', 'COUNT', 'SUM', 'MAX', 'MIN', 'AVG', 'AS', 'LIMIT', 'OFFSET'
      ],
      operators: ['=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--'],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],
          [/[;,.]/, 'delimiter'],
          [/@symbols/, 'operator']
        ],
        string: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop']
        ],
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ]
      }
    });

    // Set editor theme
    monaco.editor.defineTheme('sqlDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'operator', foreground: 'd4d4d4' }
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editorCursor.foreground': '#2563eb',
        'editor.lineHighlightBackground': '#1e293b',
        'editorLineNumber.foreground': '#64748b',
        'editor.selectionBackground': '#2563eb33'
      }
    });

    monaco.editor.setTheme('sqlDark');
  };

  const handleExecuteQuery = async () => {
    if (!activeConnection) {
      toast.error('No active database connection');
      return;
    }

    if (!query.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }

    setIsExecuting(true);
    try {
      const results = await queryService.execute(activeConnection.Id, query);
      onQueryExecute?.(results);
      toast.success(`Query executed successfully - ${results.rowCount} rows returned`);
    } catch (error) {
      toast.error(`Query execution failed: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const insertSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const sampleQueries = [
    {
      label: 'Select Users',
      query: 'SELECT id, name, email, status FROM users WHERE status = \'active\' ORDER BY created_at DESC LIMIT 10;'
    },
    {
      label: 'Product Inventory',
      query: 'SELECT p.name, p.price, p.stock_quantity, c.name as category\nFROM products p\nLEFT JOIN categories c ON p.category_id = c.id\nWHERE p.stock_quantity > 0\nORDER BY p.name;'
    },
    {
      label: 'Order Summary',
      query: 'SELECT \n  DATE(created_at) as order_date,\n  COUNT(*) as total_orders,\n  SUM(total_amount) as total_revenue\nFROM orders \nWHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)\nGROUP BY DATE(created_at)\nORDER BY order_date DESC;'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800 rounded-lg border border-surface-700 overflow-hidden"
    >
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-surface-700 bg-surface-900">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <ApperIcon name="Code" size={20} className="text-primary" />
          <h3 className="font-semibold text-white">SQL Query Editor</h3>
{activeConnection && (
            <Badge variant="success" size="sm">
              {activeConnection.Name}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                size="sm"
                variant="ghost"
                onClick={() => insertSampleQuery(sample.query)}
                className="text-xs"
                disabled={isExecuting}
              >
                {sample.label}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={handleExecuteQuery}
            loading={isExecuting}
            icon="Play"
            disabled={!activeConnection}
            size="sm"
          >
            Execute
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-80">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={query}
          onChange={(value) => setQuery(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-t border-surface-700 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>SQL</span>
          <span>UTF-8</span>
          {query && (
            <span>{query.split('\n').length} lines, {query.length} chars</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-xs">Ctrl+Enter</kbd>
          <span>to execute</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QueryEditor;