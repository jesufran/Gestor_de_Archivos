import React, { useState, useMemo } from 'react';
import { Task, Document } from '../types';
import { IconCheckCircle } from './icons/IconCheckCircle';
import Modal from './Modal';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconUser } from './icons/IconUser';
import { IconCalendar } from './icons/IconCalendar';
import { IconInbox } from './icons/IconInbox';
import { IconNote } from './icons/IconNote';
import DocumentViewerModal from './DocumentViewerModal';
import { IconCheck } from './icons/IconCheck';
import { IconSearch } from './icons/IconSearch';
import { IconPlayCircle } from './icons/IconPlayCircle';

interface TasksListProps {
  tasks: Task[];
  documents: Document[];
  onStartCompletion: (task: Task, resultFile: File) => void;
  updateTask: (taskId: string, updatedData: Partial<Task>) => void;
  isReadOnly: boolean;
}

const priorityStyles = {
    alta: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    baja: 'bg-gray-100 text-gray-800 dark:bg-border-dark/50 dark:text-text-primary-dark',
};

// Helper function to format date string 'YYYY-MM-DD' correctly, avoiding timezone issues.
const formatDisplayDate = (dateString: string | undefined): string => {
    if (!dateString) {
        return 'No establecida';
    }
    try {
        // Splitting the string and creating a date from parts avoids timezone shifting the date by one day.
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        // Fallback for any unexpected format
        return dateString;
    }
};

