import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      transition={{ duration: 0.2 }}
      className={`glass rounded-2xl p-6 ${hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
