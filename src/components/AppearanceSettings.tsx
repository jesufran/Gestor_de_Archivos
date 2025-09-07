
import React from 'react';
import { ThemeMode, AccentColor } from '../types';
import { IconSun } from './icons/IconSun';
import { IconMoon } from './icons/IconMoon';
import { IconDesktop } from './icons/IconDesktop';
import { IconCheck } from './icons/IconCheck';

interface AppearanceSettingsProps {
    themeMode: ThemeMode;
    onThemeChange: (mode: ThemeMode) => void;
    accentColor: AccentColor;
    onAccentColorChange: (color: AccentColor) => void;
}

const ThemeCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    mode: ThemeMode;
    currentMode: ThemeMode;
    onClick: (mode: ThemeMode) => void;
}> = ({ title, description, icon, mode, currentMode, onClick }) => {
    const isSelected = mode === currentMode;
    return (
        <button
            onClick={() => onClick(mode)}
            className={`relative group flex flex-col items-start w-full text-left p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark ${
                isSelected
                    ? 'border-primary-light dark:border-primary-dark ring-2 ring-primary-light dark:ring-primary-dark shadow-lg'
                    : 'border-border-light dark:border-border-dark hover:border-gray-400 dark:hover:border-hover-dark hover:shadow-md'
            }`}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary-light dark:bg-primary-dark text-white rounded-full p-1">
                    <IconCheck className="w-3 h-3"/>
                </div>
            )}
            <div className={`mb-3 text-2xl ${isSelected ? 'text-primary-light dark:text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                {icon}
            </div>
            <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h4>
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">{description}</p>
        </button>
    );
}

const AccentColorPicker: React.FC<{
    selectedColor: AccentColor;
    onSelect: (color: AccentColor) => void;
}> = ({ selectedColor, onSelect }) => {
    const accentColorOptions: { name: AccentColor; bgClass: string; }[] = [
        { name: 'indigo', bgClass: 'bg-indigo-500' },
        { name: 'green', bgClass: 'bg-green-500' },
        { name: 'purple', bgClass: 'bg-purple-500' },
        { name: 'orange', bgClass: 'bg-orange-500' },
        { name: 'rose', bgClass: 'bg-rose-500' },
        { name: 'sky', bgClass: 'bg-sky-500' },
        { name: 'teal', bgClass: 'bg-teal-500' },
        { name: 'slate', bgClass: 'bg-slate-500' },
    ];
    
    return (
        <div className="flex flex-wrap gap-3">
            {accentColorOptions.map(color => {
                const isSelected = selectedColor === color.name;
                return (
                    <button
                        key={color.name}
                        onClick={() => onSelect(color.name)}
                        className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${color.bgClass} ${
                            isSelected 
                                ? 'ring-2 ring-offset-2 ring-primary-light dark:ring-primary-dark dark:ring-offset-secondary-dark' 
                                : ''
                        }`}
                        aria-label={`Seleccionar color ${color.name}`}
                    >
                        {isSelected && <IconCheck className="w-5 h-5 text-white" />}
                    </button>
                )
            })}
        </div>
    );
};

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ themeMode, onThemeChange, accentColor, onAccentColorChange }) => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Tema de la Aplicación</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Elija cómo le gustaría que se vea la aplicación.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ThemeCard
                    title="Tema Claro"
                    description="Ideal para ambientes bien iluminados."
                    icon={<IconSun className="w-8 h-8"/>}
                    mode="light"
                    currentMode={themeMode}
                    onClick={onThemeChange}
                />
                <ThemeCard
                    title="Tema Oscuro"
                    description="Ideal para reducir la fatiga visual de noche."
                    icon={<IconMoon className="w-8 h-8"/>}
                    mode="dark"
                    currentMode={themeMode}
                    onClick={onThemeChange}
                />
                <ThemeCard
                    title="Automático (Sistema)"
                    description="Se sincroniza con la apariencia de su sistema."
                    icon={<IconDesktop className="w-8 h-8"/>}
                    mode="system"
                    currentMode={themeMode}
                    onClick={onThemeChange}
                />
            </div>
             <div className="pt-6 border-t border-border-light dark:border-border-dark">
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Color de Acento</h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Seleccione un color para los elementos principales de la interfaz.
                </p>
                <div className="mt-4">
                    <AccentColorPicker selectedColor={accentColor} onSelect={onAccentColorChange} />
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;