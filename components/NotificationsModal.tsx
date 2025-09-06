
import React from 'react';
import { Task, Document } from '../types';
import { IconBell } from './icons/IconBell';
import { IconX } from './icons/IconX';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTasks: Task[];
  inProcessTasks: Task[];
  documents: Document[];
  onGoToTasks: () => void;
}

const NotificationItem: React.FC<{ task: Task; relatedDocSubject?: string; statusColor: string }> = ({ task, relatedDocSubject, statusColor }) => (
    <div className="flex items-start p-3 space-x-3 hover:bg-secondary-light dark:hover:bg-secondary-dark/50">
        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${statusColor}`}></div>
        <div className="flex-1">
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{task.description}</p>
            {relatedDocSubject && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                    Del documento: <span className="italic">"{relatedDocSubject}"</span>
                </p>
            )}
        </div>
    </div>
);

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, pendingTasks, inProcessTasks, documents, onGoToTasks }) => {
    if (!isOpen) return null;

    const findRelatedDocSubject = (docId?: string): string | undefined => {
        if (!docId) return undefined;
        return documents.find(d => d.id === docId)?.subject;
    };
    
    const hasNotifications = pendingTasks.length > 0 || inProcessTasks.length > 0;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} aria-hidden="true"></div>
            <div 
                className="fixed top-20 right-8 w-full max-w-sm bg-white dark:bg-secondary-dark rounded-lg shadow-2xl border border-border-light dark:border-border-dark z-50 transform transition-all duration-300 ease-in-out origin-top-right animate-fade-in-down"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notifications-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center">
                        <IconBell className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" />
                        <h3 id="notifications-title" className="font-semibold text-text-primary-light dark:text-text-primary-dark">Notificaciones Activas</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-border-dark" aria-label="Cerrar notificaciones">
                        <IconX className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    {hasNotifications ? (
                        <>
                            {pendingTasks.length > 0 && (
                                <div className="py-2">
                                    <h4 className="px-4 py-1 text-xs font-bold uppercase text-text-secondary-light dark:text-text-secondary-dark">Tareas Pendientes</h4>
                                    <div className="divide-y divide-border-light dark:divide-border-dark">
                                        {pendingTasks.map(task => (
                                            <NotificationItem key={task.id} task={task} relatedDocSubject={findRelatedDocSubject(task.relatedDocumentId)} statusColor="bg-red-500" />
                                        ))}
                                    </div>
                                </div>
                            )}
                             {inProcessTasks.length > 0 && (
                                <div className="py-2">
                                    <h4 className="px-4 py-1 text-xs font-bold uppercase text-text-secondary-light dark:text-text-secondary-dark">En Proceso</h4>
                                    <div className="divide-y divide-border-light dark:divide-border-dark">
                                        {inProcessTasks.map(task => (
                                            <NotificationItem key={task.id} task={task} relatedDocSubject={findRelatedDocSubject(task.relatedDocumentId)} statusColor="bg-yellow-500" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            <p>No tienes notificaciones activas.</p>
                            <p>¡Todo está al día!</p>
                        </div>
                    )}
                </div>
                
                {hasNotifications && (
                    <div className="p-2 border-t border-border-light dark:border-border-dark">
                        <button onClick={onGoToTasks} className="w-full text-center px-4 py-2 text-sm font-semibold text-primary-light dark:text-primary-dark rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors">
                            Ir a Tareas
                        </button>
                    </div>
                )}
                <style>{`
                    @keyframes fade-in-down {
                        0% {
                            opacity: 0;
                            transform: translateY(-10px) scale(0.95);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    .animate-fade-in-down {
                        animation: fade-in-down 0.2s ease-out forwards;
                    }
                `}</style>
            </div>
        </>
    );
};
export default NotificationsModal;
