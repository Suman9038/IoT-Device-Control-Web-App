import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { TOAST_TYPES } from '../../utils/constants';

const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    [TOAST_TYPES.SUCCESS]: <CheckCircle size={20} />,
    [TOAST_TYPES.ERROR]: <AlertCircle size={20} />,
    [TOAST_TYPES.WARNING]: <AlertTriangle size={20} />,
    [TOAST_TYPES.INFO]: <Info size={20} />,
  };

  const toastClasses = `toast toast-${type}`;

  return (
    <div className={toastClasses}>
      {icons[type]}
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
