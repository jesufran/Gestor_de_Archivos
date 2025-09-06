import type { Emitter } from 'mitt';

export enum Section {
  Principal = 'Principal',
  Entrantes = 'Documentos Entrantes',
  Tareas = 'Tareas y Seguimientos',
  Salientes = 'Documentos Salientes',
  Informes = 'Informes',
  Ajustes = 'Ajustes',
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'green' | 'purple' | 'orange' | 'rose' | 'sky' | 'teal' | 'slate';

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pendiente' | 'en proceso' | 'completada';
  dueDate?: string;
  relatedDocumentId?: string;
  createdAt: string;
  completedAt?: string;
  resultFile?: File;
  resultFileId?: string;
  priority: 'alta' | 'media' | 'baja';
  notes?: string;
  reminder?: boolean;
}

export interface Document {
  id: string;
  name: string; // for filename
  
  // Fields based on user request
  orderNumber: number;
  sentAt?: string; // Fecha de Envío
  supportType: 'papel' | 'electronico' | 'otro';
  documentNumber?: string; // Nº de documento (Oficio, Memorando, etc.)
  folios?: number; // N° de Folios
  procedure: string; // Trámite
  destinationFolder?: { id: string; path: string }; // Updated field for folder location
  additionalFiles?: File[]; // New field for multiple attachments

  // Existing fields re-mapped
  from: string; // Remitente
  body: string; // Contenido. un breve resumen del asunto o trámite
  subject: string; 
  
  createdAt: string; // Fecha de Recibido
  file?: File;
  fileId?: string;
  additionalFileIds?: string[];
}


export interface OutgoingDocument {
  id: string;
  to: string; // Destinatario
  subject: string;
  body: string; // Contenido
  file?: File;
  fileId?: string;
  fileName?: string; // Crucial for backup/restore
  createdAt: string; // Internal timestamp
  relatedTaskId?: string; // From task completion flow

  // New fields for direct registration
  documentNumber?: string; // N° de documento
  supportType?: 'papel' | 'electronico' | 'otro'; // Tipo de soporte
  folios?: number; // N° de folios
  receivedBy?: string; // Recibido por:
  sentAt?: string; // Fecha
  destinationFolder?: { id: string; path: string }; // Updated field for folder location
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Tipado para el objeto de usuario de Netlify Identity
export interface NetlifyUser {
  id: string;
  user_metadata: {
    full_name?: string;
  };
  email: string;
  token: {
    access_token: string;
  };
}

// Add Netlify Identity Widget types
export interface NetlifyIdentity {
    on: Emitter['on'];
    off: Emitter['off'];
    init: (options?: { container?: string | boolean }) => void;
    open: (tabName?: 'login' | 'signup') => void;
    close: () => void;
    logout: () => Promise<void>;
    currentUser: () => NetlifyUser | null;
    gotrue: any;
}

declare global {
    interface Window {
        netlifyIdentity: NetlifyIdentity;
    }
}
