import QueryEditor from '@/components/pages/QueryEditor';
import SchemaExplorer from '@/components/pages/SchemaExplorer';
import Connections from '@/components/pages/Connections';

export const routes = {
  queryEditor: {
    id: 'queryEditor',
    label: 'Query Editor',
    path: '/query',
    icon: 'Code',
    component: QueryEditor
  },
  schemaExplorer: {
    id: 'schemaExplorer',
    label: 'Schema Explorer', 
    path: '/schema',
    icon: 'Database',
    component: SchemaExplorer
  },
  connections: {
    id: 'connections',
    label: 'Connections',
    path: '/connections',
    icon: 'Plug',
    component: Connections
  }
};

export const routeArray = Object.values(routes);
export default routes;