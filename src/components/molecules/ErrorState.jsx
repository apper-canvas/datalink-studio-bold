import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ErrorState = ({ 
  message = 'Something went wrong',
  onRetry,
  className = '' 
}) => {
  const errorVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={errorVariants}
      className={`text-center py-12 ${className}`}
    >
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-error/20 rounded-full">
          <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-slate-300 mb-2">
        Error Loading Data
      </h3>
      
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline" icon="RefreshCw">
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;