const TaskItem: React.FC<{ 
    task: Task;
    relatedDocument?: Document;
    onCompleteClick: () => void;
    onViewDocumentClick: () => void;
    onUpdate: (updatedData: Partial<Task>) => void;
    isReadOnly: boolean;
}> = ({ task, relatedDocument, onCompleteClick, onViewDocumentClick, onUpdate, isReadOnly }) => {
    const isActionable = (task.status === 'pendiente' || task.status === 'en proceso') && !isReadOnly;
    
    return (
    <div className="p-4 bg-white dark:bg-secondary-dark/50 rounded-lg border border-border-light dark:border-border-dark flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary-light/50 dark:hover:border-primary-dark/50 space-y-2.5">
        
        {/* Header: Description and Priority */}
        <div className="flex justify-between items-start gap-4">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark flex-1">{task.description}</p>
             <select
                value={task.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as Task['priority'] })}
                disabled={isReadOnly}
                className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize border-transparent focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none appearance-none ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${priorityStyles[task.priority]}`}
                aria-label="Cambiar prioridad"
            >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
            </select>
        </div>

        {/* Context from Document - simplified styling */}
        {relatedDocument && (
            <div className="text-sm space-y-1.5 text-text-secondary-light dark:text-text-secondary-dark">
                <div className="flex items-center">
                    <IconUser className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-semibold mr-2">De:</span>
                    <span className="font-normal text-text-primary-light dark:text-text-primary-dark truncate">{relatedDocument.from}</span>
                </div>
                <div className="flex items-center">
                    <IconInbox className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-semibold mr-2">Asunto:</span>
                    <span className="font-normal text-text-primary-light dark:text-text-primary-dark truncate">{relatedDocument.subject}</span>
                </div>
            </div>
        )}

        {/* Notes for Quick Tasks - simplified styling */}
        {task.notes && (
            <div className="text-sm">
                <div className="flex items-start">
                    <IconNote className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-primary-light dark:text-primary-dark" />
                    <p className="whitespace-pre-wrap text-text-primary-light dark:text-text-primary-dark">{task.notes}</p>
                </div>
            </div>
        )}

        {/* Combined Footer: Metadata and Actions */}
        <div className="pt-2.5 border-t border-border-light dark:border-border-dark flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
            
            {/* Left side: Metadata (Due date, Created date) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <div className="flex items-center">
                    <IconCalendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="mr-1.5 whitespace-nowrap text-xs">Vence:</span>
                    <input
                        type="date"
                        id={`due-date-${task.id}`}
                        value={task.dueDate || ''}
                        onChange={(e) => onUpdate({ dueDate: e.target.value })}
                        disabled={isReadOnly}
                        className="p-0.5 rounded-md bg-secondary-light dark:bg-secondary-dark border border-transparent hover:border-border-light dark:hover:border-hover-dark focus:border-primary-light dark:focus:border-primary-dark focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark text-xs font-semibold text-text-primary-light dark:text-text-primary-dark disabled:cursor-default disabled:bg-opacity-50"
                    />
                </div>
                <p className="text-xs">
                    Creada: {new Date(task.createdAt).toLocaleDateString()}
                </p>
            </div>
            
            {/* Right side: Actions or Status */}
            <div>
                {task.status !== 'completada' ? (
                    <div className="flex items-center space-x-2">
                        {task.status === 'pendiente' && (
                             <button
                                onClick={() => onUpdate({ status: 'en proceso' })}
                                disabled={!isActionable}
                                className="flex items-center px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconPlayCircle className="w-4 h-4 mr-1.5" />
                                Iniciar Tarea
                            </button>
                        )}
                        {task.relatedDocumentId && (
                            <button
                                onClick={onViewDocumentClick}
                                className="px-3 py-1.5 text-xs font-semibold text-primary-light dark:text-primary-dark bg-secondary-light dark:bg-secondary-dark rounded-md hover:bg-gray-200 dark:hover:bg-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-colors"
                            >
                                Ver Doc.
                            </button>
                        )}
                        {task.relatedDocumentId ? (
                             <button
                                onClick={onCompleteClick}
                                disabled={!isActionable}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Completar
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => onUpdate({ status: 'completada', completedAt: new Date().toISOString() })}
                                    disabled={!isActionable}
                                    className="flex items-center px-3 py-1.5 text-xs font-semibold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <IconCheck className="w-4 h-4 mr-1.5" />
                                    Marcar como Hecha
                                </button>
                                <button
                                    onClick={onCompleteClick}
                                    disabled={!isActionable}
                                    className="px-3 py-1.5 text-xs font-semibold text-primary-light dark:text-primary-dark bg-secondary-light dark:bg-secondary-dark rounded-md hover:bg-gray-200 dark:hover:bg-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Completar...
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                     <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <IconCheckCircle className="w-4 h-4 mr-2" />
                        <span>Completada: {new Date(task.completedAt!).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
)};


const CompleteTaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
    taskDescription: string;
}> = ({ isOpen, onClose, onSubmit, taskDescription }) => {
    const [file, setFile] = useState<File | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            onSubmit(file);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Completar Tarea">
            <form onSubmit={handleSubmit}>
                <p className="mb-4 text-text-secondary-light dark:text-text-secondary-dark">
                    Para completar la tarea <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">"{taskDescription}"</span>, por favor adjunte el documento de respuesta.
                </p>
                <div>
                    <label htmlFor="resultFile" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Adjuntar Documento de Respuesta</label>
                    <input 
                        type="file" 
                        id="resultFile" 
                        onChange={e => setFile(e.target.files?.[0])} 
                        required
                        className="mt-1 block w-full text-sm text-text-secondary-light dark:text-text-secondary-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light/10 dark:file:bg-primary-dark/10 file:text-primary-light dark:file:text-primary-dark hover:file:bg-primary-light/20 dark:hover:file:bg-primary-dark/20"
                    />
                </div>
                <div className="flex justify-end pt-6 space-x-2">
                     <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
                     <button type="submit" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark">
                        <IconPaperclip className="w-4 h-4 mr-2" />
                        Adjuntar y Continuar
                    </button>
                </div>
            </form>
        </Modal>
    );
};


const TasksList: React.FC<TasksListProps> = ({ tasks, documents, onStartCompletion, updateTask, isReadOnly }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in-process' | 'completed'>('pending');
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) {
      return tasks;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return tasks.filter(task => {
      const relatedDoc = documents.find(d => d.id === task.relatedDocumentId);
      return (
        task.description.toLowerCase().includes(lowercasedTerm) ||
        (task.notes && task.notes.toLowerCase().includes(lowercasedTerm)) ||
        (relatedDoc && (
          relatedDoc.from.toLowerCase().includes(lowercasedTerm) ||
          relatedDoc.subject.toLowerCase().includes(lowercasedTerm)
        ))
      );
    });
  }, [tasks, documents, searchTerm]);

  const sortActiveTasks = (a: Task, b: Task): number => {
    // 1. Due Date (earliest first, no due date last)
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      if (a.dueDate < b.dueDate) return -1;
      if (a.dueDate > b.dueDate) return 1;
    }

    // 2. Priority (High > Medium > Low)
    const priorityOrder = { alta: 0, media: 1, baja: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // 3. Creation Date (oldest first)
    const createdAtA = new Date(a.createdAt).getTime();
    const createdAtB = new Date(b.createdAt).getTime();
    return createdAtA - createdAtB;
  };

  const sortCompletedTasks = (a: Task, b: Task): number => {
    const completedAtA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const completedAtB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return completedAtB - completedAtA; // Descending (most recent first)
  };


  const pendingTasks = useMemo(() => 
    filteredTasks.filter(t => t.status === 'pendiente').sort(sortActiveTasks),
    [filteredTasks]
  );
  
  const inProcessTasks = useMemo(() =>
    filteredTasks.filter(t => t.status === 'en proceso').sort(sortActiveTasks),
    [filteredTasks]
  );
  
  const completedTasks = useMemo(() =>
    filteredTasks.filter(t => t.status === 'completada').sort(sortCompletedTasks),
    [filteredTasks]
  );

  const handleCompleteClick = (task: Task) => {
    setTaskToComplete(task);
  };

  const handleViewDocumentClick = (task: Task) => {
      const relatedDoc = documents.find(d => d.id === task.relatedDocumentId);
      if(relatedDoc) {
        setViewingDocument(relatedDoc);
      }
  };

  const handleModalClose = () => {
    setTaskToComplete(null);
  };

  const handleModalSubmit = (file: File) => {
    if (taskToComplete) {
      onStartCompletion(taskToComplete, file);
      handleModalClose();
    }
  };
  
  const renderTaskList = (taskList: Task[], type: 'pending' | 'in-process' | 'completed') => {
      if (taskList.length > 0) {
        return taskList.map(task => {
            const relatedDocument = task.relatedDocumentId
              ? documents.find(d => d.id === task.relatedDocumentId)
              : undefined;
            return (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  relatedDocument={relatedDocument}
                  onCompleteClick={() => handleCompleteClick(task)}
                  onViewDocumentClick={() => handleViewDocumentClick(task)}
                  onUpdate={(updatedData) => updateTask(task.id, updatedData)}
                  isReadOnly={isReadOnly}
                />
            );
        });
      }
      
      if (searchTerm) {
          return <p className="text-text-secondary-light dark:text-text-secondary-dark italic text-center py-8">No se encontraron tareas para "{searchTerm}".</p>
      }
      
      const messages = {
          pending: "No hay tareas pendientes. ¡Buen trabajo!",
          'in-process': "No hay tareas en proceso actualmente.",
          completed: "Aún no se han completado tareas.",
      };
      
      return <p className="text-text-secondary-light dark:text-text-secondary-dark italic text-center py-8">{messages[type]}</p>;
  };

  const TabButton: React.FC<{ 
    label: string; 
    count: number; 
    tabName: 'pending' | 'in-process' | 'completed'; 
    isActive: boolean; 
  }> = ({ label, count, tabName, isActive }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark ${
        isActive
          ? 'border-b-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark bg-secondary-light dark:bg-secondary-dark'
          : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark'
      }`}
    >
      {label}
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-gray-200 dark:bg-border-dark text-text-primary-light dark:text-text-primary-dark'}`}>{count}</span>
    </button>
  );

  return (
    <div className="space-y-4">
       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <p className="text-md text-text-secondary-light dark:text-text-secondary-dark max-w-2xl">
              Gestione sus tareas pendientes y revise su historial. Puede buscar por descripción o por detalles del documento de origen.
            </p>
            <div className="relative w-full md:max-w-xs">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
                <input
                    type="text"
                    placeholder="Buscar en tareas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                />
            </div>
        </div>
       {/* Tab Navigation */}
      <div className="border-b border-border-light dark:border-border-dark flex items-center pt-2">
        <TabButton label="Tareas Pendientes" count={pendingTasks.length} tabName="pending" isActive={activeTab === 'pending'} />
        <TabButton label="En Proceso" count={inProcessTasks.length} tabName="in-process" isActive={activeTab === 'in-process'} />
        <TabButton label="Tareas Completadas" count={completedTasks.length} tabName="completed" isActive={activeTab === 'completed'} />
      </div>

       {/* Tab Content */}
      <div className="pt-4">
        <div className="space-y-3">
            {activeTab === 'pending' ? renderTaskList(pendingTasks, 'pending') 
             : activeTab === 'in-process' ? renderTaskList(inProcessTasks, 'in-process')
             : renderTaskList(completedTasks, 'completed')}
        </div>
      </div>

      {taskToComplete && (
        <CompleteTaskModal
            isOpen={!!taskToComplete}
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            taskDescription={taskToComplete.description}
        />
      )}
      {viewingDocument && (
        <DocumentViewerModal 
            isOpen={!!viewingDocument}
            onClose={() => setViewingDocument(null)}
            document={viewingDocument}
        />
      )}
    </div>
  );
};

export default TasksList;