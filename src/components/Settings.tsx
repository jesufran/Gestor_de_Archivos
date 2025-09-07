import React, { useState } from 'react';
import { Folder, ThemeMode, AccentColor, NetlifyUser } from '../types';
import { IconUser } from './icons/IconUser';
import { IconPalette } from './icons/IconPalette';
import { IconFolder } from './icons/IconFolder';
import { IconDatabase } from './icons/IconDatabase';
import { IconArchive } from './icons/IconArchive';
import FileOrganizationSettings from './FileOrganizationSettings';
import AppearanceSettings from './AppearanceSettings';
import DataManagementSettings from './DataManagementSettings';
import AnnualArchiveSettings from './AnnualArchiveSettings';
import ProfileSettings from './ProfileSettings';

type SettingsTab = 'profile' | 'appearance' | 'file-organization' | 'data-management' | 'annual-archive';

interface SettingsProps {
    user: NetlifyUser | null;
    folders: Folder[];
    onAddFolder: (name: string, parentId: string | null) => void;
    onRenameFolder: (id: string, newName:string) => void;
    onDeleteFolder: (id: string) => void;
    themeMode: ThemeMode;
    onThemeChange: (mode: ThemeMode) => void;
    accentColor: AccentColor;
    onAccentColorChange: (color: AccentColor) => void;
    handleExportFullBackup: () => Promise<void>;
    handleImportFullBackup: (file: File) => Promise<void>;
    availableArchives: number[];
    onArchiveYear: () => Promise<void>;
    onViewArchive: (year: number) => Promise<void>;
}

const Settings: React.FC<SettingsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings user={props.user} />;
            case 'appearance':
                return <AppearanceSettings 
                    themeMode={props.themeMode} 
                    onThemeChange={props.onThemeChange}
                    accentColor={props.accentColor}
                    onAccentColorChange={props.onAccentColorChange}
                />;
            case 'file-organization':
                return <FileOrganizationSettings {...props} />;
            case 'data-management':
                return <DataManagementSettings 
                    onExport={props.handleExportFullBackup}
                    onImport={props.handleImportFullBackup}
                />;
            case 'annual-archive':
                return <AnnualArchiveSettings
                    availableArchives={props.availableArchives}
                    onArchiveYear={props.onArchiveYear}
                    onViewArchive={props.onViewArchive}
                />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{
        tabId: SettingsTab;
        title: string;
        icon: React.ReactNode;
    }> = ({ tabId, title, icon }) => {
        const isActive = activeTab === tabId;
        return (
            <button 
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive 
                        ? 'bg-secondary-light dark:bg-secondary-dark text-primary-light dark:text-primary-dark'
                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-border-dark'
                }`}
            >
                {icon}
                <span className="ml-3">{title}</span>
            </button>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                <nav className="space-y-1">
                    <TabButton tabId="profile" title="Perfil y Cuenta" icon={<IconUser className="w-5 h-5"/>} />
                    <TabButton tabId="appearance" title="Apariencia" icon={<IconPalette className="w-5 h-5"/>} />
                    <TabButton tabId="file-organization" title="Organización de Archivos" icon={<IconFolder className="w-5 h-5"/>} />
                    <TabButton tabId="data-management" title="Gestión de Datos" icon={<IconDatabase className="w-5 h-5"/>} />
                    <TabButton tabId="annual-archive" title="Archivo Anual" icon={<IconArchive className="w-5 h-5"/>} />
                </nav>
            </aside>
            <main className="flex-1 bg-white dark:bg-secondary-dark/50 p-6 rounded-xl border border-border-light dark:border-border-dark">
                {renderTabContent()}
            </main>
        </div>
    );
};

// A placeholder icon component
const IconPalette: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.289-.47-.652-.47-1.043 0-.928.746-1.688 1.688-1.688.928 0 1.688.746 1.688 1.688 0 .437-.18.835-.47 1.125-.29.289-.47-.652-.47-1.043 0-.928.746-1.688 1.688-1.688.928 0 1.688.746 1.688 1.688 0 .437-.18.835-.47 1.125-.29.289-.47-.652-.47-1.043 0-.928.746-1.688 1.688-1.688.928 0 1.688.746 1.688 1.688.928 0 1.688.746 1.688 1.688a1.688 1.688 0 0 0 0-3.375c0-.928.746-1.688 1.688-1.688s1.688.746 1.688 1.688c0 .928-.746 1.688-1.688 1.688a1.688 1.688 0 0 0-1.688 1.688v.17A10 10 0 1 0 12 2z"></path>
    </svg>
);


export default Settings;