import React from 'react';
import { FileSyncStatus } from '../types';
import { getFile } from '../db';
import { IconPaperclip } from './icons/IconPaperclip';
import { IconLoader } from './icons/IconLoader';
import { IconCloudUpload } from './icons/IconCloudUpload';

export const FileAttachment: React.FC<{ 
    file?: File;
    fileId?: string;
    syncStatus?: FileSyncStatus;
    downloadURL?: string;
    fileName?: string;
}> = ({ file, fileId, syncStatus, downloadURL, fileName }) => {

    const handleFileClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (syncStatus === 'synced' && downloadURL) {
            window.open(downloadURL, '_blank');
        } else {
            try {
                const localFile = file || (fileId ? await getFile(fileId) : undefined);
                if (localFile) {
                    const blobUrl = URL.createObjectURL(localFile);
                    window.open(blobUrl, '_blank');
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                } else {
                    alert('El archivo no se encontró en la base de datos local. Puede que aún se esté sincronizando.');
                }
            } catch (error) {
                console.error("Error opening local file:", error);
                alert("No se pudo abrir el archivo local.");
            }
        }
    };

    const getStatusIcon = () => {
        switch(syncStatus) {
            case 'syncing':
                return <IconLoader className="w-3 h-3 mr-1.5 text-primary-light dark:text-primary-dark" title="Sincronizando..." />;
            case 'synced':
                return <IconCloudUpload className="w-3 h-3 mr-1.5 text-green-500" title="Sincronizado" />;
            default:
                return <IconPaperclip className="w-3 h-3 mr-1.5 flex-shrink-0" />;
        }
    };

    return (
        <a href="#" onClick={handleFileClick} className="inline-flex items-center font-medium text-primary-light dark:text-primary-dark hover:underline">
            {getStatusIcon()}
            <span className="truncate max-w-xs">{fileName || file?.name}</span>
        </a>
    );
};