# MANUAL TECNICO - Estudio360 Smart Learn

## 1. Arquitectura General

El proyecto sigue una arquitectura de **Single Page Application (SPA)** con **Server-Side Rendering (SSR)** utilizando TanStack Start y Nitro, desplegada en Netlify.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Capa de Presentación                      │
│  (React 19 + TanStack Router + shadcn/ui)                   │
│  - src/routes/* (Páginas y rutas dinámicas)                 │
│  - src/components/* (Componentes UI y Layout)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌───────────────────────▼──────────────────────────────────────┐
│                    Capa de Lógica (Client)                  │
│  - Auth Context (src/lib/auth-context.tsx)                  │
│  - React Query (src/lib/api/example.functions.ts)           │
│  - Supabase Client (src/integrations/supabase/client.ts)    │
└───────────────────────┬──────────────────────────────────────┘
                       │
┌───────────────────────▼──────────────────────────────────────┐
│                    Capa de Datos (Backend)                  │
│  - Supabase (PostgreSQL + Auth)                             │
│  - RLS Policies                                             │
│  - Netlify Edge Functions (Server-side rendering)           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Descripción de Módulos y Componentes

### 2.1. Capa de Rutas (Presentation)
Gestiona el enrutamiento basado en archivos y las páginas de la aplicación.

*   **`src/routes/__root.tsx`**: Layout raíz, manejo de errores globales (404, Error Boundaries) y provisión del `QueryClient`.
*   **`src/routes/index.tsx`**: Página de aterrizaje (Landing) pública.
*   **`src/routes/login.tsx`**: Autenticación (Login/Registro) con selección de rol (`profesor`/`alumno`).
*   **`src/routes/app.tsx`**: Layout principal autenticado con Sidebar y manejo de redirecciones según sesión.
*   **`src/routes/app.index.tsx`**: Dashboard dinámico según el rol del usuario.
*   **`src/routes/app.library.tsx`**: Gestión de contenido (Biblioteca) para profesores.
*   **`src/routes/app.classes.tsx`**: Gestión de clases y alumnos.
*   **`src/routes/app.decks.$id.tsx`**: Editor de tarjetas (Flashcards) y asignación.
*   **`src/routes/app.quizzes.$id.tsx`**: Editor de cuestionarios y asignación.
*   **`src/routes/app.study.deck.$id.tsx`**: Modo de estudio de tarjetas (Flip cards).
*   **`src/routes/app.study.quiz.$id.tsx`**: Modo de estudio de cuestionarios.
*   **`src/routes/app.results.$id.tsx`**: Visualización de resultados de intentos.

### 2.2. Capa de Componentes (UI & Layout)
*   **`src/components/AppSidebar.tsx`**: Barra lateral responsiva que cambia según el rol (`profesor`/`alumno`). Incluye navegación y botones de acción.
*   **`src/components/AssignDialog.tsx`**: Componente modal para asignar contenido (tarjetas/cuestionarios) a clases específicas.
*   **`src/components/ui/`**: Colección de componentes UI reutilizables basados en Radix UI y shadcn/ui (Botones, Dialogs, Inputs, Cards, etc.).

### 2.3. Integraciones y Backend
*   **`src/integrations/supabase/client.ts`**: Cliente Supabase para el lado del cliente (navegador). Maneja sesiones y autenticación.
*   **`src/integrations/supabase/client.server.ts`**: Cliente Supabase con `service_role` para operaciones administrativas en el servidor (bypass RLS). **Seguridad: Solo usar en funciones server-side.**
*   **`src/integrations/supabase/auth-middleware.ts`**: Middleware de autenticación para rutas server-side. Valida tokens Bearer y adjunta el usuario al contexto.
*   **`src/integrations/supabase/auth-attacher.ts`**: Middleware para adjuntar el token de sesión a las llamadas RPC del cliente.
*   **`src/integrations/supabase/types.ts`**: Definición de tipos TypeScript generada automáticamente desde la base de datos (PostgreSQL).

### 2.4. Utilidades y Configuración
*   **`src/lib/auth-context.tsx`**: Contexto React para gestionar el estado de la sesión, el usuario y el rol globalmente.
*   **`src/lib/config.server.ts`**: Configuración de entorno accesible solo en el servidor.
*   **`src/lib/utils.ts`**: Función `cn` para unión de clases CSS (utilidad de Tailwind).
*   **`src/server.ts`**: Punto de entrada del servidor para Netlify (manejo de errores SSR y renderizado).
*   **`src/start.ts`**: Configuración principal de TanStack Start (middleware, plugins).

## 3. APIs y Endpoints

La aplicación utiliza la API REST de Supabase. A continuación se detallan las tablas principales y métodos de autenticación.

| Método | Ruta (Tabla) | Descripción | Parámetros |
| :--- | :--- | :--- | :--- |
| **GET** | `/profiles` | Obtener perfil del usuario actual. | `user_id` (via Auth) |
| **GET** | `/classes` | Listar clases (profesor) o clases del alumno. | `teacher_id`, `student_id` (filters) |
| **POST** | `/classes` | Crear nueva clase. | `name`, `teacher_id` |
| **GET** | `/decks` | Listar tarjetas (flashcards). | `owner_id`, `class_id` |
| **POST** | `/decks` | Crear nueva tarjeta. | `title`, `description`, `owner_id` |
| **GET** | `/flashcards` | Obtener tarjetas de un deck específico. | `deck_id` |
| **POST** | `/flashcards` | Crear tarjeta individual. | `deck_id`, `front`, `back` |
| **GET** | `/quizzes` | Listar cuestionarios. | `owner_id` |
| **POST** | `/quizzes` | Crear nuevo cuestionario. | `title`, `questions` |
| **GET** | `/questions` | Obtener preguntas de un quiz. | `quiz_id` |
| **GET** | `/assignments` | Ver asignaciones de contenido. | `content_type`, `content_id` |
| **POST** | `/assignments` | Asignar contenido a una clase. | `teacher_id`, `content_id`, `class_id` |
| **GET** | `/quiz_attempts` | Ver historial de intentos del alumno. | `student_id` |
| **POST** | `/quiz_attempts` | Iniciar nuevo intento de quiz. | `student_id`, `quiz_id` |
| **POST** | `/attempt_answers` | Registrar respuesta a una pregunta. | `attempt_id`, `question_id`, `answer_id` |
| **POST** | `/card_reviews` | Registrar resultado de estudio de tarjeta. | `student_id`, `flashcard_id`, `result` |
| **POST** | `/auth/signup` | Registro de usuario nuevo. | `email`, `password`, `data: { role }` |
| **POST** | `/auth/signin` | Login de usuario. | `email`, `password` |

## 4. Variables de Entorno

Configuración necesaria para la conexión con Supabase y el despliegue en Netlify.

| Variable | Valor de ejemplo | Obligatoria | Descripción |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | `https://oyukwepvvwjorvuwoadt.supabase.co` | Sí | URL base del proyecto Supabase. |
| `SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Sí | Clave pública para el cliente (anon). |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Sí | Clave secreta para el servidor (bypass RLS). |
| `VITE_SUPABASE_URL` | `https://oyukwepvvwjorvuwoadt.supabase.co` | Sí | URL para el cliente del navegador (Vite). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Sí | Clave pública para el cliente del navegador. |
| `VITE_SUPABASE_PROJECT_ID` | `oyukwepvvwjorvuwoadt` | Sí | ID del proyecto Supabase. |

## 5. Guía de Despliegue

### 5.1. Requisitos Previos
*   Node.js (v18+)
*   Bun o npm
*   Cuenta en Netlify
*   Proyecto Supabase configurado

### 5.2. Pasos de Despliegue

1.  **Clonar el Repositorio**
    ```bash
    git clone https://github.com/migueljerico/estudio-360-smart-learn-netlify.git
    cd estudio-360-smart-learn-netlify
    ```

2.  **Instalar Dependencias**
    ```bash
    # Usando Bun
    bun install

    # O usando npm
    npm install
    ```

3.  **Configurar Variables de Entorno**
    *   Copiar el archivo `.env` (o crear uno nuevo) y rellenar las variables de entorno de Supabase (sección 4).
    *   **Nota:** En Netlify, estas variables se configuran en la sección "Site settings" -> "Environment variables".

4.  **Configurar Supabase (RLS y Migraciones)**
    *   Asegurarse de que las migraciones SQL en `supabase/migrations/` se hayan ejecutado en la base de datos de Supabase.
    *   Configurar las **Row Level Security (RLS)** policies para asegurar que los alumnos solo vean su contenido asignado y los profesores solo el suyo.

5.  **Construir el Proyecto**
    ```bash
    bun run build
    # O
    npm run build
    ```

6.  **Desplegar a Netlify**
    *   **Opción A (Git):** Conectar el repositorio a Netlify y configurar la "Build command" a `bun run build` (o `npm run build`) y la "Publish directory" a `.output/public`.
    *   **Opción B (CLI):**
        ```bash
        netlify deploy --prod --dir=.output/public
        ```

## 6. Limitaciones Conocidas y Posibles Mejoras

### Limitaciones
1.  **Naturaleza No/Low-Code:** El proyecto es un ejercicio práctico. La personalización de estilos y lógica compleja está limitada por la estructura de componentes predefinidos.
2.  **Gestión de Estado Simple:** No se utiliza un estado global complejo (como Redux/Zustand), dependiendo principalmente de React Query y Context API.
3.  **Seguridad Básica:** Las políticas RLS son funcionales pero pueden requerir refinamiento para escenarios de alta concurrencia o datos muy sensibles.
4.  **Sin Backend Personalizado:** La lógica de negocio se ejecuta en el cliente o en Supabase Edge Functions (si se expande), sin un servidor Node.js tradicional.

### Posibles Mejoras Futuras
1.  **Multimedia:** Soporte para imágenes y videos en las tarjetas (Flashcards) y cuestionarios.
2.  **Gamificación:** Sistema de puntos, niveles o insignias para motivar a los alumnos.
3.  **Analytics:** Tableros de control más detallados con gráficas de progreso temporal.
4.  **Modo Offline:** Implementación de Service Workers para permitir el estudio sin conexión.
5.  **Exportación:** Funcionalidad para exportar el contenido a PDF o formato compatible con otras plataformas.