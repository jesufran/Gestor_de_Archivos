import React, { useState } from 'react';
import { NetlifyUser } from '../types';

interface UserManagementSettingsProps {
    user: NetlifyUser | null;
}

const UserManagementSettings: React.FC<UserManagementSettingsProps> = ({ user }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        if (!user?.token?.access_token) {
            setError('No se pudo obtener el token de autenticación. Por favor, recarga la página.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token.access_token}`,
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error desconocido.');
            }

            setSuccessMessage(`¡Usuario creado exitosamente! Email: ${email}`);
            setEmail('');
            setPassword('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">Gestión de Usuarios</h2>
            <p className="mb-6 text-text-secondary-light dark:text-text-secondary-dark">Crea una nueva cuenta de usuario. Se generará una contraseña temporal que el usuario deberá cambiar.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Correo Electrónico del Nuevo Usuario</label>
                    <input 
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Contraseña Temporal</label>
                    <input 
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-primary-light text-white dark:bg-primary-dark dark:text-gray-900 font-semibold rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Creando Usuario...' : 'Crear Usuario'}
                </button>
            </form>

            {successMessage && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 rounded-md">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UserManagementSettings;
