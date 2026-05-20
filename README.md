# NujamaMotors

**NujamaMotors** es una plataforma web integral, desarrollada como Trabajo de Fin de Grado (TFG), especializada en la compraventa y alquiler de vehículos. La aplicación facilita la gestión completa de anuncios, la interacción entre usuarios y la administración de datos del sistema.

## 🚀 Tecnologías Principales

El proyecto sigue una arquitectura Full-Stack utilizando un stack tecnológico moderno:

### Backend (Laravel)
* **Framework**: [Laravel 12](https://laravel.com/).
* **Servicios**:
    * Integración con **Google Drive API** para el almacenamiento de archivos de los anuncios.
    * Sistema de **traducción automatizada** mediante Google Cloud Translate para soportar múltiples idiomas.
* **Autenticación**: Gestión de sesiones y tokens mediante **Laravel Sanctum**.

### Frontend (React)
* **Framework**: [React 19](https://react.dev/) con soporte de **TypeScript**.
* **Estilos**: Interfaz diseñada con **Tailwind CSS 4**.
* **Internacionalización**: Implementación de **i18next** para la gestión dinámica de idiomas en la interfaz.
* **Enrutamiento**: Navegación gestionada mediante **React Router v7**.

## 🛠️ Instalación y Configuración

Para ejecutar el entorno de desarrollo, asegúrate de tener instalados **PHP 8.2+**, **Composer** y **Node.js**.

1. **Configuración del Backend**:
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
