import React, { useState } from 'react';
import { IconArchive } from './icons/IconArchive';
import { IconEye } from './icons/IconEye';
import { IconLoader } from './icons/IconLoader';

interface AnnualArchiveSettingsProps {
  availableArchives: number[];
  onArchiveYear: () => Promise<void>;
  onViewArchive: (year: number) => Promise<void>;
}

const AnnualArchiveSettings: React.FC<AnnualArchiveSettingsProps> = ({ availableArchives, onArchiveYear, onViewArchive }) => {
    const [isArchiving, setIsArchiving] = useState(false);
    const [isViewing, setIsViewing] = useState<number | null>(null);
    const currentYear = new Date().getFullYear();

    const handleArchiveClick = async () => {
        const confirmation = `Está a punto de archivar todos los registros y archivos del año ${currentYear}.\n\nEsta acción moverá los datos a un archivo histórico de solo lectura y limpiará su espacio de trabajo para el nuevo año.\n\nEsta acción no se puede deshacer. ¿Desea continuar?`;
        if (!confirm(confirmation)) {
            return;
        }
        setIsArchiving(true);
        await onArchiveYear();
        setIsArchiving(false);
    };
    
    const handleViewClick = async (year: number) => {
        setIsViewing(year);
        await onViewArchive(year);
        setIsViewing(null); // Reset after load, App state will handle the view mode
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Archivo Anual</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Finalice el ciclo de trabajo anual y consulte los datos históricos en modo de solo lectura.
                </p>
            </div>
            
            <div className="p-4 border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">Finalizar y Archivar el Año Actual</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                   Esta acción creará un archivo de solo lectura con todos los datos del año {currentYear} y reiniciará su espacio de trabajo. Realice esta acción al finalizar el año fiscal o de gestión.
                </p>
                <button 
                    onClick={handleArchiveClick}
                    disabled={isArchiving || availableArchives.includes(currentYear)}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isArchiving ? <IconLoader className="w-5 h-5 mr-2" /> : <IconArchive className="w-5 h-5 mr-2" />}
                    {isArchiving ? `Archivando ${currentYear}...` : `Archivar Año ${currentYear}`}
                </button>
                {availableArchives.includes(currentYear) && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">El año {currentYear} ya ha sido archivado.</p>
                )}
            </div>

            <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark/30">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Archivos Anuales Disponibles</h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Seleccione un año para consultar sus datos en modo de solo lectura.
                </p>
                <div className="mt-4 space-y-2">
                    {availableArchives.length > 0 ? (
                        availableArchives.map(year => (
                             <div key={year} className="flex items-center justify-between p-2 bg-white dark:bg-secondary-dark rounded-md">
                                <span className="font-medium text-sm text-text-primary-light dark:text-text-primary-dark">Archivo del año {year}</span>
                                <button
                                    onClick={() => handleViewClick(year)}
                                    disabled={!!isViewing}
                                    className="inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark text-xs font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-hover-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
                                >
                                    {isViewing === year ? <IconLoader className="w-4 h-4 mr-2" /> : <IconEye className="w-4 h-4 mr-2" />}
                                    {isViewing === year ? 'Cargando...' : 'Ver'}
                                </button>
                             </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark py-4">No hay archivos anuales disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Local IconEye component to avoid new file creation
const IconEye: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);


export default AnnualArchiveSettings;
