# 🏎️ NujamaMotors

**NujamaMotors** es el fruto de un Trabajo de Fin de Grado (TFG) integral, diseñado para revolucionar la compraventa y el alquiler de vehículos entre particulares. La plataforma no es solo un marketplace; es un ecosistema pensado para ofrecer una experiencia de usuario (UX) fluida, segura y profesional, resolviendo las limitaciones que presentan muchas plataformas actuales en cuanto a filtrado, comunicación y gestión de reputación.

## 🌟 ¿Qué es NujamaMotors?

NujamaMotors nace con un objetivo claro: **simplificar la gestión automovilística**. Con un enfoque 100% Full-Stack, hemos construido una aplicación que abarca desde la publicación de anuncios con gestión inteligente de multimedia, hasta sistemas de mensajería en tiempo real y herramientas de moderación avanzada para garantizar la calidad del contenido.

## 🛠️ El Stack Tecnológico

Hemos elegido un conjunto de tecnologías modernas que garantizan escalabilidad y rendimiento:

* **Backend (Laravel 12):** El cerebro de la plataforma. Gestiona toda la lógica de negocio, desde la autenticación robusta con **Sanctum** hasta la integración de servicios de terceros como **Google Drive API** (para almacenamiento de archivos) y **Google Cloud Translate** (para la internacionalización automática del contenido generado por el usuario).
* **Frontend (React 19 + TypeScript):** Una Single Page Application (SPA) ultra-reactiva. Utilizamos **Tailwind CSS 4** para un diseño moderno y responsivo, asegurando que la experiencia sea perfecta tanto en escritorio como en dispositivos móviles.
* **Base de Datos (PostgreSQL):** Una arquitectura relacional optimizada con vistas precalculadas que garantizan tiempos de carga mínimos.
* **Mensajería (Supabase Realtime):** Implementamos WebSockets para una comunicación instantánea entre compradores y vendedores, transformando la negociación en una experiencia fluida.

## ✨ Características que nos hacen destacar

* **Búsqueda y Filtrado Inteligente:** Motor de búsqueda en tiempo real (Live Search) que permite encontrar el vehículo ideal sin recargar la página, poblando dinámicamente las opciones de marca, modelo y combustible.
* **Gestión Multimedia con Nube:** Subida de imágenes optimizada con compresión en cliente y gestión automática de archivos en Google Drive. Si un anuncio se elimina, el sistema limpia los archivos huérfanos automáticamente.
* **Sistema de Reputación:** Un sistema de valoraciones (reviews) con estrellas y comentarios para construir confianza entre la comunidad, protegido con restricciones de integridad para evitar valoraciones falsas.
* **Seguridad y Privacidad:** Cumplimiento total con RGPD y LSSICE. Incluye un sistema de recuperación de contraseñas mediante tokens seguros y una arquitectura blindada frente a duplicados y spam.
* **Herramientas de Moderación:** Panel de administración donde el equipo puede gestionar usuarios, revisar reportes de contenido y moderar anuncios con indicadores de urgencia dinámicos.

## 🚀 Instalación y Puesta en Marcha

Para desplegar el entorno de desarrollo, asegúrate de tener **PHP 8.2+**, **Composer** y **Node.js**:

1. **Backend**:
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
