import React, { useEffect } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { Loader2, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// --- Button ---
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  children?: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-brand-950 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  const variants = {
    primary: "bg-brand-500 text-brand-950 hover:bg-brand-400 focus:ring-brand-400 shadow-[0_0_15px_rgba(77,161,169,0.3)]",
    secondary: "bg-brand-950/50 text-brand-100 border border-brand-700 hover:bg-brand-900 focus:ring-brand-600",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500",
    ghost: "bg-transparent text-brand-300 hover:bg-brand-900/30 hover:text-brand-200 shadow-none",
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-xs font-semibold text-brand-300 ml-1">{label}</label>}
      <input 
        className={`w-full bg-brand-950/50 border border-brand-700/50 text-brand-50 rounded-lg px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-brand-700/70 hover:border-brand-600 ${className}`}
        {...props}
      />
    </div>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={onClick ? { y: -2, borderColor: 'rgba(121, 215, 190, 0.4)' } : {}}
    onClick={onClick}
    className={`glass-panel rounded-xl p-6 shadow-lg ${className} ${onClick ? 'cursor-pointer transition-colors' : ''}`}
  >
    {children}
  </motion.div>
);

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode, color?: 'brand' | 'blue' | 'purple' | 'orange' | 'green', className?: string }> = ({ children, color = 'brand', className = '' }) => {
  const colors = {
    brand: "bg-brand-500/10 text-brand-300 border-brand-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    green: "bg-green-500/10 text-green-300 border-green-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${colors[color] || colors.brand} ${className}`}>
      {children}
    </span>
  );
};

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-brand-900 border border-brand-700 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between border-b border-brand-800 px-6 py-4 bg-brand-900">
              <h3 className="text-lg font-semibold text-brand-50">{title}</h3>
              <button onClick={onClose} className="text-brand-400 hover:text-white transition-colors bg-brand-800/50 hover:bg-brand-700 p-1 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Toast Notification ---
export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto dismiss after 5s
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    error: <AlertTriangle size={18} className="text-red-400" />,
    info: <Info size={18} className="text-brand-400" />
  };

  const bgColors = {
    success: "bg-green-500/10 border-green-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-brand-500/10 border-brand-500/20"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg min-w-[300px] max-w-md pointer-events-auto ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-brand-50 flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="text-brand-400 hover:text-white">
        <X size={14} />
      </button>
    </motion.div>
  );
};