
import React from 'react';
import { Document, OutgoingDocument, Section, Task } from '../types';
import { IconInbox } from './icons/IconInbox';
import { IconOutbox } from './icons/IconOutbox';
import { IconTasks } from './icons/IconTasks';

interface SearchResult {
    type: 'Entrante' | 'Saliente' | 'Tarea';
    data: Document | OutgoingDocument | Task;
    section: Section;
}

interface GlobalSearchResultsProps {
    results: SearchResult[];
    onResultClick: (section: Section) => void;
    onClose: () => void;
}

const getResultDetails = (result: SearchResult) => {
    switch (result.type) {
        case 'Entrante': 
            const doc = result.data as Document;
            return { icon: <IconInbox className="w-5 h-5"/>, title: doc.subject, subtitle: `De: ${doc.from}` };
        case 'Saliente': 
            const outDoc = result.data as OutgoingDocument;
            return { icon: <IconOutbox className="w-5 h-5"/>, title: outDoc.subject, subtitle: `Para: ${outDoc.to}` };
        case 'Tarea': 
            const task = result.data as Task;
            return { icon: <IconTasks className="w-5 h-5"/>, title: task.description, subtitle: `Prioridad: ${task.priority}` };
        default: 
            return { icon: null, title: 'Resultado', subtitle: '' };
    }
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ results, onResultClick, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
            <div 
                className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-secondary-dark rounded-lg shadow-2xl border border-border-light dark:border-border-dark max-h-[70vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {results.length > 0 ? (
                    <ul>
                        <li className="p-3 border-b border-border-light dark:border-border-dark text-xs text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                            Resultados de la Búsqueda ({results.length})
                        </li>
                        {results.map((result, index) => {
                            const { icon, title, subtitle } = getResultDetails(result);
                            return (
                                <li key={`${result.type}-${result.data.id}-${index}`}>
                                    <button 
                                        onClick={() => onResultClick(result.section)}
                                        className="w-full text-left flex items-center p-3 hover:bg-secondary-light dark:hover:bg-border-dark border-b border-border-light dark:border-border-dark last:border-b-0 transition-colors"
                                    >
                                        <div className="mr-4 text-primary-light dark:text-primary-dark">{icon}</div>
                                        <div className="flex-1 truncate">
                                            <p className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark truncate">{title}</p>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{subtitle}</p>
                                        </div>
                                        <span className="text-xs font-medium bg-gray-200 dark:bg-background-dark text-text-secondary-light dark:text-text-secondary-dark px-2 py-1 rounded-full">{result.type}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                        <p>No se encontraron resultados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalSearchResults;
