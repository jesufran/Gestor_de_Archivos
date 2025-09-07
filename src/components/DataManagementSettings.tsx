import React, { useState, useRef, useEffect } from 'react';
import { IconDownload } from './icons/IconDownload';
import { IconUpload } from './icons/IconUpload';
import { IconLoader } from './icons/IconLoader';
import Modal from './Modal';
import { IconComputer } from './icons/IconComputer';
import { IconCloudUpload } from './icons/IconCloudUpload';

interface DataManagementSettingsProps {
  onExport: () => Promise<void>;
  onImport: (file: File) => Promise<void>;
}

// Define the event type for the beforeinstallprompt event.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

const DataManagementSettings: React.FC<DataManagementSettingsProps> = ({ onExport, onImport }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setInstallPrompt(null);
            setIsAppInstalled(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if the app is already running in standalone mode.
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        // The userChoice property returns a Promise that resolves to an object
        // containing the outcome of the user's choice.
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        // We can only prompt once. Clear the prompt.
        setInstallPrompt(null);
    };
    
    const handleLocalExport = async () => {
        setIsExportModalOpen(false);
        setIsExporting(true);
        await onExport();
        setIsExporting(false);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!confirm("¡ADVERTENCIA!\n\nEsta acción reemplazará todos los datos actuales de la aplicación con los del archivo de respaldo.\n\nEsta operación no se puede deshacer. ¿Desea continuar?")) {
                if (e.target) e.target.value = ''; // Reset input if cancelled
                return;
            }
            setIsImporting(true);
            await onImport(file);
            setIsImporting(false);
        }
        if (e.target) e.target.value = '';
    };

    const ActionCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick?: () => void, disabled?: boolean, children?: React.ReactNode }> = ({ title, description, icon, onClick, disabled, children }) => {
        const commonClasses = "relative group flex flex-col items-center justify-start text-center p-6 border rounded-xl transition-all duration-200 h-full";
        const enabledClasses = "border-border-light dark:border-border-dark hover:bg-secondary-light dark:hover:bg-secondary-dark hover:border-primary-light dark:hover:border-primary-dark transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark";
        const disabledClasses = "border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark/50 opacity-60 cursor-not-allowed";

        if (disabled) {
             return (
                <div className={`${commonClasses} ${disabledClasses}`}>
                    {children}
                    {icon}
                    <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-4">{title}</h4>
                    <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">{description}</p>
                </div>
            );
        }

        return (
            <button
                onClick={onClick}
                className={`${commonClasses} ${enabledClasses}`}
            >
                {children}
                {icon}
                <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-4">{title}</h4>
                <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark">{description}</p>
            </button>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Respaldo y Restauración de Datos</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Exporte todos sus registros y archivos adjuntos a un solo archivo .zip, o restaure desde un respaldo previo.
                </p>
            </div>
            
            <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark/30">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Exportar (Crear Respaldo)</h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Guarde todos sus registros y archivos físicos. Elija si desea descargarlo a su PC o guardarlo en su servicio de nube preferido.
                </p>
                <button 
                    onClick={() => setIsExportModalOpen(true)}
                    disabled={isExporting || isImporting}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isExporting ? <IconLoader className="w-5 h-5 mr-2" /> : <IconDownload className="w-5 h-5 mr-2" />}
                    {isExporting ? 'Exportando...' : 'Crear Respaldo'}
                </button>
            </div>

            <div className="p-4 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300">Importar (Restaurar Respaldo)</h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    <span className="font-bold">¡ADVERTENCIA!</span> Esta acción reemplazará permanentemente todos los datos actuales en la aplicación. Use esta opción con precaución.
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".zip"
                    className="hidden"
                />
                <button
                    onClick={handleImportClick}
                    disabled={isImporting || isExporting}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isImporting ? <IconLoader className="w-5 h-5 mr-2" /> : <IconUpload className="w-5 h-5 mr-2" />}
                    {isImporting ? 'Importando...' : 'Seleccionar Archivo y Restaurar'}
                </button>
            </div>

             <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark/30">
                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Instalación Local</h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Instale la aplicación en su dispositivo para un acceso rápido y sin conexión, como si fuera una aplicación nativa.
                </p>
                {installPrompt && !isAppInstalled && (
                    <button 
                        onClick={handleInstallClick}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <IconDownload className="w-5 h-5 mr-2" />
                        Instalar Aplicación
                    </button>
                )}
                {isAppInstalled && (
                    <p className="mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
                        La aplicación ya está instalada en este dispositivo.
                    </p>
                )}
                {!installPrompt && !isAppInstalled && (
                     <p className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark italic">
                        La instalación no está disponible en este navegador o ya ha sido solicitada.
                    </p>
                )}
            </div>
            
            <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="¿Dónde desea guardar el respaldo?" size="lg">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <ActionCard 
                        title="Descargar a la Computadora"
                        description="Guarda un archivo .zip directamente en su dispositivo."
                        icon={<IconComputer className="w-12 h-12 text-primary-light dark:text-primary-dark" />}
                        onClick={handleLocalExport}
                    />
                    <ActionCard 
                        title="Guardar en la Nube"
                        description="Conecte su cuenta de OneDrive, Google Drive, etc."
                        icon={<IconCloudUpload className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark" />}
                        disabled
                    >
                        <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold text-white bg-slate-400 dark:bg-slate-600 rounded-full">Próximamente</div>
                        <div className="mt-auto pt-2 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
                           <b>Flujo actual:</b> Descargue el archivo y súbalo manualmente a su nube.
                        </div>
                    </ActionCard>
                 </div>
            </Modal>
        </div>
    );
};
export default DataManagementSettings;