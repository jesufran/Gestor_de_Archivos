import React from 'react';
import { IconAlertTriangle } from './icons/IconAlertTriangle';
import { IconX } from './icons/IconX';

interface BackupReminderBannerProps {
  onDismiss: () => void;
  onGoToSettings: () => void;
}

const BackupReminderBanner: React.FC<BackupReminderBannerProps> = ({ onDismiss, onGoToSettings }) => {
  return (
    <div className="w-full bg-yellow-100 dark:bg-yellow-900/50 border-b-2 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-2 flex items-center justify-between text-sm z-10">
      <div className="flex items-center">
        <IconAlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
        <p>
          <span className="font-bold">Recordatorio:</span> No ha realizado un respaldo en más de una semana.
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onGoToSettings}
          className="px-3 py-1 font-semibold bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded-md hover:bg-yellow-300 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-yellow-900/50"
        >
          Crear Respaldo
        </button>
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-yellow-200/50 dark:hover:bg-yellow-800/50" aria-label="Descartar recordatorio">
          <IconX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BackupReminderBanner;