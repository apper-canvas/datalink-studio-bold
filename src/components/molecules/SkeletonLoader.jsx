import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 3, 
  height = 'h-20',
  className = '' 
}) => {
  const shimmerVariants = {
    animate: {
      x: ['-100%', '100%']
    }
  };

  const staggerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial="initial"
          animate="animate"
          variants={staggerVariants}
          transition={{ delay: i * 0.1 }}
          className={`${height} bg-surface-700 rounded-lg overflow-hidden relative`}
        >
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-600 to-transparent"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;