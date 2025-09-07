
import React, { useState, useMemo } from 'react';
import { OutgoingDocument } from '../types';
import { IconOutbox } from './icons/IconOutbox';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconFolder } from './icons/IconFolder';
import { IconSearch } from './icons/IconSearch';

interface OutgoingDocumentsListProps {
  documents: OutgoingDocument[];
}

const InfoPill: React.FC<{ icon?: React.ReactNode; label?: string; value: string | number | undefined | null }> = ({ icon, label, value }) => {
    const displayValue = (value !== undefined && value !== null && value !== '') ? value : '-';
    return (
        <div className="flex items-center bg-secondary-light dark:bg-secondary-dark rounded-full px-2.5 py-1 text-xs">
            {icon && <span className="mr-1.5 text-text-secondary-light dark:text-text-secondary-dark">{icon}</span>}
            {label && <span className="font-semibold mr-1 text-text-secondary-light dark:text-text-secondary-dark">{label}:</span>}
            <span className="text-text-primary-light dark:text-text-primary-dark">{displayValue}</span>
        </div>
    )
};

const OutgoingDocumentsList: React.FC<OutgoingDocumentsListProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) {
      return documents;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return documents.filter(doc =>
      doc.subject.toLowerCase().includes(lowercasedTerm) ||
      doc.to.toLowerCase().includes(lowercasedTerm) ||
      (doc.body && doc.body.toLowerCase().includes(lowercasedTerm)) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(lowercasedTerm)) ||
      (doc.receivedBy && doc.receivedBy.toLowerCase().includes(lowercasedTerm))
    );
  }, [documents, searchTerm]);


  if (documents.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center bg-background-light dark:bg-secondary-dark/40 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark">
        <IconOutbox className="w-16 h-16 text-primary-light dark:text-primary-dark mb-6" />
        <h3 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
          Sin Documentos Salientes
        </h3>
        <p className="mt-2 text-md text-text-secondary-light dark:text-text-secondary-dark max-w-md">
          Aún no se ha registrado ningún documento de salida. Puede registrar uno al completar una tarea o directamente desde la pantalla 'Principal'.
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
          placeholder="Buscar por destinatario, asunto, recibido por..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
        />
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-border-light dark:border-border-dark transition-all duration-200 hover:shadow-md hover:border-primary-light/50 dark:hover:border-primary-dark/50">
              
              {/* Row 1: Main Info */}
              <div className="flex justify-between items-start gap-4">
                {/* Left side: Subject, To, Received By */}
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-base text-primary-light dark:text-primary-dark truncate" title={doc.subject}>{doc.subject}</h4>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                    Para: <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{doc.to}</span>
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                        Recibido: <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{doc.receivedBy || '-'}</span>
                    </p>
                </div>
                {/* Right side: Doc Number & Date */}
                <div className="text-right flex-shrink-0 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <p>
                      <span className="mr-3">
                        <span className="font-semibold">Nº Doc:</span> {doc.documentNumber || '-'}
                      </span>
                    <span>
                      {doc.sentAt 
                        ? new Date(doc.sentAt + 'T00:00:00').toLocaleDateString() 
                        : new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Content Section */}
              {doc.body && (
                <div className="mt-3 text-xs text-text-primary-light dark:text-text-primary-dark bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-md">
                  <p className="whitespace-pre-wrap">{doc.body}</p>
                </div>
              )}

              {/* Footer: Metadata */}
              <div className="mt-3 pt-2 border-t border-border-light dark:border-border-dark flex items-center flex-wrap gap-x-4 gap-y-2 text-xs">
                <InfoPill label="Folios" value={doc.folios} />
                <InfoPill label="Soporte" value={doc.supportType ? doc.supportType.charAt(0).toUpperCase() + doc.supportType.slice(1) : undefined} />
                <InfoPill icon={<IconFolder className="w-4 h-4" />} value={doc.destinationFolder?.path || 'Sin Ubicación'} />

                {doc.file && (
                    <a href={URL.createObjectURL(doc.file)} download={doc.file.name} className="inline-flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline">
                      <IconPaperclip className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-xs">{doc.file.name}</span>
                    </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">No se encontraron documentos para "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
};

export default OutgoingDocumentsList;
