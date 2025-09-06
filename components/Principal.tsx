import React, { useState } from 'react';
import { IconPlus } from './icons/IconPlus';
import Modal from './Modal';
import { Document, Task, OutgoingDocument, Folder } from '../types';
import { IconSparkles } from './icons/IconSparkles';
import { IconUpload } from './icons/IconUpload';
import { IconLoader } from './icons/IconLoader';
import { IconFolder } from './icons/IconFolder';
import { IconClipboard } from './icons/IconClipboard';
import { IconTrash } from './icons/IconTrash';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconBell } from './icons/IconBell';
import { IconNote } from './icons/IconNote';
import { IconTasks } from './icons/IconTasks';
import { IconInbox } from './icons/IconInbox';
import { IconOutbox } from './icons/IconOutbox';
import { IconFiles } from './icons/IconFiles';
import FolderSelector from './FolderSelector';
import { Type } from './ai/schema';

interface PrincipalProps {
    addDocumentAndTask: (document: Omit<Document, 'id' | 'createdAt' | 'orderNumber'>) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
    addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'orderNumber'>) => void;
    addOutgoingDocument: (doc: Omit<OutgoingDocument, 'id' | 'createdAt'>) => void;
    folders: Folder[];
    isReadOnly: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const Principal: React.FC<PrincipalProps> = ({ 
    addDocumentAndTask, 
    addTask, 
    addDocument, 
    addOutgoingDocument,
    folders,
    isReadOnly,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [action, setAction] = useState<'select' | 'register-doc' | 'quick-task' | 'register-outgoing-doc'>('select');
    const [modalSize, setModalSize] = useState<'2xl' | '4xl' | '6xl'>('4xl');
    const [modalTitle, setModalTitle] = useState('Seleccione una Acción');
    const [shouldCreateTask, setShouldCreateTask] = useState(false);
    
    const openModal = () => {
        setModalTitle('Seleccione una Acción');
        setModalSize('4xl');
        setAction('select');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setAction('select');
            setModalSize('4xl');
            setModalTitle('Seleccione una Acción');
        }, 300);
    };

    const handleActionSelect = (selectedAction: 'doc-task' | 'quick-task' | 'outgoing-doc') => {
        if (selectedAction === 'doc-task') {
            setShouldCreateTask(true);
            setAction('register-doc');
            setModalSize('6xl');
            setModalTitle('Registrar Documento Entrante');
        } else if (selectedAction === 'outgoing-doc') {
            setAction('register-outgoing-doc');
            setModalSize('6xl');
            setModalTitle('Registrar Documento Saliente');
        } else {
            setAction('quick-task');
            setModalSize('2xl');
            setModalTitle('Crear Tarea Rápida');
        }
    };
    
    const goBackToActionSelect = () => {
        setAction('select');
        setModalSize('4xl');
        setModalTitle('Seleccione una Acción');
    };
    
    const ActionCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center text-center p-6 border border-border-light dark:border-border-dark rounded-xl hover:bg-secondary-light dark:hover:bg-secondary-dark hover:border-primary-light dark:hover:border-primary-dark transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
        >
            <div className="mb-4 text-primary-light dark:text-primary-dark">{icon}</div>
            <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h4>
            <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">{description}</p>
        </button>
    );

    const FormRegisterDocument: React.FC<{ initialCreateTask: boolean }> = ({ initialCreateTask }) => {
        const [from, setFrom] = useState('');
        const [subject, setSubject] = useState('');
        const [body, setBody] = useState('');
        const [sentAt, setSentAt] = useState('');
        const [supportType, setSupportType] = useState<'papel' | 'electronico' | 'otro'>('electronico');
        const [documentNumber, setDocumentNumber] = useState('');
        const [folios, setFolios] = useState<number | ''>('');
        const [procedure, setProcedure] = useState('');
        const [createTask, setCreateTask] = useState(initialCreateTask);
        const [destinationFolder, setDestinationFolder] = useState<{ id: string; path: string } | null>(null);
        const [file, setFile] = useState<File | null>(null);
        const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
        const [pastedText, setPastedText] = useState('');
        const [analysisMode, setAnalysisMode] = useState<'file' | 'text'>('file');
        const [isAnalyzing, setIsAnalyzing] = useState(false);
        const [aiError, setAiError] = useState<string | null>(null);
        const [analysisDone, setAnalysisDone] = useState(false);
        const [isDragging, setIsDragging] = useState(false);
        
        const handleFileChange = (files: FileList | null) => {
            if (files && files.length > 0) {
                setFile(files[0]);
                setAiError(null);
                setAnalysisDone(false);
            }
        };

        const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                setAdditionalFiles(prev => [...prev, ...Array.from(e.target.files!)]);
            }
        };

        const removeAdditionalFile = (fileName: string) => {
            setAdditionalFiles(prev => prev.filter(f => f.name !== fileName));
        };
        
        const handleAnalyzeDocument = async () => {
            if (analysisMode === 'file' && !file) {
                 setAiError("Por favor, suba un archivo para analizar.");
                 return;
            }
            if (analysisMode === 'text' && !pastedText.trim()) {
                setAiError("Por favor, pegue el texto que desea analizar.");
                return;
            }
            setIsAnalyzing(true);
            setAiError(null);
            setAnalysisDone(false);
            try {
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        from: { type: Type.STRING, description: 'La persona, empresa o departamento que envía el documento.' },
                        subject: { type: Type.STRING, description: 'El asunto o tema principal del documento.' },
                        body: { type: Type.STRING, description: 'Un resumen corto y conciso del contenido o propósito del documento.' },
                        documentNumber: { type: Type.STRING, description: 'El número de identificación oficial del documento (ej. OFICIO-001, MEMO-023). Si no existe, dejar vacío.' },
                        folios: { type: Type.INTEGER, description: 'El número total de páginas o folios que contiene el documento. Si no se especifica, debe ser 1.' },
                        procedure: { type: Type.STRING, description: 'La acción o trámite específico que se debe realizar con este documento.' },
                        sentAt: { type: Type.STRING, description: 'La fecha de emisión del documento, en formato YYYY-MM-DD.' },
                    },
                    required: ['from', 'subject', 'procedure', 'sentAt']
                };
                
                let contents;
                if (analysisMode === 'file' && file) {
                    const prompt = "Analiza el siguiente documento oficial (puede ser una imagen, PDF, Word, etc.). Extrae la información clave basándote en el esquema proporcionado. Infiere el 'Trámite a seguir' a partir del contenido, resumiendo la acción principal que se solicita. Si alguna información no está presente, déjala como un string vacío, excepto los folios que deben ser 1 si no se especifican.";
                    const base64Data = await fileToBase64(file);
                    const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
                    contents = { parts: [ {text: prompt}, filePart ] };
                } else {
                    contents = `Analiza el siguiente texto de un documento oficial. Extrae la información clave basándote en el esquema proporcionado. Infiere el 'Trámite a seguir' a partir del contenido, resumiendo la acción principal que se solicita. Si alguna información no está presente, déjala como un string vacío, excepto los folios que deben ser 1 si no se especifican.\n\n---\n\nTEXTO DEL DOCUMENTO:\n${pastedText}\n\n---`;
                }

                const response = await fetch('/.netlify/functions/gemini-proxy', {
                    method: 'POST',
                    body: JSON.stringify({ contents, config: { responseMimeType: "application/json", responseSchema: schema } }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
                }
                const resultData = await response.json();
                let text = resultData.text.trim();
                
                try {
                    const result = JSON.parse(text);
                    setFrom(result.from || '');
                    setSubject(result.subject || '');
                    setBody(result.body || '');
                    setDocumentNumber(result.documentNumber || '');
                    setFolios(result.folios || '');
                    setProcedure(result.procedure || '');
                    setSentAt(result.sentAt || '');
                    setAnalysisDone(true);
                } catch (jsonError) {
                    console.error("Error parsing AI response:", jsonError, "Raw text:", text);
                    setAiError("La respuesta de la IA no tuvo un formato válido. Por favor intente de nuevo.");
                }
                
            } catch (error: any) {
                console.error("Error analyzing document:", error);
                setAiError(error.message || "Ocurrió un error inesperado al contactar la IA.");
            } finally {
                setIsAnalyzing(false);
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if(!from || !subject || !procedure) return;
            const newDoc: Omit<Document, 'id' | 'createdAt' | 'orderNumber'> = {
                name: file?.name || 'Documento de Texto', from, subject, body,
                file: file || undefined, sentAt, supportType,
                documentNumber, folios: folios === '' ? undefined : Number(folios),
                procedure, destinationFolder: destinationFolder || undefined,
                additionalFiles,
            };
            if (createTask) addDocumentAndTask(newDoc);
            else addDocument(newDoc);
            closeModal();
        }
        
        const AnalysisTypeButton: React.FC<{ label: string; icon: React.ReactNode; mode: 'file' | 'text';}> = ({ label, icon, mode }) => (
             <button type="button" onClick={() => setAnalysisMode(mode)} className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-colors ${ analysisMode === mode ? 'bg-primary-light dark:bg-primary-dark text-white' : 'bg-gray-200 dark:bg-border-dark hover:bg-gray-300 dark:hover:bg-hover-dark'}`}>
                {icon}
                <span className="ml-2">{label}</span>
            </button>
        )

        return (
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
                    <div className="lg:col-span-1 space-y-4 bg-gray-50 dark:bg-background-dark/50 p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                         <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">1. Analizar con IA</label>
                            <div className="flex space-x-2 bg-gray-100 dark:bg-background-dark p-1 rounded-lg">
                                <AnalysisTypeButton label="Archivo" mode="file" icon={<IconUpload className="w-5 h-5"/>} />
                                <AnalysisTypeButton label="Texto" mode="text" icon={<IconClipboard className="w-5 h-5"/>} />
                            </div>
                         </div>
                         
                        {analysisMode === 'file' && (
                            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }} className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${isDragging ? 'border-primary-light dark:border-primary-dark bg-secondary-light dark:bg-secondary-dark' : 'border-border-light dark:border-border-dark'}`}>
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                    <IconUpload className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                                    <span className="font-medium text-primary-light dark:text-primary-dark text-sm">Subir archivo principal</span>
                                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">o arrastre y suelte</span>
                                </label>
                                <input id="file-upload" type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFileChange(e.target.files)} className="hidden" />
                                {file && <p className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">Archivo: {file.name}</p>}
                            </div>
                        )}

                        {analysisMode === 'text' && (
                            <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} rows={6} placeholder="Pegue aquí el cuerpo de un correo electrónico o texto para analizar..." className="block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                        )}

                        <button type="button" onClick={handleAnalyzeDocument} disabled={isAnalyzing} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isAnalyzing ? <IconLoader className="w-5 h-5 mr-2" /> : <IconSparkles className="w-5 h-5 mr-2" />}
                            {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
                        </button>
                        {aiError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{aiError}</p>}
                        {analysisDone && <p className="mt-2 text-sm text-green-600 dark:text-green-400">¡Listo! Campos rellenados. Por favor, revise la información.</p>}

                         <div>
                            <h5 className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">2. Archivos Adjuntos Adicionales</h5>
                            <label htmlFor="additional-files-upload" className="w-full text-center cursor-pointer px-4 py-2 text-xs font-medium border border-dashed border-border-light dark:border-border-dark rounded-md hover:border-primary-light dark:hover:border-primary-dark flex items-center justify-center">
                                <IconPlus className="w-3 h-3 mr-1"/> Añadir más archivos...
                            </label>
                            <input id="additional-files-upload" type="file" multiple onChange={handleAdditionalFilesChange} className="hidden" />
                            <div className="mt-3 space-y-2">
                                {additionalFiles.map(f => (
                                    <div key={f.name} className="flex items-center justify-between text-sm bg-secondary-light dark:bg-secondary-dark p-2 rounded-md">
                                        <div className="flex items-center truncate">
                                            <IconPaperclip className="w-4 h-4 mr-2 flex-shrink-0" />
                                            <span className="truncate">{f.name}</span>
                                        </div>
                                        <button type="button" onClick={() => removeAdditionalFile(f.name)}>
                                            <IconTrash className="w-4 h-4 text-red-500 hover:text-red-700" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">3. Ubicación del Archivo</label>
                             <FolderSelector folders={folders} selectedFolder={destinationFolder} onSelect={(id, path) => setDestinationFolder({ id, path })} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-2 mt-6 lg:mt-0">
                        <fieldset disabled={isAnalyzing} className="space-y-2">
                            <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Datos del Documento</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="from" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Remitente</label>
                                    <input type="text" id="from" value={from} onChange={e => setFrom(e.target.value)} required placeholder="ej. Supervisión Escolar" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Asunto</label>
                                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="ej. Solicitud de certificación" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="sentAt" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Fecha de Envío</label>
                                    <input type="date" id="sentAt" value={sentAt} onChange={e => setSentAt(e.target.value)} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="receivedAt" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Fecha de Recibido</label>
                                    <input type="text" id="receivedAt" value={new Date().toLocaleDateString()} disabled className="mt-1 block w-full px-3 py-1.5 bg-gray-100 dark:bg-secondary-dark border-border-light dark:border-border-dark rounded-md shadow-sm sm:text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="documentNumber" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Nº de documento</label>
                                    <input type="text" id="documentNumber" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder="ej. OFI-023-2024" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                </div>
                                 <div className="sm:col-span-4">
                                    <label htmlFor="supportType" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Tipo de Soporte</label>
                                    <select id="supportType" value={supportType} onChange={e => setSupportType(e.target.value as any)} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm">
                                        <option value="electronico">Electrónico (CD, USB, Correo)</option>
                                        <option value="papel">Papel</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                 <div className="sm:col-span-2">
                                    <label htmlFor="folios" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">N° de Folios</label>
                                    <input type="number" id="folios" value={folios} onChange={e => setFolios(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="0" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="body" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Contenido / Resumen</label>
                                <textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" placeholder="Breve resumen del asunto o trámite solicitado en el documento." />
                            </div>
                             <div>
                                <label htmlFor="procedure" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Trámite a seguir</label>
                                <textarea id="procedure" value={procedure} onChange={e => setProcedure(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" placeholder="Anotar el trámite que se le dará a lo solicitado. Si crea una tarea, este será el contenido." />
                            </div>
                        </fieldset>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 space-x-2 border-t border-border-light dark:border-border-dark mt-4">
                    <div className="flex items-center">
                        <input id="createTask" type="checkbox" checked={createTask} onChange={e => setCreateTask(e.target.checked)} className="h-4 w-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-border-dark border-gray-300 dark:border-hover-dark rounded focus:ring-primary-light dark:focus:ring-primary-dark" />
                        <label htmlFor="createTask" className="ml-2 block text-sm text-text-primary-light dark:text-text-primary-dark">Crear una tarea asociada a este documento</label>
                    </div>
                     <div>
                        <button type="button" onClick={goBackToActionSelect} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Volver</button>
                        <button type="submit" className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark">
                            {createTask ? 'Guardar y Crear Tarea' : 'Archivar Documento'}
                        </button>
                    </div>
                </div>
            </form>
        );
    }
    
    const FormQuickTask: React.FC = () => {
        const [description, setDescription] = useState('');
        const [dueDate, setDueDate] = useState('');
        const [priority, setPriority] = useState<Task['priority']>('media');
        const [notes, setNotes] = useState('');
        const [reminder, setReminder] = useState(false);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if(!description) return;
            addTask({ description, dueDate, priority, notes, reminder });
            closeModal();
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Descripción de la Tarea</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="ej. Generar certificación de notas" className="block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Prioridad</label>
                        <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm">
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">Fecha de Vencimiento</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className="flex items-center text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                        <IconNote className="w-4 h-4 mr-2 text-text-secondary-light dark:text-text-secondary-dark" />
                        Agregar Nota (opcional)
                    </label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Añadir detalles adicionales sobre la tarea..." className="block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                </div>
                <div className="flex items-center pt-2">
                    <input id="reminder" type="checkbox" checked={reminder} onChange={e => setReminder(e.target.checked)} className="h-4 w-4 text-primary-light dark:text-primary-dark bg-gray-100 dark:bg-border-dark border-gray-300 dark:border-hover-dark rounded focus:ring-primary-light dark:focus:ring-primary-dark" />
                    <label htmlFor="reminder" className="ml-3 flex items-center text-sm text-text-primary-light dark:text-text-primary-dark">
                        <IconBell className="w-5 h-5 mr-2 text-text-secondary-light dark:text-text-secondary-dark" />
                        Activar recordatorio para esta tarea
                    </label>
                </div>
                <div className="flex justify-end pt-4 space-x-2 border-t border-border-light dark:border-border-dark mt-4">
                     <button type="button" onClick={goBackToActionSelect} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Volver</button>
                     <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark">Crear Tarea</button>
                </div>
            </form>
        );
    }
    
    const FormRegisterOutgoingDocument: React.FC = () => {
        const [to, setTo] = useState('');
        const [subject, setSubject] = useState('');
        const [body, setBody] = useState('');
        const [sentAt, setSentAt] = useState(new Date().toISOString().split('T')[0]);
        const [supportType, setSupportType] = useState<'papel' | 'electronico' | 'otro'>('papel');
        const [documentNumber, setDocumentNumber] = useState('');
        const [folios, setFolios] = useState<number | ''>('');
        const [receivedBy, setReceivedBy] = useState('');
        const [destinationFolder, setDestinationFolder] = useState<{ id: string; path: string } | null>(null);
        const [file, setFile] = useState<File | null>(null);
        const [isAnalyzing, setIsAnalyzing] = useState(false);
        const [aiError, setAiError] = useState<string | null>(null);
        const [analysisDone, setAnalysisDone] = useState(false);
        const [isDragging, setIsDragging] = useState(false);
        
        const handleFileChange = (files: FileList | null) => {
            if (files && files.length > 0) {
                setFile(files[0]);
                setAiError(null);
                setAnalysisDone(false);
            }
        };

        const handleAnalyzeDocument = async () => {
            if (!file) {
                 setAiError("Por favor, suba un archivo para analizar.");
                 return;
            }
            setIsAnalyzing(true);
            setAiError(null);
            setAnalysisDone(false);
            try {
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        to: { type: Type.STRING, description: 'La persona, empresa o departamento a quien se dirige el documento.' },
                        subject: { type: Type.STRING, description: 'El asunto o tema principal del documento.' },
                        documentNumber: { type: Type.STRING, description: 'El número de identificación oficial del documento (ej. OFICIO-001, MEMO-023). Si no existe, dejar vacío.' },
                        folios: { type: Type.INTEGER, description: 'El número total de páginas o folios que contiene el documento. Si no se especifica, debe ser 1.' },
                    },
                    required: ['to', 'subject']
                };
                const prompt = "Analiza el siguiente documento de salida (puede ser una imagen, PDF, Word, etc.). Extrae la información clave basándote en el esquema proporcionado. Si alguna información no está presente, déjala como un string vacío, excepto los folios que deben ser 1 si no se especifican.";
                const base64Data = await fileToBase64(file);
                const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
                const contents = { parts: [ {text: prompt}, filePart ] };
                
                const response = await fetch('/.netlify/functions/gemini-proxy', {
                    method: 'POST',
                    body: JSON.stringify({ contents, config: { responseMimeType: "application/json", responseSchema: schema } }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
                }
                const resultData = await response.json();
                let text = resultData.text.trim();
                
                const result = JSON.parse(text);
                setTo(result.to || '');
                setSubject(result.subject || '');
                setDocumentNumber(result.documentNumber || '');
                setFolios(result.folios || '');
                setAnalysisDone(true);
            } catch (error: any) {
                console.error("Error analyzing document:", error);
                setAiError(error.message || "Ocurrió un error inesperado al contactar la IA.");
            } finally {
                setIsAnalyzing(false);
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!to || !subject) return;
            addOutgoingDocument({ documentNumber, supportType, to, subject, body, folios: folios === '' ? undefined : Number(folios), receivedBy, sentAt, file: file || undefined, destinationFolder: destinationFolder || undefined });
            closeModal();
        };

        return (
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
                    <div className="lg:col-span-1 space-y-4 bg-gray-50 dark:bg-background-dark/50 p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                         <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">1. Adjuntar Archivo</label>
                            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }} className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors duration-200 ${isDragging ? 'border-primary-light dark:border-primary-dark bg-secondary-light dark:bg-secondary-dark' : 'border-border-light dark:border-border-dark'}`}>
                                <label htmlFor="outgoing-file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                                    <IconUpload className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                                    <span className="font-medium text-primary-light dark:text-primary-dark text-sm">Subir archivo de respuesta</span>
                                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">o arrastre y suelte</span>
                                </label>
                                <input id="outgoing-file-upload" type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" onChange={e => handleFileChange(e.target.files)} className="hidden" />
                                {file && <p className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">Archivo: {file.name}</p>}
                            </div>
                         </div>
                        <div>
                            <h5 className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">2. Analizar con IA</h5>
                            <button type="button" onClick={handleAnalyzeDocument} disabled={isAnalyzing || !file} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isAnalyzing ? <IconLoader className="w-5 h-5 mr-2" /> : <IconSparkles className="w-5 h-5 mr-2" />}
                                {isAnalyzing ? 'Analizando...' : 'Analizar para Autocompletar'}
                            </button>
                            {aiError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{aiError}</p>}
                            {analysisDone && <p className="mt-2 text-sm text-green-600 dark:text-green-400">¡Listo! Campos rellenados. Por favor, revise la información.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">3. Ubicación del Archivo</label>
                             <FolderSelector folders={folders} selectedFolder={destinationFolder} onSelect={(id, path) => setDestinationFolder({ id, path })} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-4 mt-6 lg:mt-0">
                        <fieldset disabled={isAnalyzing} className="space-y-4 disabled:opacity-60">
                            <div>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Datos del Documento Saliente</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                    <div>
                                        <label htmlFor="out-doc-number" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Nº de documento</label>
                                        <input type="text" id="out-doc-number" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder="ej. OFI-024-2024" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="out-support-type" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Tipo de Soporte</label>
                                        <select id="out-support-type" value={supportType} onChange={e => setSupportType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm">
                                            <option value="papel">Papel</option>
                                            <option value="electronico">Electrónico (CD, USB, Correo)</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="out-folios" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">N° de Folios</label>
                                        <input type="number" id="out-folios" value={folios} onChange={e => setFolios(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="0" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Destinatario y Contenido</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label htmlFor="out-to-2" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Destinatario</label>
                                        <input type="text" id="out-to-2" value={to} onChange={e => setTo(e.target.value)} required placeholder="ej. Dirección General" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="out-subject-2" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Asunto</label>
                                        <input type="text" id="out-subject-2" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="ej. Informe de actividades" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="out-body-2" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Contenido</label>
                                    <textarea id="out-body-2" value={body} onChange={e => setBody(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" placeholder="Detalles del documento..." />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Detalles de Envío</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label htmlFor="out-sent-at" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Fecha de Envío</label>
                                        <input type="date" id="out-sent-at" value={sentAt} onChange={e => setSentAt(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="out-received-by" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Recibido por</label>
                                        <input type="text" id="out-received-by" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Nombre y/o cargo" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>

                <div className="flex justify-end items-center pt-4 space-x-2 border-t border-border-light dark:border-border-dark mt-4">
                     <button type="button" onClick={goBackToActionSelect} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Volver</button>
                     <button type="submit" className="ml-2 px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark">
                         Registrar Salida
                     </button>
                </div>
            </form>
        );
    }

    const renderModalContent = () => {
        switch(action) {
            case 'select':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ActionCard title="Registrar Documento Entrante" description="Para correos entrantes que tiene un documentos adjunto y requiere programar una tarea." icon={<IconInbox className="w-10 h-10" />} onClick={() => handleActionSelect('doc-task')} />
                        <ActionCard title="Registrar Documento Saliente" description="Para registrar correos con documentos adjuntos u otros que no requieren programar una tarea." icon={<IconOutbox className="w-10 h-10" />} onClick={() => handleActionSelect('outgoing-doc')} />
                        <ActionCard title="Crear Tarea Rápida" description="Para solicitudes verbales o tareas simples sin documento." icon={<IconTasks className="w-10 h-10" />} onClick={() => handleActionSelect('quick-task')} />
                    </div>
                );
            case 'register-doc': return <FormRegisterDocument initialCreateTask={shouldCreateTask} />;
            case 'quick-task': return <FormQuickTask />;
            case 'register-outgoing-doc': return <FormRegisterOutgoingDocument />;
            default: return null;
        }
    }

    return (
        <div className="w-full min-h-full flex flex-col items-center justify-start text-center p-4 pt-12 md:pt-16">
            <IconFiles className="w-16 h-16 text-primary-light dark:text-primary-dark mb-6 opacity-80" />
            <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
                Bienvenido a su Gestor de Archivos y Tareas
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-text-secondary-light dark:text-text-secondary-dark">
                Organice, gestione y dé seguimiento a todos sus documentos y tareas en un solo lugar. Simplifique su flujo de trabajo y mantenga todo bajo control.
            </p>
            <div className="mt-10">
                <button
                    onClick={openModal}
                    disabled={isReadOnly}
                    className="flex items-center justify-center px-8 py-4 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-all duration-200 transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <IconPlus className="w-6 h-6 mr-3" />
                    Crear una acción
                </button>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} size={modalSize}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default Principal;
