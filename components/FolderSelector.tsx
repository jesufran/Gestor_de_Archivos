
import React, { useState, useRef, useEffect } from 'react';
import { Folder } from '../types';
import { IconFolder } from './icons/IconFolder';
import { IconChevronDown } from './icons/IconChevronDown';
import { IconChevronRight } from './icons/IconChevronRight';

interface FolderOptionNodeProps {
    folder: Folder;
    level: number;
    onSelect: (id: string, path: string[]) => void;
}

const FolderOptionNode: React.FC<FolderOptionNodeProps> = ({ folder, level, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = folder.children.length > 0;

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(folder.id, [folder.name]);
    };
    
    const handleChildSelect = (childId: string, childPath: string[]) => {
        onSelect(childId, [folder.name, ...childPath]);
    };

    return (
        <div className="text-sm">
            <div 
                className="flex items-center justify-between p-2 rounded-md hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={handleSelect}
            >
                <div className="flex items-center flex-1 truncate">
                    {hasChildren && (
                         <button onClick={(e) => {e.stopPropagation(); setIsExpanded(!isExpanded)}} className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-border-dark">
                             <IconChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                         </button>
                    )}
                    <IconFolder className={`w-5 h-5 mr-3 flex-shrink-0 ${hasChildren ? '' : 'ml-7'}`} />
                    <span className="font-medium truncate text-text-primary-light dark:text-text-primary-dark">{folder.name}</span>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {folder.children.map(child => (
                        <FolderOptionNode 
                            key={child.id} 
                            folder={child} 
                            level={level + 1}
                            onSelect={handleChildSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


interface FolderSelectorProps {
    folders: Folder[];
    selectedFolder: { id: string; path: string } | null;
    onSelect: (id: string, path: string) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ folders, selectedFolder, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleSelect = (id: string, pathArray: string[]) => {
        onSelect(id, pathArray.join(' / '));
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-left bg-white dark:bg-border-dark border border-border-light dark:border-hover-dark rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark sm:text-sm"
            >
                <div className="flex items-center truncate">
                    <IconFolder className="w-5 h-5 mr-3 text-text-secondary-light dark:text-text-secondary-dark" />
                    <span className="truncate text-text-primary-light dark:text-text-primary-dark">
                        {selectedFolder?.path || 'Seleccionar carpeta...'}
                    </span>
                </div>
                 <IconChevronDown className={`w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary-dark rounded-md shadow-lg border border-border-light dark:border-border-dark max-h-60 overflow-y-auto p-2">
                    {folders.map(folder => (
                        <FolderOptionNode
                            key={folder.id}
                            folder={folder}
                            level={0}
                            onSelect={handleSelect}
                        />
                    ))}
                 </div>
            )}
        </div>
    );
};

export default FolderSelector;
