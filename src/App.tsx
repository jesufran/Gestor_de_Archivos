import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Section, ThemeMode, Document, Task, OutgoingDocument, Folder, AccentColor, Toast, ToastType, NetlifyUser } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ContentPlaceholder from '../components/ContentPlaceholder';
import Principal from '../components/Principal';
import TasksList from '../components/TasksList';
import OutgoingDocModal from '../components/OutgoingDocModal';
import OutgoingDocumentsList from '../components/OutgoingDocumentsList';
import IncomingDocumentsList from '../components/IncomingDocumentsList';
import WelcomeCard from '../components/WelcomeCard';
import AiAssistantPanel from '../components/AiAssistantPanel';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import GlobalSearchResults from '../components/GlobalSearchResults';
import NotificationsModal from '../components/NotificationsModal';
import ToastContainer from '../components/ToastContainer';
import ArchiveViewBanner from '../components/ArchiveViewBanner';
import { saveArchive, getArchive, listArchives, saveFile, getFile } from '../db';
import { IconLoader } from '../components/icons/IconLoader';
import LoginScreen from '../components/LoginScreen';
import BackupReminderBanner from '../components/BackupReminderBanner';

const sectionDescriptions: Record<Section, string> = {
  [Section.Principal]: "Empiece a gestionar sus documentos y tareas.",
  [Section.Entrantes]: "Consulte y gestione todos los documentos que ha recibido.",
  [Section.Tareas]: "Organice, priorice y dé seguimiento a todas sus tareas.",
  [Section.Salientes]: "Explore el archivo de todos los documentos que ha enviado.",
  [Section.Informes]: "Genere reportes y visualice estadísticas de su flujo de trabajo.",
  [Section.Ajustes]: "Personalice la configuración de la aplicación y su cuenta.",
};

const initialFolders: Folder[] = [
    { id: '1', name: 'Ámbito I, Institucional', children: [
        { id: '1-1', name: 'Dirección General', children: [] },
        { id: '1-2', name: 'Recursos Humanos', children: [] },
    ]},
    { id: '2', name: 'Ámbito II, Ministerio de Educación', children: [
        { id: '2-1', name: 'Departamento de Planificación', children: [
            { id: '2-1-1', name: 'División de Presupuesto', children: [] },
        ]}
    ]}
];

interface SearchResult {
    type: 'Entrante' | 'Saliente' | 'Tarea';
    data: Document | OutgoingDocument | Task;
    section: Section;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const APP_DATA_KEY_PREFIX = 'gestorProData';
const APP_SETTINGS_KEY = 'gestorProSettings';
const LAST_BACKUP_KEY = 'gestorProLastBackup';

// Helper function to create a savable version of the state by replacing files with IDs
const createStorableState = (documents: Document[], tasks: Task[], outgoingDocuments: OutgoingDocument[], folderStructure: Folder[]) => {
    return {
        documents: documents.map(({ file, additionalFiles, ...doc }) => ({
            ...doc,
            fileId: file ? (doc.fileId || `file-${crypto.randomUUID()}`) : undefined,
            fileName: file?.name,
            additionalFileIds: additionalFiles?.map((f, i) => doc.additionalFileIds?.[i] || `file-${crypto.randomUUID()}`),
            additionalFileNames: additionalFiles?.map(f => f.name),
        })),
        tasks: tasks.map(({ resultFile, ...task }) => ({
            ...task,
            resultFileId: resultFile ? (task.resultFileId || `file-${crypto.randomUUID()}`) : undefined,
            resultFileName: resultFile?.name,
        })),
        outgoingDocuments: outgoingDocuments.map(({ file, ...doc }) => ({
            ...doc,
            fileId: file ? (doc.fileId || `file-${crypto.randomUUID()}`) : undefined,
            fileName: file?.name,
        })),
        folderStructure,
    };
};

// Helper to create a temporary user for demonstration purposes
const createMockUser = (): NetlifyUser => ({
  id: 'temp-user-01',
  user_metadata: {
    full_name: 'Usuario de Demostración',
  },
  email: 'demo@example.com',
  token: {
    access_token: 'mock-token-for-local-use',
  },
});

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<NetlifyUser | null>(null);

