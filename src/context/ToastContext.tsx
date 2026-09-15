import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: {
    (item: Omit<ToastItem, 'id'>): void;
    success: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duration = item.duration ?? 4500;

      setToasts((prev) => [...prev, { ...item, id }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const toastMethods = Object.assign(
    (item: Omit<ToastItem, 'id'>) => addToast(item),
    {
      success: (title: string, description?: string) =>
        addToast({ title, description, variant: 'success' }),
      warning: (title: string, description?: string) =>
        addToast({ title, description, variant: 'warning' }),
      error: (title: string, description?: string) =>
        addToast({ title, description, variant: 'error' }),
      info: (title: string, description?: string) =>
        addToast({ title, description, variant: 'info' }),
      dismiss,
    }
  );

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}

      {/* Floating Toast Notification Container (Top-Right) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.variant === 'success';
          const isWarning = t.variant === 'warning';
          const isError = t.variant === 'error';
          const isInfo = t.variant === 'info';

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                'pointer-events-auto p-4 rounded-xl border shadow-lg transition-all duration-200 flex items-start gap-3 bg-white text-slate-900 animate-in slide-in-from-top-2 fade-in',
                isSuccess && 'border-emerald-200 bg-emerald-50/70',
                isWarning && 'border-amber-200 bg-amber-50/70',
                isError && 'border-rose-200 bg-rose-50/70',
                isInfo && 'border-blue-200 bg-blue-50/70'
              )}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {isInfo && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              {/* Message */}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">{t.title}</div>
                {t.description && (
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Close notification"
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.toast;
};
