
import React, { useState } from 'react';
import { Folder } from '../types';
import { IconFolderPlus } from './icons/IconFolderPlus';
import { IconPencil } from './icons/IconPencil';
import { IconTrash } from './icons/IconTrash';
import { IconFolder } from './icons/IconFolder';
import { IconChevronRight } from './icons/IconChevronRight';

interface FolderNodeProps {
    folder: Folder;
    level: number;
    onAddSubfolder: (parentId: string) => void;
    onRename: (id: string, currentName: string) => void;
    onDelete: (id: string) => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({ folder, level, onAddSubfolder, onRename, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = folder.children.length > 0;

    return (
        <div>
            <div 
                className="group flex items-center justify-between p-2 rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark"
                style={{ paddingLeft: `${level * 24 + 8}px` }}
            >
                <div className="flex items-center flex-1 truncate">
                    {hasChildren && (
                         <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-border-dark">
                             <IconChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                         </button>
                    )}
                    <IconFolder className={`w-5 h-5 mr-3 flex-shrink-0 ${hasChildren ? '' : 'ml-7'}`} />
                    <span className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary-dark">{folder.name}</span>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddSubfolder(folder.id)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-border-dark" title="Añadir subcarpeta">
                        <IconFolderPlus className="w-4 h-4 text-green-600 dark:text-green-400"/>
                    </button>
                    <button onClick={() => onRename(folder.id, folder.name)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-border-dark" title="Renombrar">
                        <IconPencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    {!hasChildren && (
                        <button onClick={() => onDelete(folder.id)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-border-dark" title="Eliminar">
                            <IconTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {folder.children.map(child => (
                        <FolderNode 
                            key={child.id} 
                            folder={child} 
                            level={level + 1}
                            onAddSubfolder={onAddSubfolder}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FolderNode;
