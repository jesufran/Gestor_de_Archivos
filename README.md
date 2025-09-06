HEAD
# Gestor_de_Archivos
Programa para llevar los documentos que entran y salen de la oficina.
# Gestor Pro: Gestor de Documentos y Tareas

Gestor Pro es una aplicación web completa y moderna diseñada para simplificar y optimizar la gestión de documentos, el seguimiento de tareas y la generación de informes en un entorno de oficina. Construida con tecnologías de vanguardia, ofrece una experiencia de usuario fluida, personalizable y potente, con capacidades offline y sincronización en la nube.

![Captura de pantalla de la aplicación](https://i.imgur.com/example.png) *(Nota: Reemplazar con una captura de pantalla real de la aplicación)*

## ✨ Características Principales

- **Gestión de Documentos Entrantes y Salientes:** Registra, archiva y consulta todos los documentos que entran y salen, adjuntando archivos físicos y organizándolos en una estructura de carpetas personalizable.
- **Seguimiento de Tareas:** Crea tareas asociadas a documentos o de forma independiente. Asigna prioridades, fechas de vencimiento y monitorea su estado (Pendiente, En Proceso, Completada).
- **Asistente con IA (Google Gemini):**
    - **Extracción de Datos:** Analiza archivos (PDF, imágenes, etc.) o texto pegado para autocompletar formularios de registro de documentos, ahorrando tiempo y reduciendo errores.
    - **Resúmenes Ejecutivos:** Genera resúmenes inteligentes sobre la actividad en un período de tiempo seleccionado en la sección de informes.
    - **Consultas en Lenguaje Natural:** Pregunta al asistente sobre el estado de tus tareas y documentos.
- **Organización Jerárquica:** Crea una estructura de carpetas (Ámbitos y subcarpetas) para archivar digitalmente los documentos de manera lógica y coherente.
- **Informes y Análisis:** Genera informes detallados en formato PDF o CSV sobre la actividad en rangos de fechas personalizables.
- **Respaldo y Restauración Completos:** Exporta toda la base de datos de la aplicación, incluidos los archivos adjuntos, a un único archivo `.zip` para un respaldo seguro. Restaura la aplicación a un estado anterior desde un archivo de respaldo.
- **Archivo Anual:** Finaliza el ciclo de trabajo anual moviendo todos los datos a un archivo histórico de solo lectura, limpiando el espacio de trabajo para el nuevo año.
- **Sincronización en la Nube:** Los datos se guardan localmente para un rendimiento rápido y se sincronizan de forma segura con Google Firestore para tener acceso desde cualquier lugar y como respaldo.
- **Capacidades Offline (PWA):** Funciona sin conexión a internet gracias al uso de Service Workers e IndexedDB. Se puede "instalar" en el escritorio o en dispositivos móviles para un acceso rápido.
- **Autenticación Segura:** Utiliza Netlify Identity para la gestión de usuarios, inicios de sesión y protección de rutas.
- **Interfaz Personalizable:** Cambia entre modos claro y oscuro, y elige entre varios colores de acento para adaptar la apariencia a tu gusto.

## 🚀 Pila Tecnológica

- **Frontend:**
    - **Framework:** React 18+ con Hooks
    - **Lenguaje:** TypeScript
    - **Estilos:** Tailwind CSS
    - **Almacenamiento Local:** IndexedDB (para archivos) y LocalStorage (para metadatos y configuraciones).
- **Backend (Serverless):**
    - **Plataforma:** Netlify Functions
    - **Base de Datos en la Nube:** Google Firestore
    - **Autenticación:** Netlify Identity
- **Inteligencia Artificial:**
    - **Modelo:** Google Gemini (`gemini-2.5-flash`)
- **Herramientas de Construcción:**
    - **Bundler:** esbuild (rápido y eficiente)

## 📁 Estructura del Proyecto

```
.
├── components/         # Componentes reutilizables de React
├── netlify/
│   └── functions/      # Funciones serverless (proxy de IA, sincronización con DB)
├── public/             # Archivos estáticos (íconos, manifest.json)
├── App.tsx             # Componente principal de la aplicación y manejo de estado
├── db.ts               # Lógica de interacción con IndexedDB
├── index.html          # Punto de entrada HTML
├── index.tsx           # Punto de montaje de React
├── package.json        # Dependencias y scripts del proyecto
├── sw.js               # Service Worker para capacidades PWA y offline
└── types.ts            # Definiciones de tipos de TypeScript
```

## 🛠️ Configuración y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/gestor-pro.git
    cd gestor-pro
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Para un despliegue en Netlify, necesitarás configurar las siguientes variables de entorno en el panel de control de tu sitio:
    - `API_KEY`: Tu clave de API para Google Gemini.
    - `FIREBASE_SERVICE_ACCOUNT_KEY`: El objeto JSON de la clave de tu cuenta de servicio de Firebase (en formato de una sola línea).

    *Nota: La aplicación está diseñada para obtener estas claves del entorno del servidor a través de las Netlify Functions, por lo que no es necesario exponerlas en el lado del cliente.*

### Scripts Disponibles

-   **Iniciar en modo de desarrollo:**
    ```bash
    npm run dev
    ```
    Esto iniciará un servidor de desarrollo con recarga en caliente. La aplicación estará disponible en `http://localhost:8000` (o el puerto que indique `esbuild`).

-   **Construir para producción:**
    ```bash
    npm run build
    ```
    Esto generará el archivo `bundle.js` minificado y optimizado en la raíz del proyecto, listo para ser desplegado.

## ☁️ Despliegue

La aplicación está optimizada para un despliegue sencillo en **Netlify**.

1.  **Fork/Clona este repositorio** en tu cuenta de GitHub, GitLab, etc.
2.  **Crea un nuevo sitio en Netlify** y conéctalo al repositorio que acabas de crear.
3.  **Configuración de construcción:** Netlify leerá automáticamente el archivo `netlify.toml` incluido en el repositorio, por lo que la configuración de construcción (`command`, `publish directory`, `functions directory`) se aplicará sin necesidad de configuración manual.
4.  **Configura las variables de entorno** mencionadas en la sección de instalación en `Settings > Build & deploy > Environment variables` en el panel de control de tu sitio de Netlify.
5.  **Activa Netlify Identity** en la pestaña "Identity" de tu sitio para habilitar el registro y la autenticación de usuarios.
6.  **¡Despliega tu sitio!** Netlify se encargará del resto.

