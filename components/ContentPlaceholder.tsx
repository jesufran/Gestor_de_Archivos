

import React from 'react';
import { IconConstruction } from './icons/IconConstruction';

interface ContentPlaceholderProps {
  title: string;
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ title }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center bg-background-light dark:bg-secondary-dark/40 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark transition-colors duration-300">
      <IconConstruction className="w-16 h-16 text-primary-light dark:text-primary-dark mb-6" />
      <h3 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
        La sección de {title} está en construcción
      </h3>
      <p className="mt-2 text-md text-text-secondary-light dark:text-text-secondary-dark max-w-md">
        Estamos trabajando para traerle nuevas funcionalidades en esta área. ¡Gracias por su paciencia!
      </p>
      <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Vuelva pronto para ver las novedades.
      </p>
    </div>
  );
};

export default ContentPlaceholder;
