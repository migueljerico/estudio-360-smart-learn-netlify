# 🎓 Estudio360 — Plataforma Educativa · Despliegue Netlify

![React](https://img.shields.io/badge/React%2019-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TanStack Start](https://img.shields.io/badge/TanStack%20Start-SSR-FE312C?style=for-the-badge&logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend%20%2F%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Desplegado-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Publicado-4CAF50?style=for-the-badge)
![Tipo](https://img.shields.io/badge/Práctica-No%20Code%20%2F%20Low%20Code-FF6B6B?style=for-the-badge)

> **Ejercicio Práctico — Creación de Apps No Code y Low Code**  
> Plataforma educativa para profesores y alumnos desplegada en **Netlify**

---

## 🔗 Acceso a la Aplicación

[![Ver App en Producción](https://img.shields.io/badge/🚀%20Ver%20App%20en%20Producción-estudio--360.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://estudio360.netlify.app/)

> ℹ️ **Variante de despliegue:** Este repositorio usa el preset **`netlify`** con SSR y Edge Functions. Existe una [variante con despliegue en Vercel](https://github.com/migueljerico/estudio-360-smart-learn-vercel) del mismo proyecto.

---

## 📋 Descripción del Proyecto

**Estudio360** conecta profesores y alumnos en un flujo de estudio estructurado. Los profesores crean tarjetas y cuestionarios, los organizan en clases y los asignan a sus alumnos; los alumnos estudian el contenido asignado, reciben feedback inmediato y pueden repasar solo las tarjetas falladas. La aplicación diferencia automáticamente el panel de cada usuario según el rol seleccionado en el registro.

---

## ✨ Funcionalidades principales

### 👩‍🏫 Para profesores

| Sección | Descripción |
|---|---|
| **Panel** | Resumen de tarjetas, cuestionarios, clases e intentos recientes |
| **Biblioteca** | Gestión del contenido propio; duplicar o eliminar tarjetas y cuestionarios |
| **Clases y alumnos** | Creación de clases; los alumnos se añaden con su ID de usuario |
| **Tarjetas** | Editor de decks de flashcards con frente y reverso |
| **Cuestionarios** | Editor de opción múltiple con corrección automática |
| **Alumnos** | Vista del progreso individual de cada estudiante |

### 🎒 Para alumnos

| Sección | Descripción |
|---|---|
| **Panel** | Tarjetas y cuestionarios asignados, porcentaje global de aciertos |
| **Estudio de tarjetas** | Modo flip-card con botones "La sabía / No la sabía" + repaso de fallos |
| **Cuestionarios** | Preguntas de opción múltiple con corrección visual inmediata |
| **Historial** | Lista de todos los intentos con puntuación y fecha |
| **Resultados** | Vista detallada de cada intento |

---

## 🏗️ Estructura del proyecto

```
src/
├── routes/                      # Páginas (file-based routing — TanStack Router)
│   ├── index.tsx                # Landing pública
│   ├── login.tsx                # Login / registro con selección de rol
│   ├── app.tsx                  # Layout autenticado con sidebar
│   ├── app.index.tsx            # Panel (diferente según rol)
│   ├── app.library.tsx          # Biblioteca de contenido
│   ├── app.classes.tsx          # Gestión de clases
│   ├── app.study.deck.$id.tsx   # Modo estudio flashcards
│   └── app.study.quiz.$id.tsx   # Modo cuestionario
├── integrations/supabase/       # Cliente Supabase + helpers de auth
├── components/
│   ├── AppSidebar.tsx
│   └── ui/                      # Componentes shadcn/ui
└── lib/
    └── auth-context.tsx         # Contexto de sesión y rol
```

---

## ⚙️ Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/migueljerico/estudio-360-smart-learn-netlify.git
    cd estudio-360-smart-learn-netlify
    ```

2.  **Instalar dependencias (se recomienda Bun):**
    ```bash
    bun install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura las variables de Supabase:
    ```env
    VITE_SUPABASE_URL=https://oyukwepvvwjorvuwoadt.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    bun run dev
    ```
    *Nota: El proyecto usa el preset `netlify` para SSR. En desarrollo local, `bun run dev` inicia el servidor Vite con emulación de Edge Functions.*

---

## 🚀 Uso

### 1. Registro e Inicio de Sesión
1.  Accede a la aplicación en producción o ejecuta `bun run dev`.
2.  En la página de login, selecciona si deseas registrarte como **Profesor** o **Alumno**.
3.  Ingresa tus credenciales o crea una cuenta nueva.

### 2. Flujo de Profesor
1.  Ve a **Biblioteca** y crea una nueva **Tarjeta** (Deck) o **Cuestionario**.
2.  En el editor, añade preguntas (tarjetas) o opciones de respuesta.
3.  Ve a **Clases** y crea una clase.
4.  En la biblioteca, usa el botón de asignación para vincular tu contenido a la clase creada.

### 3. Flujo de Alumno
1.  En el panel, verás el contenido asignado por tu profesor.
2.  Haz clic en **Estudiar** para revisar las tarjetas (modo flip) o responder un cuestionario.
3.  Al terminar, verás tus resultados y puedes repasar las tarjetas que fallaste.

---

## 🛠️ Tecnologías

| Herramienta | Versión/Detalle | Uso en el proyecto |
|---|---|---|
| **Framework** | TanStack Start (React 19 + SSR) | Estructura de la aplicación y renderizado del lado del servidor |
| **Enrutamiento** | TanStack Router | Sistema de rutas basado en archivos (`src/routes/`) |
| **Estilos** | Tailwind CSS v4 + shadcn/ui | Diseño UI, componentes reutilizables y utilidades de diseño |
| **Backend / Auth** | Supabase (PostgreSQL + Auth) | Gestión de usuarios, autenticación y base de datos relacional |
| **Bundler** | Vite 7 + Nitro (`preset: netlify`) | Construcción y despliegue optimizado para Netlify |
| **Despliegue** | Netlify (SSR + Edge Functions) | Hosting y ejecución del servidor en la nube |
| **Gestor de paquetes** | Bun | Gestión de dependencias y ejecución de scripts |

---

## 📚 Contexto formativo

Este ejercicio forma parte del programa de formación en **Análisis de Datos**, dentro del módulo de creación de aplicaciones no-code y low-code. El objetivo es construir y desplegar una aplicación web funcional con roles diferenciados, autenticación real y base de datos conectada utilizando un stack moderno (TanStack Start + Supabase).

**Repositorio relacionado:** [Estudio360 — Variante Vercel](https://github.com/migueljerico/estudio-360-smart-learn-vercel) — misma app, configuración `preset: vercel` con `vercel.json`.

---

<p align="center">Creado por <a href="https://github.com/migueljerico">@migueljerico</a> y documentado por Zenmux (GLM 4.7 Flash) desde la App Asistente de IA · 2026</p>