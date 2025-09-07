import React from 'react';
import { IconX } from './icons/IconX';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'lg' | '2xl' | '4xl' | '6xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '6xl' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
      'lg': 'max-w-lg',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto py-10 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-secondary-dark rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out p-6 m-4`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3 mb-4">
          <h3 id="modal-title" className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-border-dark rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label="Cerrar modal"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;