import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  show: (message: string, type?: Toast['type']) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = (id: number) => setToasts((toasts) => toasts.filter(t => t.id !== id));

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((toasts) => [...toasts, { id, type, message }]);
    setTimeout(() => remove(id), 3000);
  }, []);

  const success = (msg: string) => show(msg, 'success');
  const error = (msg: string) => show(msg, 'error');
  const info = (msg: string) => show(msg, 'info');

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[320px] max-w-sm px-6 py-4 rounded-lg shadow-2xl flex items-start gap-4 animate-fade-in-up
              ${toast.type === 'success' ? 'bg-green-100 border border-green-300 text-green-900' : ''}
              ${toast.type === 'error' ? 'bg-red-100 border border-red-300 text-red-900' : ''}
              ${toast.type === 'info' ? 'bg-blue-100 border border-blue-300 text-blue-900' : ''}
            `}
            style={{ animation: 'fade-in-up 0.3s cubic-bezier(.21,1.02,.73,1)'}}
          >
            <span className="mt-1">
              {toast.type === 'success' && (
                <svg className="w-7 h-7 text-green-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-7 h-7 text-red-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-7 h-7 text-blue-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" /></svg>
              )}
            </span>
            <span className="flex-1 text-lg font-semibold">{toast.message}</span>
            <button onClick={() => remove(toast.id)} className="ml-3 text-2xl font-bold text-gray-400 hover:text-gray-700">&times;</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}; 