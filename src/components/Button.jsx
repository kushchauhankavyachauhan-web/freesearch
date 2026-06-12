import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', onClick, disabled, type = 'button', size = 'md' }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none';
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50',
    secondary: 'glass text-white hover:bg-white/10',
    ghost: 'text-lavender hover:text-white hover:bg-white/5',
    danger: 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}
