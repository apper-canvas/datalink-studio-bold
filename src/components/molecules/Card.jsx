import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-surface-800 border border-surface-700 rounded-lg overflow-hidden';
  
  const cardVariants = {
    hover: hover ? { scale: 1.02, y: -2 } : {}
  };

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;