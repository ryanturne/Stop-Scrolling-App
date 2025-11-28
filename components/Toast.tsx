import React, { useEffect } from 'react';
import { ToastMessage, ToastType } from '../types';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto dismiss after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  let bgClass = "bg-gray-800";
  let Icon = Info;

  switch (toast.type) {
    case ToastType.WARNING:
      bgClass = "bg-orange-600";
      Icon = AlertTriangle;
      break;
    case ToastType.DANGER:
      bgClass = "bg-red-600";
      Icon = XCircle;
      break;
    case ToastType.SUCCESS:
      bgClass = "bg-green-600";
      Icon = CheckCircle;
      break;
    default:
      bgClass = "bg-blue-600";
  }

  return (
    <div className={`${bgClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 pointer-events-auto`}>
      <Icon size={20} className="shrink-0" />
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
};

export default ToastContainer;