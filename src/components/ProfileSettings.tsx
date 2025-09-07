import React from 'react';
import { AppUser } from '../types';
import { IconUser } from './icons/IconUser';
import { IconMail } from './icons/IconMail';
import { IconExternalLink } from './icons/IconExternalLink';

interface ProfileSettingsProps {
    user: AppUser | null;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {

    if (!user) {
        return <div>No hay información de usuario disponible.</div>;
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Perfil y Cuenta</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Vea la información de su cuenta y gestione su configuración de seguridad.
                </p>
            </div>
            
            <div className="p-6 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark/30 max-w-lg">
                <div className="flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-secondary-light dark:bg-border-dark rounded-full mr-6">
                        <IconUser className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <IconUser className="w-5 h-5 mr-3 text-text-secondary-light dark:text-text-secondary-dark" />
                            <div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Nombre Completo</p>
                                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{user.displayName || 'No especificado'}</p>
                            </div>
                        </div>
                         <div className="flex items-center">
                            <IconMail className="w-5 h-5 mr-3 text-text-secondary-light dark:text-text-secondary-dark" />
                            <div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Correo Electrónico</p>
                                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-border-light dark:border-border-dark">
                 <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Gestionar Cuenta</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-xl">
                   La gestión de cuentas en línea está desactivada en el modo local. Para cambiar su nombre, correo o contraseña, necesitaría usar la versión con autenticación.
                </p>
                <button 
                    disabled
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-sm font-semibold rounded-md shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <span className="mr-2">Gestionar Cuenta</span>
                    <IconExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const IconMail: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const IconExternalLink: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

export default ProfileSettings;