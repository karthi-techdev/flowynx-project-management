
import React from 'react';
import { useTasks } from '../context/TaskContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTasks();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-xs pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/10 
            animate-in fade-in slide-in-from-bottom-4 duration-300 min-w-[200px] max-w-full
          `}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
            {toast.type === 'info' && <Info size={18} className="text-brand-400" />}
          </div>
          <span className="text-[13px] font-bold tracking-tight flex-1">{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
