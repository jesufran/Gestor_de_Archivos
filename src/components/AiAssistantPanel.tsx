import React, { useState } from 'react';
import { Task, Document, OutgoingDocument } from '../types';
import { IconSparkles } from './icons/IconSparkles';
import { IconLoader } from './icons/IconLoader';
import { IconX } from './icons/IconX';

interface AiAssistantPanelProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    documents: Document[];
    outgoingDocuments: OutgoingDocument[];
}

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
    isOpen,
    onClose,
    tasks,
    documents,
    outgoingDocuments,
}) => {
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiQueryError, setAiQueryError] = useState<string | null>(null);

    const handleAiQuery = async () => {
        if (!aiQuery.trim() || isAiLoading) return;

        setIsAiLoading(true);
        setAiResponse('');
        setAiQueryError(null);

        try {
            const context = {
                tasks: tasks.map(t => ({ description: t.description, status: t.status, dueDate: t.dueDate, priority: t.priority })),
                incomingDocuments: documents.map(d => ({ from: d.from, subject: d.subject, received: d.createdAt, procedure: d.procedure })),
                outgoingDocuments: outgoingDocuments.map(d => ({ to: d.to, subject: d.subject, sent: d.sentAt })),
            };

            const prompt = `Eres un asistente experto para la aplicación "Gestor de Archivos y Tareas". Tu propósito es responder preguntas sobre el estado actual de las tareas y documentos del usuario. Sé conciso, amigable y directo en tus respuestas. Usa viñetas o listas si es apropiado para mayor claridad. Basa tus respuestas únicamente en los datos proporcionados. Si no puedes responder con los datos, indícalo amablemente.
            
Contexto de datos actual (en formato JSON):
${JSON.stringify(context, null, 2)}

Pregunta del usuario: "${aiQuery}"`;
            
            const response = await fetch('/.netlify/functions/gemini-proxy', {
                method: 'POST',
                body: JSON.stringify({ contents: prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }
            
            const resultData = await response.json();
            setAiResponse(resultData.text);

        } catch (error: any) {
            console.error("Error with AI query:", error);
            setAiQueryError(error.message || "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    React.useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setAiQuery('');
                setAiResponse('');
                setAiQueryError(null);
            }, 300); 
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <aside className={`flex flex-col flex-shrink-0 bg-white dark:bg-secondary-dark/40 border-l border-border-light dark:border-border-dark transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-96' : 'w-0'}`}>
            <div className="flex-grow flex flex-col min-w-[24rem]">
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
                    <div className="flex items-center">
                        <IconSparkles className="w-6 h-6 text-primary-light dark:text-primary-dark mr-3" />
                        <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">Asistente IA</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark" aria-label="Cerrar panel de IA">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Haz una pregunta sobre tus datos. Ej: "¿Qué tareas tengo para hoy?" o "¿Hay algún documento de Supervisión?".
                    </p>
                    
                     {(isAiLoading || aiResponse || aiQueryError) && (
                        <div className="p-4 bg-secondary-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark min-h-[6rem]">
                            {isAiLoading && (
                                <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark animate-pulse">
                                    <IconLoader className="w-5 h-5 mr-3" />
                                    <span>Pensando...</span>
                                </div>
                            )}
                            {aiQueryError && (
                                <p className="text-red-600 dark:text-red-400 text-sm">{aiQueryError}</p>
                            )}
                            {aiResponse && (
                                <p className="text-sm text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap">
                                    {aiResponse}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                 <div className="p-4 border-t border-border-light dark:border-border-dark flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                            placeholder="Escribe tu pregunta aquí..."
                            disabled={isAiLoading}
                            className="flex-grow px-4 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                        />
                        <button
                            onClick={handleAiQuery}
                            disabled={isAiLoading || !aiQuery.trim()}
                            className="flex items-center justify-center px-5 py-2 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAiLoading ? <IconLoader className="w-5 h-5" /> : 'Preguntar'}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AiAssistantPanel;
