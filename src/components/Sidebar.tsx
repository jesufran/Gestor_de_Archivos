import React from 'react';
import { Section, ThemeMode } from '../types';
import { IconDashboard } from './icons/IconDashboard';
import { IconInbox } from './icons/IconInbox';
import { IconTasks } from './icons/IconTasks';
import { IconOutbox } from './icons/IconOutbox';
import { IconReports } from './icons/IconReports';
import { IconSettings } from './icons/IconSettings';
import { IconSun } from './icons/IconSun';
import { IconMoon } from './icons/IconMoon';
import { IconFiles } from './icons/IconFiles';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  toggleTheme: () => void;
  currentYearView: number | null;
}

const navItems = [
  { id: Section.Principal, icon: <IconDashboard className="w-6 h-6" /> },
  { id: Section.Entrantes, icon: <IconInbox className="w-6 h-6" /> },
  { id: Section.Tareas, icon: <IconTasks className="w-6 h-6" /> },
  { id: Section.Salientes, icon: <IconOutbox className="w-6 h-6" /> },
  { id: Section.Informes, icon: <IconReports className="w-6 h-6" /> },
  { id: Section.Ajustes, icon: <IconSettings className="w-6 h-6" /> },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center p-3 my-1 w-full rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark ${
        isActive
          ? 'bg-secondary-light dark:bg-secondary-dark text-primary-light dark:text-primary-dark font-semibold shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-secondary-dark text-text-secondary-light dark:text-text-secondary-dark'
      }`}
    >
      {item.icon}
      <span className="ml-4 text-sm font-medium">{item.id}</span>
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, theme, toggleTheme, currentYearView }) => {
  return (
    <aside className="w-64 bg-white dark:bg-background-dark border-r border-border-light dark:border-secondary-dark z-10 flex flex-col transition-colors duration-300">
      <div className="flex items-center justify-center h-20 border-b border-border-light dark:border-secondary-dark">
        <IconFiles className="w-8 h-8 text-primary-light dark:text-primary-dark" />
        <h1 className="text-base font-bold ml-2 text-text-primary-light dark:text-text-primary-dark">Gestor Pro</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-border-light dark:border-secondary-dark">
        <div className="mb-4 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark p-2 bg-secondary-light dark:bg-secondary-dark rounded-md">
          {currentYearView ? (
            <span>Viendo Archivo: <strong>{currentYearView}</strong></span>
          ) : (
            <span>Año Actual: <strong>{new Date().getFullYear()}</strong></span>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-secondary-light dark:bg-secondary-dark hover:bg-gray-200 dark:hover:bg-border-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark dark:focus:ring-offset-background-dark"
        >
          {theme === 'light' ? <IconMoon className="w-6 h-6 text-text-secondary-light" /> : <IconSun className="w-6 h-6 text-yellow-400" />}
          <span className="ml-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;