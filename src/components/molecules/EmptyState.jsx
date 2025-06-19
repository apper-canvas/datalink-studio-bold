import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  icon = 'Package',
  title,
  description,
  actionLabel,
  onAction,
  className = '' 
}) => {
  const emptyStateVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  };

  const iconBounceVariants = {
    animate: { y: [0, -10, 0] }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={emptyStateVariants}
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        animate="animate"
        variants={iconBounceVariants}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <ApperIcon name={icon} className="w-16 h-16 text-slate-500 mx-auto" />
      </motion.div>
      
      {title && (
        <h3 className="mt-4 text-lg font-medium text-slate-300">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <motion.div
          className="mt-6"
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;