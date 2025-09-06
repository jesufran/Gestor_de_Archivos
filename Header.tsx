import React from 'react';
import { IconBell } from './icons/IconBell';
import { IconSparkles } from './icons/IconSparkles';
import { IconSearch } from './icons/IconSearch';
import { IconUser } from './icons/IconUser';
import { IconLogout } from './icons/IconLogout';
import { NetlifyUser } from '../types';
import { SyncStatus } from '../App';
import { IconCloud } from './icons/IconCloud';
import { IconCloudOff } from './icons/IconCloudOff';
import { IconSync } from './icons/IconSync';

interface HeaderProps {
  title: string;
  description: string;
  onToggleAiPanel: () => void;
  isAiPanelOpen: boolean;
  globalSearchTerm: string;
  onGlobalSearchChange: (term: string) => void;
  onSearchFocus: () => void;
  hasPendingTasks: boolean;
  hasInProcessTasks: boolean;
  onBellClick: () => void;
  user: NetlifyUser | null;
  onLogout: () => void;
  syncStatus: SyncStatus;
}

const SyncStatusIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
    const statusMap = {
        idle: { icon: <IconCloudOff className="w-5 h-5" />, text: 'Desconectado', color: 'text-text-secondary-light dark:text-text-secondary-dark' },
        syncing: { icon: <IconSync className="w-5 h-5 animate-spin" />, text: 'Sincronizando...', color: 'text-blue-500 dark:text-blue-400' },
        synced: { icon: <IconCloud className="w-5 h-5" />, text: 'Guardado en la nube', color: 'text-green-500 dark:text-green-400' },
        error: { icon: <IconCloudOff className="w-5 h-5" />, text: 'Error de Sinc.', color: 'text-red-500 dark:text-red-400' },
    };
    const { icon, text, color } = statusMap[status];

    return (
        <div className={`flex items-center space-x-2 text-xs font-medium ${color}`} title={text}>
            {icon}
            <span className="hidden sm:inline">{text}</span>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ title, description, onToggleAiPanel, isAiPanelOpen, globalSearchTerm, onGlobalSearchChange, onSearchFocus, hasPendingTasks, hasInProcessTasks, onBellClick, user, onLogout, syncStatus }) => {
  return (
    <header className="flex items-center justify-between px-6 md:px-8 h-20 bg-white dark:bg-background-dark border-b border-border-light dark:border-secondary-dark transition-colors duration-300 flex-shrink-0">
      <div className="w-2/5 min-w-0">
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark truncate">{title}</h2>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate">{description}</p>
      </div>
      
      <div className="flex-1 max-w-sm mx-4">
          <div className="relative">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark pointer-events-none" />
              <input
                  type="text"
                  placeholder="Buscar en todo el sistema..."
                  value={globalSearchTerm}
                  onChange={e => onGlobalSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  className="w-full pl-11 pr-4 py-2 bg-background-light dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
              />
          </div>
      </div>

      <div className="flex items-center space-x-2 justify-end">
        <SyncStatusIndicator status={syncStatus} />
        <button
          aria-label="Asistente IA"
          onClick={onToggleAiPanel}
          className={`relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-colors duration-200 ${
            isAiPanelOpen
              ? 'bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-border-dark'
          }`}
        >
          <IconSparkles className="w-6 h-6" />
        </button>
        <button
          aria-label="Notificaciones"
          onClick={onBellClick}
          className="relative p-2 text-text-secondary-light dark:text-text-secondary-dark rounded-full hover:bg-gray-100 dark:hover:bg-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark"
        >
          <IconBell className="w-6 h-6" />
          {hasPendingTasks ? (
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-background-dark"></span>
          ) : hasInProcessTasks && (
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-yellow-500 ring-2 ring-white dark:ring-background-dark"></span>
          )}
        </button>
        
        {user && (
            <div className="flex items-center space-x-2 pl-2">
                <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-secondary-light dark:bg-border-dark rounded-full mr-2">
                        <IconUser className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                    </div>
                    <div className="text-sm text-right">
                        <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate max-w-28">{user.user_metadata?.full_name || user.email}</p>
                    </div>
                </div>
                 <button onClick={onLogout} className="p-2 text-text-secondary-light dark:text-text-secondary-dark rounded-full hover:bg-gray-100 dark:hover:bg-border-dark" aria-label="Cerrar sesión">
                    <IconLogout className="w-5 h-5" />
                 </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;