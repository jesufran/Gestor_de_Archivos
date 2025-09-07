
import React from 'react';
import { Document } from '../types';
import Modal from './Modal';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconFolder } from './icons/IconFolder';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

const InfoPill: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
    if (!value && value !== 0 && typeof value !== 'string') return null;
    return (
        <div className="flex items-center bg-secondary-light dark:bg-secondary-dark rounded-full px-3 py-1 text-xs">
            <span className="font-semibold mr-1.5 text-text-secondary-light dark:text-text-secondary-dark">{label}:</span>
            <span className="text-text-primary-light dark:text-text-primary-dark">{value}</span>
        </div>
    )
};

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document }) => {
  if (!isOpen) return null;

  const hasAttachments = document.file || (document.additionalFiles && document.additionalFiles.length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Documento">
        <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">De: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{document.from}</span></p>
              <h4 className="text-lg font-bold text-primary-light dark:text-primary-dark mt-1">{document.subject}</h4>
            </div>

            <div className="my-3 flex flex-wrap gap-2">
              <InfoPill label="Nº Orden" value={String(document.orderNumber).padStart(2, '0')} />
              <InfoPill label="Nº Documento" value={document.documentNumber} />
              <InfoPill label="Folios" value={document.folios} />
              <InfoPill label="Soporte" value={document.supportType.charAt(0).toUpperCase() + document.supportType.slice(1)} />
              {document.sentAt && <InfoPill label="Fecha Envío" value={new Date(document.sentAt + 'T00:00:00').toLocaleDateString()} />}
            </div>

            {document.body && (
              <div className="text-sm text-text-primary-light dark:text-text-primary-dark bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <p className="font-semibold mb-1">Contenido / Resumen:</p>
                  <p className="whitespace-pre-wrap">{document.body}</p>
              </div>
            )}
             {document.procedure && (
              <div className="text-sm text-text-primary-light dark:text-text-primary-dark bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <p className="font-semibold mb-1">Trámite a seguir:</p>
                  <p className="whitespace-pre-wrap">{document.procedure}</p>
              </div>
            )}

            {(hasAttachments || document.destinationFolder) && (
              <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark space-y-2 text-sm">
                 <h5 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Archivos y Ubicación</h5>
                {document.destinationFolder && (
                    <div className="flex items-center text-text-secondary-light dark:text-text-secondary-dark font-medium">
                        <IconFolder className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{document.destinationFolder.path}</span>
                    </div>
                )}
                {document.file && (
                    <a
                      href={URL.createObjectURL(document.file)}
                      download={document.file.name}
                      className="inline-flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline"
                    >
                      <IconPaperclip className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{document.file.name}</span>
                    </a>
                )}
                {document.additionalFiles && document.additionalFiles.map((file, index) => (
                   <a
                      key={index}
                      href={URL.createObjectURL(file)}
                      download={file.name}
                      className="flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline"
                    >
                      <IconPaperclip className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{file.name}</span>
                    </a>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light">Cerrar</button>
            </div>
        </div>
    </Modal>
  );
};

export default DocumentViewerModal;
