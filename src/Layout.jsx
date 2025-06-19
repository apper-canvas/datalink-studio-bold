import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { routeArray } from '@/config/routes';
import ConnectionStatus from '@/components/organisms/ConnectionStatus';
import { AuthContext } from '@/App';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <Button
      size="sm"
      variant="ghost"
      icon="LogOut"
      onClick={logout}
      className="text-slate-400 hover:text-white"
    >
      Logout
    </Button>
  );
};
const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-surface-800 border-b border-surface-700 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ApperIcon name="Database" className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-bold text-white">DataLink Studio</h1>
            </div>
            
            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex ml-8">
              <div className="flex border-b border-surface-700">
                {routeArray.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative ${
                        isActive
                          ? 'text-primary border-primary bg-surface-700/50'
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} size={16} />
                    {route.label}
                  </NavLink>
                ))}
              </div>
            </nav>
</div>

          <div className="flex items-center gap-4">
            <ConnectionStatus />
            
            {/* Logout Button */}
            <LogoutButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-surface-700 rounded transition-colors"
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleMobileMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-16 right-0 bottom-0 w-64 bg-surface-800 border-l border-surface-700 z-50 md:hidden"
            >
              <nav className="p-4">
                {routeArray.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    onClick={toggleMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 mb-1 ${
                        isActive
                          ? 'text-primary bg-primary/10 border-l-2 border-primary'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} size={18} />
                    {route.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;