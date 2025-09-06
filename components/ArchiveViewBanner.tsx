import React from 'react';

interface ArchiveViewBannerProps {
  year: number;
  onExit: () => void;
}

const ArchiveViewBanner: React.FC<ArchiveViewBannerProps> = ({ year, onExit }) => {
  return (
    <div className="w-full bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-2 flex items-center justify-center text-sm font-semibold z-10">
      <span className="mr-4">
        Estás viendo el archivo de {year} (Modo Solo Lectura).
      </span>
      <button
        onClick={onExit}
        className="px-3 py-1 bg-yellow-500 dark:bg-yellow-700 text-white rounded-md hover:bg-yellow-600 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 dark:focus:ring-offset-yellow-600"
      >
        Volver al año actual
      </button>
    </div>
  );
};

export default ArchiveViewBanner;
