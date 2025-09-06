
import React, { useState, useEffect } from 'react';
import { Task, Document, OutgoingDocument, Folder } from '../types';
import Modal from './Modal';
import { IconSend } from './icons/IconSend';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconFolder } from './icons/IconFolder';
import { IconSparkles } from './icons/IconSparkles';
import { IconLoader } from './icons/IconLoader';
import FolderSelector from './FolderSelector';
import { Type } from './ai/schema';

interface OutgoingDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<OutgoingDocument, 'id' | 'createdAt' | 'relatedTaskId' | 'file'>) => void;
  task: Task;
  originalDocument?: Document;
  resultFile: File | null;
  folders: Folder[];
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

const OutgoingDocModal: React.FC<OutgoingDocModalProps> = ({ isOpen, onClose, onSubmit, task, originalDocument, resultFile, folders }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [supportType, setSupportType] = useState<'papel' | 'electronico' | 'otro'>('papel');
  const [folios, setFolios] = useState<number | ''>('');
  const [receivedBy, setReceivedBy] = useState('');
  const [sentAt, setSentAt] = useState(new Date().toISOString().split('T')[0]);
  const [destinationFolder, setDestinationFolder] = useState<{ id: string; path: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleAnalyzeDocument = async () => {
      if (!resultFile) {
          setAiError("No hay archivo adjunto para analizar.");
          return;
      }

      setIsAnalyzing(true);
      setAiError(null);
      setAnalysisDone(false);

      try {
          const schema = {
              type: Type.OBJECT,
              properties: {
                  to: { type: Type.STRING, description: 'El destinatario principal del documento.' },
                  subject: { type: Type.STRING, description: 'El asunto o tema principal del documento.' },
                  body: { type: Type.STRING, description: 'Un resumen corto y conciso del contenido o propósito del documento.' },
                  documentNumber: { type: Type.STRING, description: 'El número de identificación oficial del documento (ej. OFICIO-001, MEMO-023). Si no existe, dejar vacío.' },
                  folios: { type: Type.INTEGER, description: 'El número total de páginas o folios que contiene el documento. Si no se especifica, debe ser 1.' },
                  receivedBy: { type: Type.STRING, description: 'La persona o departamento que recibe el documento, si se menciona. Si no, dejar vacío.' },
              },
          };

          const prompt = "Analiza el siguiente documento de respuesta (puede ser una imagen, PDF, Word, etc.). Extrae la información clave basándote en el esquema proporcionado para rellenar un formulario de registro de salida. Si alguna información no está presente, déjala como un string vacío, excepto los folios que deben ser 1 si no se especifican.";
          const base64Data = await fileToBase64(resultFile);
          const filePart = { inlineData: { mimeType: resultFile.type, data: base64Data } };
          const contents = { parts: [ { text: prompt }, filePart ] };

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
          
          setTo(result.to || to);
          setSubject(result.subject || subject);
          setBody(result.body || '');
          setDocumentNumber(result.documentNumber || '');
          setFolios(result.folios || '');
          setReceivedBy(result.receivedBy || '');
          setAnalysisDone(true);

      } catch (error: any) {
          console.error("Error analyzing document:", error);
          setAiError(error.message || "Error al analizar el documento. Por favor, llene los campos manualmente.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  useEffect(() => {
    if (isOpen) {
        setAnalysisDone(false);
        setAiError(null);
        if (originalDocument) {
          setTo(originalDocument.from);
          setSubject(`RE: ${originalDocument.subject}`);
          setDestinationFolder(originalDocument.destinationFolder || null);
        } else {
            setTo('');
            setSubject(`Respuesta a tarea: ${task.description}`);
            setDestinationFolder(null);
        }
        setDocumentNumber('');
        setSupportType('papel');
        setFolios('');
        setReceivedBy('');
        setBody('');
        setSentAt(new Date().toISOString().split('T')[0]);

        if (resultFile) {
            const timer = setTimeout(() => handleAnalyzeDocument(), 300);
            return () => clearTimeout(timer);
        }
    }
  }, [isOpen, originalDocument, task, resultFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) return;
    onSubmit({
      to, subject, body, documentNumber, supportType,
      folios: folios === '' ? undefined : Number(folios),
      receivedBy, sentAt,
      destinationFolder: destinationFolder || undefined,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Salida y Completar Tarea">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
            <div className="lg:col-span-1 space-y-4 bg-gray-50 dark:bg-background-dark/50 p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                {resultFile && (
                    <div>
                        <h5 className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">1. Archivo de Respuesta</h5>
                        <div className="p-3 bg-secondary-light dark:bg-secondary-dark rounded-md flex items-center text-sm border border-border-light dark:border-border-dark">
                            <IconPaperclip className="w-5 h-5 mr-3 text-primary-light dark:text-primary-dark flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{resultFile.name}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">2. Ubicación del Archivo</label>
                    <FolderSelector folders={folders} selectedFolder={destinationFolder} onSelect={(id, path) => setDestinationFolder({ id, path })} />
                </div>
                 <div>
                    <h5 className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">3. Asistente IA</h5>
                    <button type="button" onClick={handleAnalyzeDocument} disabled={isAnalyzing || !resultFile} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isAnalyzing ? <IconLoader className="w-5 h-5 mr-2" /> : <IconSparkles className="w-5 h-5 mr-2" />}
                        {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
                    </button>
                    {aiError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{aiError}</p>}
                    {analysisDone && !isAnalyzing && <p className="mt-2 text-sm text-green-600 dark:text-green-400">¡Análisis completo! Revisa los campos.</p>}
                </div>
            </div>

            <div className="lg:col-span-2 space-y-2 mt-6 lg:mt-0">
                <fieldset disabled={isAnalyzing} className="space-y-4 disabled:opacity-60">
                    <div>
                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Datos del Documento</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                            <div>
                                <label htmlFor="out-modal-doc-number" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Nº de documento</label>
                                <input type="text" id="out-modal-doc-number" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder="ej. OFI-024-2024" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="out-modal-support-type" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Tipo de Soporte</label>
                                <select id="out-modal-support-type" value={supportType} onChange={e => setSupportType(e.target.value as any)} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm">
                                    <option value="papel">Papel</option>
                                    <option value="electronico">Electrónico (CD, USB, Correo)</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="out-modal-folios" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">N° de Folios</label>
                                <input type="number" id="out-modal-folios" value={folios} onChange={e => setFolios(e.target.value === '' ? '' : parseInt(e.target.value, 10))} min="0" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Destinatario y Contenido</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="out-modal-to" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Destinatario</label>
                                <input type="text" id="out-modal-to" value={to} onChange={e => setTo(e.target.value)} required className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="out-modal-subject" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Asunto</label>
                                <input type="text" id="out-modal-subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="out-modal-body" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Contenido</label>
                            <textarea id="out-modal-body" value={body} onChange={e => setBody(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" placeholder="Detalles del documento..." />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Detalles de Envío</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="out-modal-sent-at" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Fecha de Envío</label>
                                <input type="date" id="out-modal-sent-at" value={sentAt} onChange={e => setSentAt(e.target.value)} required className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="out-modal-received-by" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Recibido por</label>
                                <input type="text" id="out-modal-received-by" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} placeholder="Nombre y/o cargo" className="mt-1 block w-full px-3 py-1.5 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm" />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
        
        <div className="flex justify-end pt-4 mt-4 space-x-2 border-t border-border-light dark:border-border-dark">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancelar</button>
          <button type="submit" disabled={isAnalyzing} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600">
            {isAnalyzing ? <IconLoader className="w-4 h-4 mr-2" /> : <IconSend className="w-4 h-4 mr-2" />}
            {isAnalyzing ? 'Analizando...' : 'Registrar y Completar Tarea'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OutgoingDocModal;
