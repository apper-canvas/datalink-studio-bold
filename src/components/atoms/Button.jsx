import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';
  
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 focus:ring-primary',
    secondary: 'bg-surface-700 text-slate-200 hover:bg-surface-600 focus:ring-surface-500 border border-surface-600',
    danger: 'bg-error text-white hover:brightness-110 focus:ring-error',
    success: 'bg-success text-white hover:brightness-110 focus:ring-success',
    ghost: 'text-slate-300 hover:bg-surface-700 hover:text-white focus:ring-surface-500',
    outline: 'border border-surface-600 text-slate-300 hover:bg-surface-700 hover:text-white focus:ring-surface-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonVariants = {
    hover: { scale: disabled ? 1 : 1.02 },
    tap: { scale: disabled ? 1 : 0.98 }
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" size={iconSize} className="animate-spin mr-2" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={iconSize} className="mr-2" />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={iconSize} className="ml-2" />
      )}
    </motion.button>
  );
};

export default Button;