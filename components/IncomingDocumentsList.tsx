
import React, { useState, useMemo } from 'react';
import { Document } from '../types';
import { IconInbox } from './icons/IconInbox';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconFolder } from './icons/IconFolder';
import { IconSearch } from './icons/IconSearch';

interface IncomingDocumentsListProps {
  documents: Document[];
}

const InfoPill: React.FC<{ icon?: React.ReactNode; label?: string; value?: string | number | null }> = ({ icon, label, value }) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return (
        <div className="flex items-center bg-secondary-light dark:bg-secondary-dark rounded-full px-2.5 py-1 text-xs">
            {icon && <span className="mr-1.5 text-text-secondary-light dark:text-text-secondary-dark">{icon}</span>}
            {label && <span className="font-semibold mr-1 text-text-secondary-light dark:text-text-secondary-dark">{label}:</span>}
            <span className="text-text-primary-light dark:text-text-primary-dark">{value}</span>
        </div>
    );
};


const IncomingDocumentsList: React.FC<IncomingDocumentsListProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) {
      return documents;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.subject.toLowerCase().includes(lowercasedTerm) ||
      doc.from.toLowerCase().includes(lowercasedTerm) ||
      (doc.body && doc.body.toLowerCase().includes(lowercasedTerm)) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(lowercasedTerm)) ||
      (doc.procedure && doc.procedure.toLowerCase().includes(lowercasedTerm))
    );
  }, [documents, searchTerm]);


  if (documents.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center bg-background-light dark:bg-secondary-dark/40 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark">
        <IconInbox className="w-16 h-16 text-primary-light dark:text-primary-dark mb-6" />
        <h3 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
          Bandeja de Entrada Vacía
        </h3>
        <p className="mt-2 text-md text-text-secondary-light dark:text-text-secondary-dark max-w-md">
          Aún no se ha registrado ningún documento entrante. Cuando registre uno nuevo usando el botón 'Crear una acción', aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
        <input
          type="text"
          placeholder="Buscar por remitente, asunto, contenido..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
        />
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredDocuments.map(doc => {
            return (
              <div key={doc.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-border-light dark:border-border-dark transition-all duration-200 hover:shadow-md hover:border-primary-light/50 dark:hover:border-primary-dark/50">
                {/* Row 1: Main Info */}
                <div className="flex justify-between items-start gap-4">
                  {/* Left side: Subject & From */}
                  <div className="flex-1 truncate">
                    <h4 className="font-bold text-base text-primary-light dark:text-primary-dark truncate" title={doc.subject}>{doc.subject}</h4>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">De: <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{doc.from}</span></p>
                  </div>
                  {/* Right side: Numbers & Date */}
                  <div className="text-right flex-shrink-0 text-xs space-y-0.5 text-text-secondary-light dark:text-text-secondary-dark">
                    <p><span className="font-semibold">Nº Orden:</span> {String(doc.orderNumber).padStart(2, '0')}</p>
                    {doc.sentAt && <p><span className="font-semibold">F. Envío:</span> {new Date(doc.sentAt + 'T00:00:00').toLocaleDateString()}</p>}
                  </div>
                </div>
                
                {/* Content Section */}
                {doc.body && (
                  <div className="mt-3 text-xs text-text-primary-light dark:text-text-primary-dark bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-md">
                      <div>
                          <p className="font-semibold">Contenido:</p>
                          <p className="whitespace-pre-wrap">{doc.body}</p>
                      </div>
                  </div>
                )}

                {/* Footer: Folder, Attachments, and Metadata */}
                <div className="mt-3 pt-2 border-t border-border-light dark:border-border-dark flex items-center flex-wrap gap-x-4 gap-y-2 text-xs">
                  <InfoPill label="F. Recibido" value={new Date(doc.createdAt).toLocaleDateString()} />
                  <InfoPill label="Nº Doc" value={doc.documentNumber} />
                  <InfoPill label="Folios" value={doc.folios} />
                  <InfoPill label="Soporte" value={doc.supportType.charAt(0).toUpperCase() + doc.supportType.slice(1)} />
                  
                  {doc.file && (
                      <a href={URL.createObjectURL(doc.file)} download={doc.file.name} className="inline-flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline">
                        <IconPaperclip className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.file.name}</span>
                      </a>
                  )}
                  {doc.additionalFiles && doc.additionalFiles.map((file, index) => (
                    <a key={index} href={URL.createObjectURL(file)} download={file.name} className="inline-flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline">
                        <IconPaperclip className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </a>
                  ))}
                  <InfoPill icon={<IconFolder className="w-4 h-4" />} value={doc.destinationFolder?.path || 'Sin Ubicación Digital'} />
                  <InfoPill icon={<IconFolder className="w-4 h-4" />} label="Ubic. Física" value="Supervisión" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">No se encontraron documentos para "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default IncomingDocumentsList;