  // State initialization with defaults
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('indigo');
  const [activeSection, setActiveSection] = useState<Section>(Section.Principal);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outgoingDocuments, setOutgoingDocuments] = useState<OutgoingDocument[]>([]);
  const [folderStructure, setFolderStructure] = useState<Folder[]>(initialFolders);
  const [taskBeingCompleted, setTaskBeingCompleted] = useState<Task | null>(null);
  const [resultFileForTask, setResultFileForTask] = useState<File | null>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [archiveViewYear, setArchiveViewYear] = useState<number | null>(null);
  const [availableArchives, setAvailableArchives] = useState<number[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const syncTimeoutRef = useRef<number | null>(null);
  
  const appDataKey = user ? `${APP_DATA_KEY_PREFIX}_${user.id}` : null;

  useEffect(() => {
    // To re-enable login, set this to true
    const LOGIN_ENABLED = true;

    if (LOGIN_ENABLED && window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user) => {
        setUser(user as NetlifyUser | null);
      });
      window.netlifyIdentity.on('login', (user) => {
        setUser(user as NetlifyUser);
        window.netlifyIdentity.close();
      });
      window.netlifyIdentity.on('logout', () => {
        setUser(null);
        resetLocalData();
      });
      window.netlifyIdentity.init();
    } else if (!LOGIN_ENABLED) {
      setUser(createMockUser());
    }
  }, []);

  // Async data loading on startup
  useEffect(() => {
    const bootstrapApp = async () => {
        try {
            const settingsStr = localStorage.getItem(APP_SETTINGS_KEY);
            const settings = settingsStr ? JSON.parse(settingsStr) : {};
            setThemeMode(settings.themeMode || 'system');
            setAccentColor(settings.accentColor || 'indigo');
            
            // Check for backup reminder
            const lastBackupStr = localStorage.getItem(LAST_BACKUP_KEY);
            if (lastBackupStr) {
                const lastBackupDate = new Date(lastBackupStr);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                if (lastBackupDate < oneWeekAgo) {
                    setShowBackupReminder(true);
                }
            } else {
                setShowBackupReminder(true); // Show if no backup has ever been made
            }

            if (user && user.id !== 'temp-user-01') {
              setSyncStatus('syncing');
              addToast('Sincronizando datos desde la nube...', 'info');
              const response = await fetch('/.netlify/functions/getFromFirestore', {
                  headers: { Authorization: `Bearer ${user.token.access_token}` },
              });
              if (!response.ok) throw new Error('No se pudo obtener los datos de la nube.');
              const cloudData = await response.json();
              await loadData(cloudData, false);
              setSyncStatus('synced');
            } else {
                // For mock user, just load local data
                const dataStr = appDataKey ? localStorage.getItem(appDataKey) : null;
                const localData = dataStr ? JSON.parse(dataStr) : undefined;
                await loadData(localData, true);
                setSyncStatus('idle');
            }
        } catch (e: any) {
            console.error("Error bootstrapping app:", e);
            addToast(`Error al conectar con la nube: ${e.message}. Cargando datos locales.`, 'error');
            setSyncStatus('error');
            // Fallback to local data if cloud fails
            const dataStr = appDataKey ? localStorage.getItem(appDataKey) : null;
            const localData = dataStr ? JSON.parse(dataStr) : undefined;
            await loadData(localData, true);
        } finally {
            setIsLoaded(true);
        }
    };
    if (user) {
        bootstrapApp();
    } else {
      setIsLoaded(true);
    }
  }, [user]);

  const loadData = async (dataToLoad?: any, fromLocalStorage = true) => {
    try {
        let data;
        if (dataToLoad) {
            data = dataToLoad;
        } else if (fromLocalStorage && appDataKey) {
            const dataStr = localStorage.getItem(appDataKey);
            data = dataStr ? JSON.parse(dataStr) : {};
        } else {
            data = {};
        }

        const hydratedDocuments = data.documents ? await Promise.all(data.documents.map(async (doc: any) => {
            const file = doc.fileId ? await getFile(doc.fileId) : undefined;
            const additionalFiles = doc.additionalFileIds ? await Promise.all(doc.additionalFileIds.map((id: string) => getFile(id))) : [];
            return { ...doc, file, additionalFiles: additionalFiles.filter(f => f) };
        })) : [];

        const hydratedOutgoing = data.outgoingDocuments ? await Promise.all(data.outgoingDocuments.map(async (doc: any) => {
            const file = doc.fileId ? await getFile(doc.fileId) : undefined;
            return { ...doc, file };
        })) : [];

        const hydratedTasks = data.tasks ? await Promise.all(data.tasks.map(async (task: any) => {
            const resultFile = task.resultFileId ? await getFile(task.resultFileId) : undefined;
            return { ...task, resultFile };
        })) : [];
        
        setDocuments(hydratedDocuments);
        setTasks(hydratedTasks);
        setOutgoingDocuments(hydratedOutgoing);
        setFolderStructure(data.folderStructure || initialFolders);
    } catch (e) {
        console.error("Could not load and hydrate data", e);
        addToast("Error al cargar los datos. Puede que estén corruptos.", "error");
    }
  };

  const resetLocalData = () => {
    setDocuments([]);
    setTasks([]);
    setOutgoingDocuments([]);
    setFolderStructure(initialFolders);
    if(appDataKey) localStorage.removeItem(appDataKey);
  };

  const syncToFirestore = async (state: any) => {
    if (!user || user.id === 'temp-user-01') return;
    try {
        const response = await fetch('/.netlify/functions/syncToFirestore', {
            method: 'POST',
            headers: { Authorization: `Bearer ${user.token.access_token}` },
            body: JSON.stringify(state),
        });
        if (!response.ok) throw new Error('La respuesta del servidor no fue exitosa.');
        setSyncStatus('synced');
    } catch (e) {
        console.error("Could not sync to firestore", e);
        setSyncStatus('error');
        addToast('Error al sincronizar con la nube.', 'error');
    }
  };

  // Effect for saving data
  useEffect(() => {
    if (!isLoaded || archiveViewYear || !appDataKey) return;
    
    const saveData = async () => {
        try {
            // 1. Save local files to IndexedDB
            for (const doc of documents) {
                if (doc.file && doc.fileId) await saveFile(doc.fileId, doc.file);
                if (doc.additionalFiles && doc.additionalFileIds) {
                    for (let i = 0; i < doc.additionalFiles.length; i++) {
                        if (doc.additionalFiles[i] && doc.additionalFileIds[i]) {
                            await saveFile(doc.additionalFileIds[i], doc.additionalFiles[i]);
                        }
                    }
                }
            }
            for (const task of tasks) {
                if (task.resultFile && task.resultFileId) await saveFile(task.resultFileId, task.resultFile);
            }
            for (const doc of outgoingDocuments) {
                if (doc.file && doc.fileId) await saveFile(doc.fileId, doc.file);
            }

            const storableState = createStorableState(documents, tasks, outgoingDocuments, folderStructure);
            
            // 2. Save state reference to localStorage
            localStorage.setItem(appDataKey, JSON.stringify(storableState));
            
            // 3. Debounce sync to Firestore
            setSyncStatus('syncing');
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = window.setTimeout(() => {
                syncToFirestore(storableState);
            }, 2000);

        } catch (e) {
            console.error("Could not save state", e);
            setSyncStatus('error');
            addToast("Error guardando datos.", 'error');
        }
    };
    saveData();
  }, [documents, tasks, outgoingDocuments, folderStructure, isLoaded, archiveViewYear, appDataKey]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}`;
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    try {
      if (!isLoaded) return;
      const settingsToSave = { themeMode, accentColor };
      localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (e) {
      console.error("Could not save settings to local storage", e);
    }
  }, [themeMode, accentColor, isLoaded]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (themeMode === 'system') setTheme(e.matches ? 'dark' : 'light');
    };
    if (themeMode === 'system') {
      handleThemeChange(mediaQuery);
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    } else {
      setTheme(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors: Record<AccentColor, { light: string; dark: string }> = {
      indigo: { light: '243 89% 60%', dark: '236 89% 77%' },
      green: { light: '145 63% 42%', dark: '138 76% 58%' },
      purple: { light: '262 84% 59%', dark: '263 78% 73%' },
      orange: { light: '25 95% 53%', dark: '35 92% 65%' },
      rose: { light: '347 77% 58%', dark: '346 89% 70%' },
      sky: { light: '201 89% 57%', dark: '202 92% 65%' },
      teal: { light: '173 70% 40%', dark: '174 74% 50%' },
      slate: { light: '215 14% 34%', dark: '215 20% 65%' },
    };
    root.style.setProperty('--color-primary-light', colors[accentColor].light);
    root.style.setProperty('--color-primary-dark', colors[accentColor].dark);
  }, [accentColor]);
  
  useEffect(() => {
      if (!globalSearchTerm.trim()) {
          setSearchResults([]);
          return;
      }
      const lowercasedTerm = globalSearchTerm.toLowerCase();
      const foundDocs = documents.filter(doc => (doc.subject.toLowerCase().includes(lowercasedTerm) || doc.from.toLowerCase().includes(lowercasedTerm) || (doc.body && doc.body.toLowerCase().includes(lowercasedTerm)) || (doc.documentNumber && doc.documentNumber.toLowerCase().includes(lowercasedTerm)))).map(doc => ({ type: 'Entrante', data: doc, section: Section.Entrantes } as SearchResult));
      const foundOutDocs = outgoingDocuments.filter(doc => (doc.subject.toLowerCase().includes(lowercasedTerm) || doc.to.toLowerCase().includes(lowercasedTerm) || (doc.body && doc.body.toLowerCase().includes(lowercasedTerm)) || (doc.documentNumber && doc.documentNumber.toLowerCase().includes(lowercasedTerm)))).map(doc => ({ type: 'Saliente', data: doc, section: Section.Salientes } as SearchResult));
      const foundTasks = tasks.filter(task => (task.description.toLowerCase().includes(lowercasedTerm))).map(task => ({ type: 'Tarea', data: task, section: Section.Tareas } as SearchResult));
      setSearchResults([...foundDocs, ...foundOutDocs, ...foundTasks]);
  }, [globalSearchTerm, documents, outgoingDocuments, tasks]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              setIsSearchActive(false);
              setGlobalSearchTerm('');
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchResultClick = (section: Section) => {
      setActiveSection(section);
      setGlobalSearchTerm('');
      setIsSearchActive(false);
  };

  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  
  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode !== 'system') setTheme(mode);
  };

  const toggleAiPanel = () => setIsAiPanelOpen(prev => !prev);

  const addDocument = (document: Omit<Document, 'id' | 'createdAt' | 'orderNumber'>) => {
    const today = new Date().toISOString().split('T')[0];
    const documentsToday = documents.filter(doc => doc.createdAt.startsWith(today));
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      ...document,
      orderNumber: documentsToday.length + 1,
      createdAt: new Date().toISOString(),
      fileId: document.file ? `file-${crypto.randomUUID()}` : undefined,
      additionalFileIds: document.additionalFiles?.map(() => `file-${crypto.randomUUID()}`),
    };
    setDocuments(prev => [newDocument, ...prev]);
    addToast('Documento archivado exitosamente.', 'success');
  };

  const addDocumentAndTask = (document: Omit<Document, 'id' | 'createdAt' | 'orderNumber'>) => {
    const today = new Date().toISOString().split('T')[0];
    const documentsToday = documents.filter(doc => doc.createdAt.startsWith(today));
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      ...document,
      orderNumber: documentsToday.length + 1,
      createdAt: new Date().toISOString(),
      fileId: document.file ? `file-${crypto.randomUUID()}` : undefined,
      additionalFileIds: document.additionalFiles?.map(() => `file-${crypto.randomUUID()}`),
    };
    const newTask: Task = {
      id: `task-${Date.now()}`, description: document.procedure, status: 'pendiente',
      relatedDocumentId: newDocument.id, createdAt: new Date().toISOString(), priority: 'media',
      dueDate: document.sentAt,
    };
    setDocuments(prev => [newDocument, ...prev]);
    setTasks(prev => [newTask, ...prev]);
    addToast('Documento y tarea creados exitosamente.', 'success');
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = { id: `task-${Date.now()}`, ...task, status: 'pendiente', createdAt: new Date().toISOString() };
    setTasks(prev => [newTask, ...prev]);
    addToast('Tarea rápida creada.', 'success');
  };

  const addOutgoingDocument = (doc: Omit<OutgoingDocument, 'id' | 'createdAt'>) => {
    const newDoc: OutgoingDocument = {
      id: `outdoc-${Date.now()}`, ...doc,
      fileName: doc.file?.name, createdAt: new Date().toISOString(),
      fileId: doc.file ? `file-${crypto.randomUUID()}` : undefined,
    };
    setOutgoingDocuments(prev => [newDoc, ...prev]);
    addToast('Documento saliente registrado.', 'success');
  };

  const updateTask = (taskId: string, updatedData: Partial<Task>) => {
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? { ...task, ...updatedData } : task));
    if (updatedData.status && updatedData.status !== oldTask.status) {
        let statusMessage = '';
        if (updatedData.status === 'en proceso') statusMessage = 'iniciada';
        if (updatedData.status === 'completada') statusMessage = 'completada';
        if (statusMessage) addToast(`Tarea "${oldTask.description.substring(0, 20)}..." marcada como ${statusMessage}.`, 'info');
    } else if (!updatedData.status) {
         addToast(`Tarea "${oldTask.description.substring(0, 20)}..." actualizada.`, 'info');
    }
  };

  const handleStartTaskCompletion = (task: Task, resultFile: File) => {
    setTaskBeingCompleted(task);
    setResultFileForTask(resultFile);
  };

  const handleFinalizeCompletion = (outgoingDocData: Omit<OutgoingDocument, 'id' | 'createdAt' | 'relatedTaskId' | 'file'>) => {
    if (!taskBeingCompleted || !resultFileForTask) return;
    const resultFileId = `file-${crypto.randomUUID()}`;
    const newOutgoingDoc: OutgoingDocument = {
      id: `outdoc-${Date.now()}`, ...outgoingDocData,
      file: resultFileForTask, fileName: resultFileForTask.name,
      fileId: resultFileId,
      relatedTaskId: taskBeingCompleted.id, createdAt: new Date().toISOString(),
    };
    setOutgoingDocuments(prev => [newOutgoingDoc, ...prev]);
    setTasks(prevTasks => prevTasks.map(t => t.id === taskBeingCompleted.id ? { ...t, status: 'completada', completedAt: new Date().toISOString(), resultFile: resultFileForTask, resultFileId } : t));
    setTaskBeingCompleted(null);
    setResultFileForTask(null);
    addToast('Tarea completada y documento de salida registrado.', 'success');
  };

  const relatedDocumentForTask = taskBeingCompleted ? documents.find(d => d.id === taskBeingCompleted.relatedDocumentId) : undefined;

  const addFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = { id: `folder-${Date.now()}`, name, children: [] };
    if (!parentId) {
        setFolderStructure(prev => [...prev, newFolder]);
        addToast(`Ámbito "${name}" creado.`, 'success');
        return;
    }
    const updateRecursively = (folders: Folder[]): Folder[] => folders.map(f => {
        if (f.id === parentId) return { ...f, children: [...f.children, newFolder] };
        if (f.children.length > 0) return { ...f, children: updateRecursively(f.children) };
        return f;
    });
    setFolderStructure(updateRecursively);
    addToast(`Carpeta "${name}" creada.`, 'success');
  };

  const renameFolder = (id: string, newName: string) => {
     const updateRecursively = (folders: Folder[]): Folder[] => folders.map(f => {
        if (f.id === id) return { ...f, name: newName };
        if (f.children.length > 0) return { ...f, children: updateRecursively(f.children) };
        return f;
    });
    setFolderStructure(updateRecursively);
    addToast(`Carpeta renombrada a "${newName}".`, 'success');
  };

  const deleteFolder = (id: string) => {
    const updateRecursively = (folders: Folder[]): Folder[] => folders.filter(f => f.id !== id).map(f => {
        if (f.children.length > 0) return { ...f, children: updateRecursively(f.children) };
        return f;
    });
    setFolderStructure(updateRecursively);
    addToast('Carpeta eliminada.', 'success');
  };
  
  const restoreDataFromZipBlob = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(blob);
    const dataFile = zip.file("data.json");
    if (!dataFile) throw new Error("El archivo de respaldo es inválido o está corrupto (falta data.json).");

    const jsonData = await dataFile.async("string");
    const restoredData = JSON.parse(jsonData);

    const processFilesForDoc = async (doc: any, defaultNewFolder: string, defaultOldFolder: string) => {
        const basePath = doc.destinationFolder?.path?.replace(/ \/ /g, '/');

        // Main file
        if (doc.fileName) {
            const pathsToTry = [
                basePath ? `${basePath}/${doc.fileName}` : null,
                `${defaultNewFolder}/${doc.fileName}`,
                `${defaultOldFolder}/${doc.fileName}`
            ].filter(Boolean) as string[];

            for (const path of pathsToTry) {
                const fileEntry = zip.file(path);
                if (fileEntry) {
                    const blob = await fileEntry.async("blob");
                    const file = new File([blob], doc.fileName, { type: blob.type });
                    doc.fileId = doc.fileId || `file-${crypto.randomUUID()}`;
                    await saveFile(doc.fileId, file);
                    break; // Found it, move to next file
                }
            }
        }

        // Additional files
        if (doc.additionalFileNames?.length > 0) {
            doc.additionalFileIds = doc.additionalFileIds || [];
            for (let i = 0; i < doc.additionalFileNames.length; i++) {
                const fileName = doc.additionalFileNames[i];
                const pathsToTry = [
                    basePath ? `${basePath}/${fileName}` : null,
                    `${defaultNewFolder}/${fileName}`,
                    `${defaultOldFolder}/${fileName}`
                ].filter(Boolean) as string[];

                for (const path of pathsToTry) {
                    const fileEntry = zip.file(path);
                    if (fileEntry) {
                        const blob = await fileEntry.async("blob");
                        const file = new File([blob], fileName, { type: blob.type });
                        doc.additionalFileIds[i] = doc.additionalFileIds[i] || `file-${crypto.randomUUID()}`;
                        await saveFile(doc.additionalFileIds[i], file);
                        break;
                    }
                }
            }
        }
    };
    
    // Process task result files
    const processTaskFiles = async (tasks: any[]) => {
         for (const task of tasks) {
            if (task.resultFileName) {
                const fileEntry = zip.file(`Resultados_de_Tareas/${task.resultFileName}`);
                if (fileEntry) {
                    const blob = await fileEntry.async("blob");
                    const file = new File([blob], task.resultFileName, { type: blob.type });
                    task.resultFileId = task.resultFileId || `file-${crypto.randomUUID()}`;
                    await saveFile(task.resultFileId, file);
                }
            }
        }
    }

    if (restoredData.documents) {
        await Promise.all(restoredData.documents.map((doc: any) => processFilesForDoc(doc, "Documentos_Entrantes_Sin_Carpeta", "incoming")));
    }
    if (restoredData.outgoingDocuments) {
        await Promise.all(restoredData.outgoingDocuments.map((doc: any) => processFilesForDoc(doc, "Documentos_Salientes_Sin_Carpeta", "outgoing")));
    }
    if (restoredData.tasks) {
        await processTaskFiles(restoredData.tasks);
    }
      
    await loadData(restoredData, false);
  };

  const handleExportFullBackup = async () => {
    addToast('Iniciando la creación del respaldo...', 'info');
    try {
        const zip = new JSZip();
        const storableState = createStorableState(documents, tasks, outgoingDocuments, folderStructure);
        zip.file("data.json", JSON.stringify(storableState, null, 2));

        const addDocumentsToZip = (docs: any[], defaultFolderName: string) => {
            for (const doc of docs) {
                // Replace " / " with "/" to create a valid path for the zip.
                const path = doc.destinationFolder?.path.replace(/ \/ /g, '/') || defaultFolderName;
                const targetFolder = zip.folder(path);
                if (!targetFolder) continue;

                if (doc.file) {
                    const fileName = doc.fileName || doc.file.name;
                    if (fileName) {
                        targetFolder.file(fileName, doc.file);
                    }
                }
                if (doc.additionalFiles) { // Only for incoming docs
                    for (const f of doc.additionalFiles) {
                        if (f.name) {
                            targetFolder.file(f.name, f);
                        }
                    }
                }
            }
        };

        // Pass documents with their associated File objects for zipping
        addDocumentsToZip(documents, "Documentos_Entrantes_Sin_Carpeta");
        addDocumentsToZip(outgoingDocuments, "Documentos_Salientes_Sin_Carpeta");
        
        const taskResultsFolder = zip.folder("Resultados_de_Tareas");
        if (taskResultsFolder) {
            for (const task of tasks) {
                if (task.resultFile) {
                    const fileName = (task as any).resultFileName || task.resultFile.name;
                    if (fileName) {
                       taskResultsFolder.file(fileName, task.resultFile);
                    }
                }
            }
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `respaldo_gestor_pro_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
        setShowBackupReminder(false);
        addToast('Respaldo completo descargado exitosamente.', 'success');
    } catch (e) {
        console.error("Error creating full backup:", e);
        addToast('Ocurrió un error al crear el respaldo.', 'error');
    }
};

  const handleImportFullBackup = async (file: File) => {
    addToast('Restaurando desde el respaldo...', 'info');
    try {
      await restoreDataFromZipBlob(file);
      addToast('Restauración completada exitosamente.', 'success');
    } catch (e) {
      console.error("Error restoring from backup:", e);
      addToast('Error al restaurar el respaldo. El archivo puede estar corrupto.', 'error');
    }
  };
  
  useEffect(() => {
    const fetchArchives = async () => {
        const years = await listArchives();
        setAvailableArchives(years);
    };
    fetchArchives();
  }, []);

  const handleArchiveYear = async () => {
    const currentYear = new Date().getFullYear();
    addToast(`Archivando datos del año ${currentYear}...`, 'info');
    try {
        const zip = new JSZip();
        const storableState = createStorableState(documents, tasks, outgoingDocuments, folderStructure);
        zip.file("data.json", JSON.stringify(storableState, null, 2));
        
        const incomingFolder = zip.folder("incoming");
        if(incomingFolder) { for (const doc of documents) { if (doc.file) { incomingFolder.file(doc.file.name, doc.file); }}}
        const outgoingFolder = zip.folder("outgoing");
        if(outgoingFolder) { for (const doc of outgoingDocuments) { if (doc.file && doc.fileName) { outgoingFolder.file(doc.fileName, doc.file); }}}

        const content = await zip.generateAsync({ type: "blob" });
        await saveArchive(currentYear, content);

        resetLocalData();
        
        setAvailableArchives(prev => [currentYear, ...prev].sort((a,b)=>b-a));
        addToast(`Año ${currentYear} archivado exitosamente.`, 'success');
    } catch (error) {
        console.error("Error archiving year:", error);
        addToast(`Ocurrió un error al archivar el año ${currentYear}.`, 'error');
    }
  };

  const handleViewArchive = async (year: number) => {
    addToast(`Cargando archivo del año ${year}...`, 'info');
    try {
        const archiveBlob = await getArchive(year);
        if (!archiveBlob) throw new Error(`No se encontró el archivo para el año ${year}.`);
        await restoreDataFromZipBlob(archiveBlob);
        setArchiveViewYear(year);
        addToast(`Viendo los datos del año ${year} (Modo Solo Lectura).`, 'info');
    } catch (error) {
        console.error("Error loading archive:", error);
        addToast(`Error al cargar el archivo del año ${year}.`, 'error');
    }
  };

  const handleExitArchiveView = async () => {
    addToast('Volviendo al año actual...', 'info');
    setArchiveViewYear(null);
    setIsLoaded(false); // Force reload from cloud/local
    if (user) {
        const bootstrapApp = async () => {
            try {
                if (user.id === 'temp-user-01') {
                    const dataStr = appDataKey ? localStorage.getItem(appDataKey) : null;
                    const localData = dataStr ? JSON.parse(dataStr) : undefined;
                    await loadData(localData, true);
                    setSyncStatus('idle');
                } else {
                    setSyncStatus('syncing');
                    const response = await fetch('/.netlify/functions/getFromFirestore', {
                        headers: { Authorization: `Bearer ${user.token.access_token}` },
                    });
                    if (!response.ok) throw new Error('No se pudo obtener los datos de la nube.');
                    const cloudData = await response.json();
                    await loadData(cloudData, false);
                    setSyncStatus('synced');
                }
            } catch (e) {
                console.error("Error reloading current year data:", e);
                setSyncStatus('error');
                const dataStr = appDataKey ? localStorage.getItem(appDataKey) : null;
                const localData = dataStr ? JSON.parse(dataStr) : undefined;
                await loadData(localData, true); // Fallback to local
            } finally {
                setIsLoaded(true);
            }
        };
        bootstrapApp();
    }
  };

  const handleRetrySync = () => {
    if (syncStatus === 'syncing' || !appDataKey) return;
    addToast('Reintentando la sincronización...', 'info');
    setSyncStatus('syncing');
    const storableState = createStorableState(documents, tasks, outgoingDocuments, folderStructure);
    setTimeout(() => {
        syncToFirestore(storableState);
    }, 100);
  };

  const renderContent = () => {
    const isReadOnly = !!archiveViewYear;
    switch (activeSection) {
      case Section.Principal:
        return <Principal addDocumentAndTask={addDocumentAndTask} addTask={addTask} addDocument={addDocument} addOutgoingDocument={addOutgoingDocument} folders={folderStructure} isReadOnly={isReadOnly} />;
      case Section.Entrantes:
        return <IncomingDocumentsList documents={documents} />;
      case Section.Tareas:
        return <TasksList tasks={tasks} documents={documents} onStartCompletion={handleStartTaskCompletion} updateTask={updateTask} isReadOnly={isReadOnly} />;
      case Section.Salientes:
        return <OutgoingDocumentsList documents={outgoingDocuments} />;
      case Section.Informes:
        return <Reports tasks={tasks} documents={documents} outgoingDocuments={outgoingDocuments} />;
      case Section.Ajustes:
        return <Settings user={user} folders={folderStructure} onAddFolder={addFolder} onRenameFolder={renameFolder} onDeleteFolder={deleteFolder} themeMode={themeMode} onThemeChange={handleThemeModeChange} accentColor={accentColor} onAccentColorChange={setAccentColor} handleExportFullBackup={handleExportFullBackup} handleImportFullBackup={handleImportFullBackup} availableArchives={availableArchives} onArchiveYear={handleArchiveYear} onViewArchive={handleViewArchive} />;
      default:
        return <ContentPlaceholder title={activeSection} />;
    }
  };

  const handleLogout = () => {
      if (user?.id === 'temp-user-01') {
          addToast('El cierre de sesión está desactivado en el modo de demostración.', 'info');
          return;
      }
      if (window.netlifyIdentity) {
          window.netlifyIdentity.logout();
      }
  };
  
  if (!user) {
    return <LoginScreen onLogin={() => {
      if (window.netlifyIdentity) {
        window.netlifyIdentity.open();
      } else {
        console.error('Netlify Identity widget not loaded.');
        alert('El servicio de autenticación no se ha cargado. Por favor, recargue la página.');
      }
    }} />
}

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <IconLoader className="w-12 h-12 text-primary-light dark:text-primary-dark" />
        <p className="ml-4 text-lg">Cargando y sincronizando datos...</p>
      </div>
    );
  }

  const headerTitle = activeSection === Section.Principal ? "Gestor Archivístico y de Tareas" : activeSection;
  const headerDescription = sectionDescriptions[activeSection];
  const hasPendingTasks = tasks.some(t => t.status === 'pendiente');
  const hasInProcessTasks = tasks.some(t => t.status === 'en proceso');
  const isReadOnly = !!archiveViewYear;

  const handleGoToSettings = () => {
    setActiveSection(Section.Ajustes);
    setShowBackupReminder(false);
  };

  return (
    <>
      <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-sans">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} theme={theme} toggleTheme={toggleTheme} themeMode={themeMode} currentYearView={archiveViewYear} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {showBackupReminder && !isReadOnly && (
            <BackupReminderBanner onDismiss={() => setShowBackupReminder(false)} onGoToSettings={handleGoToSettings} />
          )}
          {isReadOnly && <ArchiveViewBanner year={archiveViewYear!} onExit={handleExitArchiveView} />}
          <Header title={headerTitle} description={headerDescription} onToggleAiPanel={toggleAiPanel} isAiPanelOpen={isAiPanelOpen} globalSearchTerm={globalSearchTerm} onGlobalSearchChange={setGlobalSearchTerm} onSearchFocus={() => setIsSearchActive(true)} hasPendingTasks={hasPendingTasks} hasInProcessTasks={hasInProcessTasks} onBellClick={() => setIsNotificationsModalOpen(true)} user={user} onLogout={handleLogout} syncStatus={syncStatus} onRetrySync={handleRetrySync} />
          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 p-6 md:p-8 overflow-y-auto transition-all duration-300 ease-in-out">
              {renderContent()}
            </main>
            <AiAssistantPanel isOpen={isAiPanelOpen} onClose={toggleAiPanel} tasks={tasks} documents={documents} outgoingDocuments={outgoingDocuments} />
          </div>
        </div>
        {!isReadOnly && taskBeingCompleted && (
          <OutgoingDocModal isOpen={!!taskBeingCompleted} onClose={() => setTaskBeingCompleted(null)} onSubmit={handleFinalizeCompletion} task={taskBeingCompleted} originalDocument={relatedDocumentForTask} resultFile={resultFileForTask} folders={folderStructure} />
        )}
        <WelcomeCard />
      </div>
      {isSearchActive && globalSearchTerm && (
        <GlobalSearchResults results={searchResults} onResultClick={handleSearchResultClick} onClose={() => { setIsSearchActive(false); setGlobalSearchTerm(''); }} />
      )}
      {isNotificationsModalOpen && (
        <NotificationsModal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} pendingTasks={tasks.filter(t => t.status === 'pendiente')} inProcessTasks={tasks.filter(t => t.status === 'en proceso')} documents={documents} onGoToTasks={() => { setActiveSection(Section.Tareas); setIsNotificationsModalOpen(false); }} />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default App;