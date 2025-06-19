import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';

const SchemaTree = ({ schema, onTableSelect, selectedTable }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['tables']));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filterItems = (items, term) => {
    if (!term) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      table: 'Table',
      view: 'Eye',
      procedure: 'Zap',
      function: 'Code'
    };
    return icons[type] || 'Database';
  };

  const getTypeColor = (type) => {
    const colors = {
      table: 'primary',
      view: 'info',
      procedure: 'warning',
      function: 'success'
    };
    return colors[type] || 'default';
  };

  const TreeNode = ({ id, label, icon, count, children, type, item, level = 0 }) => {
    const isExpanded = expandedNodes.has(id);
    const hasChildren = children && children.length > 0;
    const isSelected = selectedTable?.name === item?.name;

    const nodeVariants = {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 }
    };

    const childrenVariants = {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 }
    };

    return (
      <motion.div
        variants={nodeVariants}
        initial="initial"
        animate="animate"
        className="select-none"
      >
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-surface-700 cursor-pointer transition-colors ${
            isSelected ? 'bg-primary/20 border-l-2 border-primary' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(id);
            }
            if (item && type === 'table') {
              onTableSelect?.(item);
            }
          }}
        >
          {hasChildren && (
            <ApperIcon
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              size={14}
              className="text-slate-500 transition-transform"
            />
          )}
          
          <ApperIcon
            name={icon}
            size={16}
            className={`${
              type ? (getTypeColor(type) === 'primary' ? 'text-primary' : 
                     getTypeColor(type) === 'info' ? 'text-info' :
                     getTypeColor(type) === 'warning' ? 'text-warning' :
                     getTypeColor(type) === 'success' ? 'text-success' : 
                     'text-slate-400') : 'text-slate-400'
            }`}
          />
          
          <span className={`text-sm font-mono ${isSelected ? 'text-white font-medium' : 'text-slate-300'}`}>
            {label}
          </span>
          
          {count !== undefined && (
            <Badge variant="default" size="xs">
              {count}
            </Badge>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              variants={childrenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {children.map((child, index) => (
                <TreeNode key={index} {...child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!schema) {
    return (
      <div className="p-4 text-center text-slate-500">
        <ApperIcon name="Database" size={48} className="mx-auto mb-3 opacity-50" />
        <p>No schema data available</p>
      </div>
    );
  }

  const filteredTables = filterItems(schema.tables || [], searchTerm);
  const filteredViews = filterItems(schema.views || [], searchTerm);
  const filteredProcedures = filterItems(schema.procedures || [], searchTerm);

  const treeData = [
    {
      id: 'tables',
      label: 'Tables',
      icon: 'Table',
      count: filteredTables.length,
      children: filteredTables.map(table => ({
        id: `table-${table.name}`,
        label: table.name,
        icon: 'Table',
        type: 'table',
        item: table,
        count: table.columns?.length
      }))
    },
    {
      id: 'views',
      label: 'Views',
      icon: 'Eye',
      count: filteredViews.length,
      children: filteredViews.map(view => ({
        id: `view-${view.name}`,
        label: view.name,
        icon: 'Eye',
        type: 'view',
        item: view
      }))
    },
    {
      id: 'procedures',
      label: 'Procedures',
      icon: 'Zap',
      count: filteredProcedures.length,
      children: filteredProcedures.map(proc => ({
        id: `proc-${proc.name}`,
        label: proc.name,
        icon: 'Zap',
        type: 'procedure',
        item: proc
      }))
    }
  ].filter(section => section.count > 0);

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-surface-700">
        <Input
          placeholder="Search schema..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="Search"
          className="text-xs"
        />
      </div>

      {/* Database Info */}
      <div className="p-4 border-b border-surface-700">
        <div className="flex items-center gap-2 mb-2">
          <ApperIcon name="Database" size={18} className="text-primary" />
          <span className="font-mono font-medium text-white">
            {schema.database}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {(schema.tables || []).length} tables, {(schema.views || []).length} views, {(schema.procedures || []).length} procedures
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {treeData.length > 0 ? (
          <div className="space-y-1">
            {treeData.map(node => (
              <TreeNode key={node.id} {...node} />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 mt-8">
            <ApperIcon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaTree;