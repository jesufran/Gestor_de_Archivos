
import React, { useState } from 'react';
import { Folder } from '../types';
import FolderNode from './FolderNode';
import Modal from './Modal';
import { IconFolderPlus } from './icons/IconFolderPlus';

interface FileOrganizationSettingsProps {
    folders: Folder[];
    onAddFolder: (name: string, parentId: string | null) => void;
    onRenameFolder: (id: string, newName:string) => void;
    onDeleteFolder: (id: string) => void;
}

const FileOrganizationSettings: React.FC<FileOrganizationSettingsProps> = ({ folders, onAddFolder, onRenameFolder, onDeleteFolder }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'add' | 'rename' | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [currentFolderName, setCurrentFolderName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');

    const openModal = (action: 'add' | 'rename', folderId: string | null, folderName = '') => {
        setModalAction(action);
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);
        setNewFolderName(action === 'rename' ? folderName : '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalAction(null);
        setCurrentFolderId(null);
        setNewFolderName('');
        setCurrentFolderName('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        if (modalAction === 'add') {
            onAddFolder(newFolderName, currentFolderId);
        } else if (modalAction === 'rename' && currentFolderId) {
            onRenameFolder(currentFolderId, newFolderName);
        }
        closeModal();
    };
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Gestionar Estructura de Carpetas</h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Cree y organice las carpetas y subcarpetas para archivar sus documentos.
                    </p>
                </div>
                <button 
                    onClick={() => openModal('add', null)}
                    className="flex items-center px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-sm font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark"
                >
                    <IconFolderPlus className="w-5 h-5 mr-2" />
                    Añadir Ámbito Principal
                </button>
            </div>
            
            <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark/50 min-h-[300px]">
                {folders.length > 0 ? (
                    folders.map(folder => (
                        <FolderNode
                            key={folder.id}
                            folder={folder}
                            level={0}
                            onAddSubfolder={(parentId) => openModal('add', parentId)}
                            onRename={(id, name) => openModal('rename', id, name)}
                            onDelete={onDeleteFolder}
                        />
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">No hay carpetas. Empiece añadiendo un ámbito principal.</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalAction === 'add' ? (currentFolderId ? 'Añadir Nueva Subcarpeta' : 'Añadir Nuevo Ámbito') : 'Renombrar Carpeta'}
                size="2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalAction === 'add' && currentFolderId && (
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Creando una subcarpeta dentro de: <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{currentFolderName}</span>
                        </p>
                    )}
                    <div>
                        <label htmlFor="folderName" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                           Nombre de la Carpeta
                        </label>
                        <input
                            type="text"
                            id="folderName"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            required
                            autoFocus
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
                        />
                    </div>
                     <div className="flex justify-end pt-4 space-x-2">
                         <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-border-dark rounded-md hover:bg-gray-200 dark:hover:bg-hover-dark focus:outline-none">Cancelar</button>
                         <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none">
                            {modalAction === 'add' ? 'Crear Carpeta' : 'Guardar Cambios'}
                         </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FileOrganizationSettings;
