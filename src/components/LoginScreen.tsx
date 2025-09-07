import React from 'react';
import { IconFiles } from './icons/IconFiles';
import { IconLock } from './icons/IconLock';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
      <div className="text-center p-8 max-w-lg mx-auto">
        <div className="inline-block p-4 bg-primary-light/10 dark:bg-primary-dark/20 rounded-2xl">
           <IconFiles className="w-16 h-16 text-primary-light dark:text-primary-dark" />
        </div>
        <h1 className="mt-8 text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Bienvenido a Gestor Pro
        </h1>
        <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Su solución centralizada para la gestión de documentos y tareas. Inicie sesión para acceder a su espacio de trabajo.
        </p>
        <div className="mt-10">
          <button
            onClick={onLogin}
            className="flex items-center justify-center w-full max-w-xs mx-auto px-6 py-4 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark transition-all duration-200 transform hover:scale-105"
          >
            <IconLock className="w-6 h-6 mr-3" />
            Ingresar o Registrarse
          </button>
        </div>
        <p className="mt-8 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          Al continuar, acepta nuestros Términos de Servicio y Política de Privacidad.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;