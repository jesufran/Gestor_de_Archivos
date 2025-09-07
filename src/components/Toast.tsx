import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../types';
import { IconCheckCircle } from './icons/IconCheckCircle';
import { IconXCircle } from './icons/IconXCircle';
import { IconInfo } from './icons/IconInfo';
import { IconX } from './icons/IconX';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const icons = {
  success: <IconCheckCircle className="w-6 h-6 text-green-500" />,
  error: <IconXCircle className="w-6 h-6 text-red-500" />,
  info: <IconInfo className="w-6 h-6 text-blue-500" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation to complete
  };
  
  const animationClasses = isExiting 
    ? 'animate-fade-out-right'
    : 'animate-fade-in-right';

  return (
    <div className={`flex items-start w-full p-4 rounded-lg shadow-lg bg-white dark:bg-secondary-dark border border-border-light dark:border-border-dark ${animationClasses}`}>
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {toast.message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={handleClose}
          className="inline-flex rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-secondary-dark"
        >
          <span className="sr-only">Close</span>
          <IconX className="h-5 w-5" />
        </button>
      </div>
      <style>{`
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out forwards;
        }

        @keyframes fade-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .animate-fade-out-right {
          animation: fade-out-right 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
