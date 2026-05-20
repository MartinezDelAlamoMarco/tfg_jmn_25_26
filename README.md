# NujamaMotors 🏎️

**NujamaMotors** es una plataforma web integral, desarrollada como Trabajo de Fin de Grado (TFG), diseñada para centralizar la compraventa y el alquiler de vehículos entre particulares. Nuestra arquitectura Full-Stack combina la robustez de **Laravel 12** con la reactividad de **React 19**, ofreciendo una solución escalable y profesional.

## 🛠️ Stack Tecnológico

* **Backend:** Laravel 12 (PHP 8.2+), Sanctum (Autenticación), Google Drive API (Gestión de archivos), Google Cloud Translate (Internacionalización).
* **Frontend:** React 19 + TypeScript, Tailwind CSS 4 (Diseño), React Router v7 (Navegación), i18next (Multi-idioma).
* **Base de Datos:** PostgreSQL con vistas precalculadas para optimizar el rendimiento.

## ✨ Características Técnicas Clave

### 🔍 Motor de Búsqueda (Live Search)
Filtrado reactivo en el cliente que permite buscar vehículos y alquilar coches sin recargar la página. Los selectores (marcas, modelos, combustible) se pueblan dinámicamente, optimizando la experiencia de usuario y reduciendo la carga del servidor.

### 💬 Mensajería en Tiempo Real
Sistema de chat instantáneo mediante WebSockets (Supabase Realtime). Incluye gestión de estados transaccionales (Reservado, Vendido) y cierre automático de conversaciones paralelas al formalizar una venta, manteniendo los hilos de comunicación limpios.

### ☁️ Gestión Multimedia Optimizada
Integración con **Google Drive API**. Las imágenes se comprimen en el cliente antes de la subida. El sistema gestiona automáticamente el borrado de archivos huérfanos al eliminar anuncios, asegurando una gestión eficiente del almacenamiento en la nube.

### 🛡️ Seguridad y Moderación
* **Seguridad:** Recuperación de contraseñas mediante tokens seguros de 64 caracteres.
* **Reputación:** Sistema de valoraciones con índices únicos a nivel de base de datos para evitar reseñas falsas.
* **Moderación:** Panel administrativo centralizado que identifica anuncios con alto volumen de reportes mediante indicadores dinámicos y permite la gestión total de usuarios.
* **Legal:** Cumplimiento total de normativa RGPD/LSSICE.

## 🚀 Instalación y Puesta en Marcha

Asegúrate de tener instalados **PHP 8.2+**, **Composer** y **Node.js**:

1. **Configuración Backend:**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate

2. **Frontend**:
   ```bash
   cd frontend
   npm install
3. **Desarrollo**:
   ```bash
   php artisan dev

Desarrollado como TFG para el ciclo de Desarrollo de Aplicaciones Web (DAW).
