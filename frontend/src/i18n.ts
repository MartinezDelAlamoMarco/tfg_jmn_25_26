import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      "common": {
        "price": "Precio", "year": "Año", "km": "Kilometraje", "fuel": "Combustible",
        "transmission": "Transmisión", "color": "Color", "doors": "Puertas", "location": "Ubicación",
        "search": "Buscar...", "cancel": "Cancelar", "save": "Guardar", "edit": "Editar", "delete": "Eliminar",
        "loading": "Cargando...", "processing": "Procesando...", "available": "Disponible", "rent": "Alquiler",
        "sale": "Venta", "no_photo": "Sin foto", "per_day": "/ día", "active": "Activo", "not_found": "Anuncio no encontrado",
        "photo": "Foto", "delete_success": "Anuncio eliminado correctamente.", "delete_error": "Hubo un error al eliminar el anuncio.",
        "spain": "España", "manual": "Manual", "delete_ad": "Eliminar Anuncio"
      },
      "filters": {
        "search_filters": "Filtros de Búsqueda", "advanced": "Filtros avanzados ⬇", "hide": "Ocultar avanzados", 
        "brand": "Marca", "model": "Modelo", "province": "Provincia", "all_brands": "Todas las marcas",
        "all_models": "Todos los modelos", "any_province": "Cualquier provincia",
        "min_price": "Precio Min (€)", "max_price": "Precio Max (€)", "min_price_day": "Precio Min (€/día)", "max_price_day": "Precio Max (€/día)",
        "min_year": "Año Min", "max_year": "Año Max", "min_km": "Km Min", "max_km": "Km Max", 
        "clear": "Limpiar filtros", "search_btn": "Buscar vehículos",
        "doors_qty": "Nº Puertas", "doors_2": "2 puertas", "doors_3": "3 puertas", "doors_4": "4 puertas", "doors_5": "5 puertas"
      },
      "home": {
        "title": "Encuentra el vehículo perfecto para comprar",
        "search_placeholder": "Buscar vehículos en venta o alquiler...",
        "no_results": "No se encontraron vehículos...", "view_details": "Ver detalles", "view_availability": "Ver disponibilidad",
        "vehicles_found": "vehículos encontrados"
      },
      "rent_screen": {
        "fleet_of": "Flota de",
        "subtitle": "Encuentra el vehículo perfecto para tus viajes"
      },
      "search_screen": {
        "results_for": "Resultados para:", "no_results_for": "No hay resultados para:", "try_other_terms": "Intenta con otros términos o elimina los filtros.",
        "no_results": "No se encontraron vehículos que coincidan con tu búsqueda."
      },
      "details": {
        "home_link": "Inicio", "rents_link": "Alquileres", "vehicle_detail_link": "Detalle del Vehículo", "rent_detail_link": "Detalle",
        "rent_conditions": "Condiciones del Alquiler", "specs": "Especificaciones", "tech_sheet": "Ficha Técnica",
        "description": "Descripción", "book_now": "Reservar Ahora", "booking_success": "¡Reserva Confirmada!",
        "booking_error": "Error al realizar la reserva", "prompt_start": "Introduce fecha de inicio (YYYY-MM-DD):", 
        "prompt_end": "Introduce fecha de fin (YYYY-MM-DD):", "login_required_rent": "Debes iniciar sesión para realizar una reserva.",
        "select_dates": "Por favor, selecciona las fechas de inicio y fin.", "go_back": "Volver atrás",
        "processing_booking": "Procesando reserva...", "back_to_fleet": "Volver a la flota", "views": "Vistas:",
        "mod_tools": "🛠️ Herramientas de Moderador", "booking_contact": "El propietario se pondrá en contacto contigo pronto.",
        "view_my_bookings": "Ver mis reservas", "booking_dates": "Fechas de reserva", "pickup": "Recogida", "dropoff": "Devolución",
        "estimated_total": "Total Estimado", "confirm_booking": "Confirmar Reserva", "login_to_book": "Inicia sesión para reservar",
        "report_ad": "Denunciar este anuncio", "login_to_report": "Inicia sesión para denunciar", "engine": "Motor"
      },
      "my_ads": {
        "title": "Mis Anuncios", "my": "Mis", "vehicles": "Vehículos", "publish_btn": "Publicar Anuncio", 
        "publish_new": "Publicar nuevo", "for_sale": "en venta", "for_rent": "alquiler",
        "empty_part1": "Aún no tienes ningún vehículo de", "empty_part2": "publicado.", 
        "tag_sale": "En Venta", "tag_rent": "En Alquiler",
        "delete_confirm": "⚠️ ¿Estás seguro de que quieres ELIMINAR este anuncio definitivamente por incumplir las normas?"
      },
      "create_ad": {
        "title_sale": "Publicar Anuncio de Venta", "title_rent": "Publicar Anuncio de Alquiler",
        "sell": "Vender", "publish": "Publicar", "vehicle": "Vehículo", "rent_slogan": "Rent-a-Beast: Pon tu máquina a trabajar",
        "tech_data": "Datos Técnicos", "year_placeholder": "Año (Ej: 2021)", "hp_placeholder": "Potencia (CV)", "tonality": "Tonalidad",
        "photos": "Fotografías", "photo": "Foto", "main": "Principal", "add_more": "Añadir más", "upload_photos": "Subir fotos del coche",
        "upload_rent_photos": "Subir fotos para alquiler", "photo_limit": "Puedes seleccionar hasta 5 imágenes (JPG, PNG)",
        "commercial_details": "Detalles Comerciales", "mileage_placeholder": "Kilometraje (Km)", "current_mileage": "Kilometraje actual (Km)",
        "description_placeholder": "Describe el estado del vehículo, extras, mantenimientos...", "describe_conditions": "Describe las condiciones...",
        "starting_engine": "Arrancando Motor...", "publish_rent": "Publicar Alquiler",
        "error_publish": "Error al publicar. Revisa los campos y tu conexión."
      },
      "edit_ad": {
        "title": "Editar Anuncio", "subtitle": "Modifica los datos de tu vehículo.",
        "edit": "Editar", "vehicle": "Vehículo", "technical_data": "Datos Técnicos", "hp": "CV", "commercial_details": "Detalles Comerciales",
        "updating": "Actualizando...", "submit": "Actualizar Anuncio", "error_loading": "Error cargando el anuncio", "error_updating": "Error al actualizar"
      },
      "navbar": {
        "home": "Inicio", "rents": "Alquileres", "search_placeholder": "Buscar vehículos en venta o alquiler...",
        "see_all": "Ver todos los resultados", "login": "Iniciar Sesión", "register": "Registrarse",
        "favorites": "Favoritos", "hello": "Hola", "my_ads": "Mis Anuncios", "profile": "Gestionar Perfil",
        "logout": "Cerrar Sesión", "admin_panel": "Panel Moderación"
      },
      "register": {
        "create_account": "Crear cuenta", "join": "Únete a", "first_name": "Nombre", "last_name": "Apellido", 
        "email": "Correo electrónico", "password": "Contraseña", "confirm_password": "Confirmar contraseña", 
        "hide_password": "Ocultar contraseña", "show_password": "Ver contraseña", "min_length": "Mínimo 8 caracteres", 
        "uppercase": "Al menos una mayúscula", "lowercase": "Al menos una minúscula", "number": "Al menos un número", 
        "special": "Al menos un carácter especial", "passwords_not_match": "Las contraseñas no coinciden", 
        "already_have_account": "¿Ya tienes cuenta?", "login": "Inicia sesión", "error_register": "Error en registro"
      },
      "password_recovery": {
        "recover": "Recuperar", "password": "Contraseña", "subtitle": "Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu cuenta.", 
        "check_inbox": "Revisa tu bandeja de entrada (y spam).", "email_label": "Correo electrónico", "email_placeholder": "ejemplo@correo.com", 
        "sending": "Enviando...", "send_link": "Enviar enlace", "back_to_login": "Volver al inicio de sesión", 
        "error_send": "No se pudo enviar el correo. Inténtalo de nuevo."
      },
      "reset_password": {
        "success_msg": "¡Contraseña actualizada con éxito! Redirigiendo al login...", "error_msg": "El enlace ha expirado o es inválido. Solicita uno nuevo.", 
        "reset": "Restablecer", "password": "Contraseña", "subtitle": "Crea una nueva contraseña segura para tu cuenta.", 
        "new_password": "Nueva contraseña", "repeat_password": "Repite la contraseña", "char_length": "8+ caracteres", 
        "uppercase": "Mayúscula", "number": "Número", "symbol": "Símbolo (!@#)", "match": "Coinciden", "updating": "Actualizando...", 
        "save_new_password": "Guardar nueva contraseña"
      },
      "login": {
        "invalid_credentials": "Credenciales inválidas", "google_error": "Hubo un problema al validar el usuario con el servidor.", 
        "validating": "Validando credenciales...", "sign_in_title": "Inicia sesión en tu cuenta", "email": "Correo electrónico", 
        "password": "Contraseña", "hide_password": "Ocultar contraseña", "show_password": "Ver contraseña", "sign_in_btn": "Iniciar sesión", 
        "or": "O", "forgot_password": "¿Olvidaste tu contraseña?", "no_account": "¿No tienes cuenta?", "register": "REGÍSTRATE"
      },
      "profile": {
        "manage_profile": "Gestionar Mi Perfil", "personal_data": "Datos Personales", "name": "Nombre", 
        "email": "Correo Electrónico", "telephone": "Teléfono", "save_changes": "Guardar Cambios", 
        "change_password": "Cambiar Contraseña", "current_password": "Contraseña Actual", "new_password": "Nueva Contraseña", 
        "min_length": "Mínimo 8 caracteres", "uppercase": "Al menos una mayúscula", "lowercase": "Al menos una minúscula", 
        "number": "Al menos un número", "special": "Al menos un carácter especial", "confirm_new_password": "Confirmar Nueva Contraseña", 
        "passwords_not_match": "Las contraseñas no coinciden.", "update_password": "Actualizar Contraseña",
        "success_profile": "Perfil actualizado con éxito.", "error_profile": "Error al actualizar el perfil.",
        "connection_error": "Error de conexión.", "success_password": "Contraseña actualizada con éxito.",
        "error_password": "Error al actualizar la contraseña."
      },
      "favorites": {
        "login_required_toggle": "Inicia sesión para marcar favoritos", "error_toggle": "No se pudo actualizar favoritos", 
        "error_fetch": "Error al obtener vehículos favoritos", "login_required_view": "Inicia sesión para ver tus favoritos.", 
        "no_favorites": "Añadir a favoritos", "remove_favorite": "Quitar favorito", "empty_favorites": "Aún no se han marcado favoritos."
      },
      "admin_panel": {
        "search_placeholder": "Buscar por Marca, Modelo o ID...", "all": "Todos", "sales": "Ventas", "rents": "Alquileres", 
        "vehicle": "Vehículo", "type": "Tipo", "state": "Estado", "price": "Precio", "actions": "Acciones", 
        "searching_inventory": "Buscando en Inventario...", "no_ads_found": "No se han encontrado anuncios.", 
        "delete_confirm": "¿Eliminar este anuncio definitivamente?", "delete_error": "Error al eliminar el anuncio",
        "priority_reports": "Incidencias Prioritarias", "urgency": "Urgencia", "vehicle_ad": "Vehículo / Anuncio", 
        "reason": "Motivo", "date": "Fecha", "analyzing_reports": "Analizando Reportes...", "no_reports": "No hay reportes pendientes. ¡Plataforma limpia!", 
        "report": "Reporte", "reports": "Reportes", "review": "Revisar", "error_change_role": "Error al cambiar rol", 
        "delete_user_confirm": "¿Eliminar usuario? Esta acción borrará todos sus anuncios y fotos. Es irreversible.", 
        "error_delete": "Error al eliminar", "search_user_placeholder": "Buscar por nombre, correo o ID...", "user": "Usuario", 
        "role": "Rol", "sync_db": "Sincronizando Base de Datos...", "no_users_found": "No se han encontrado usuarios que coincidan con la búsqueda.", 
        "change_permissions": "Cambiar permisos", "delete_user": "Eliminar usuario", "protected_account": "CUENTA PROTEGIDA",
        "reports_tab": "Reportes", "users_tab": "Usuarios", "ads_tab": "Anuncios", "title": "Panel de Moderación"
      },
      "report": {
        "loading_motives": "Error al cargar los motivos de reporte.", "login_required": "Debes iniciar sesión para reportar un anuncio.", 
        "success_msg": "Tu reporte ha sido enviado. Un administrador lo revisará pronto.", "error_processing": "Error al procesar el reporte.", 
        "error_sending": "Hubo un error al enviar el reporte. Inténtalo de nuevo más tarde.", "title": "Denunciar Anuncio", 
        "subtitle": "Ayúdanos a mantener la comunidad segura. Selecciona el motivo de tu denuncia.", "back_to_ad": "Volver al anuncio", 
        "other": "Otro", "specify_motive": "Por favor, especifica el motivo", "details_placeholder": "Escribe los detalles aquí...", 
        "cancel": "Cancelar", "sending": "Enviando...", "send_report": "Enviar Denuncia"
      }
    }
  },
  en: {
    translation: {
      "common": {
        "price": "Price", "year": "Year", "km": "Mileage", "fuel": "Fuel",
        "transmission": "Transmission", "color": "Color", "doors": "Doors", "location": "Location",
        "search": "Search...", "cancel": "Cancel", "save": "Save", "edit": "Edit", "delete": "Delete",
        "loading": "Loading...", "processing": "Processing...", "available": "Available", "rent": "Rent",
        "sale": "Sale", "no_photo": "No photo", "per_day": "/ day", "active": "Active", "not_found": "Ad not found",
        "photo": "Photo", "delete_success": "Ad successfully deleted.", "delete_error": "There was an error deleting the ad.",
        "spain": "Spain", "manual": "Manual", "delete_ad": "Delete Ad"
      },
      "filters": {
        "search_filters": "Search Filters", "advanced": "Advanced Filters ⬇", "hide": "Hide advanced", 
        "brand": "Brand", "model": "Model", "province": "Province", "all_brands": "All brands",
        "all_models": "All models", "any_province": "Any province",
        "min_price": "Min Price (€)", "max_price": "Max Price (€)", "min_price_day": "Min Price (€/day)", "max_price_day": "Max Price (€/day)",
        "min_year": "Min Year", "max_year": "Max Year", "min_km": "Min Km", "max_km": "Max Km", 
        "clear": "Clear filters", "search_btn": "Search vehicles",
        "doors_qty": "Doors Qty", "doors_2": "2 doors", "doors_3": "3 doors", "doors_4": "4 doors", "doors_5": "5 doors"
      },
      "home": {
        "title": "Find the perfect vehicle to buy",
        "search_placeholder": "Search vehicles for sale or rent...",
        "no_results": "No vehicles found...", "view_details": "View details", "view_availability": "View availability",
        "vehicles_found": "vehicles found"
      },
      "rent_screen": {
        "fleet_of": "Fleet of",
        "subtitle": "Find the perfect vehicle for your trips"
      },
      "search_screen": {
        "results_for": "Results for:", "no_results_for": "No results for:", "try_other_terms": "Try other terms or clear filters.",
        "no_results": "No vehicles matching your search were found."
      },
      "details": {
        "home_link": "Home", "rents_link": "Rentals", "vehicle_detail_link": "Vehicle Detail", "rent_detail_link": "Detail",
        "rent_conditions": "Rental Conditions", "specs": "Specifications", "tech_sheet": "Technical Sheet",
        "description": "Description", "book_now": "Book Now", "booking_success": "Booking Confirmed!",
        "booking_error": "Error making the reservation", "prompt_start": "Enter start date (YYYY-MM-DD):", 
        "prompt_end": "Enter end date (YYYY-MM-DD):", "login_required_rent": "You must log in to make a reservation.",
        "select_dates": "Please select start and end dates.", "go_back": "Go back",
        "processing_booking": "Processing reservation...", "back_to_fleet": "Back to fleet", "views": "Views:",
        "mod_tools": "🛠️ Moderator Tools", "booking_contact": "The owner will contact you soon.",
        "view_my_bookings": "View my bookings", "booking_dates": "Booking dates", "pickup": "Pick up", "dropoff": "Drop off",
        "estimated_total": "Estimated Total", "confirm_booking": "Confirm Booking", "login_to_book": "Log in to book",
        "report_ad": "Report this ad", "login_to_report": "Log in to report", "engine": "Engine"
      },
      "my_ads": {
        "title": "My Ads", "my": "My", "vehicles": "Vehicles", "publish_btn": "Publish Ad", 
        "publish_new": "Publish new", "for_sale": "for sale", "for_rent": "for rent",
        "empty_part1": "You don't have any", "empty_part2": "vehicles published yet.", 
        "tag_sale": "For Sale", "tag_rent": "For Rent",
        "delete_confirm": "⚠️ Are you sure you want to PERMANENTLY DELETE this ad for violating the rules?"
      },
      "create_ad": {
        "title_sale": "Publish Sale Ad", "title_rent": "Publish Rent Ad",
        "sell": "Sell", "publish": "Publish", "vehicle": "Vehicle", "rent_slogan": "Rent-a-Beast: Put your machine to work",
        "tech_data": "Technical Data", "year_placeholder": "Year (Ex: 2021)", "hp_placeholder": "Power (HP)", "tonality": "Tonality",
        "photos": "Photos", "photo": "Photo", "main": "Main", "add_more": "Add more", "upload_photos": "Upload car photos",
        "upload_rent_photos": "Upload photos for rent", "photo_limit": "You can select up to 5 images (JPG, PNG)",
        "commercial_details": "Commercial Details", "mileage_placeholder": "Mileage (Km)", "current_mileage": "Current Mileage (Km)",
        "description_placeholder": "Describe vehicle condition, extras, maintenance...", "describe_conditions": "Describe the conditions...",
        "starting_engine": "Starting Engine...", "publish_rent": "Publish Rent",
        "error_publish": "Error publishing. Check the fields and your connection."
      },
      "edit_ad": {
        "title": "Edit Ad", "subtitle": "Modify your vehicle details.",
        "edit": "Edit", "vehicle": "Vehicle", "technical_data": "Technical Data", "hp": "HP", "commercial_details": "Commercial Details",
        "updating": "Updating...", "submit": "Update Ad", "error_loading": "Error loading the ad", "error_updating": "Error updating"
      },
      "navbar": {
        "home": "Home", "rents": "Rentals", "search_placeholder": "Search vehicles for sale or rent...",
        "see_all": "See all results", "login": "Login", "register": "Register",
        "favorites": "Favorites", "hello": "Hello", "my_ads": "My Ads", "profile": "Manage Profile",
        "logout": "Logout", "admin_panel": "Moderation Panel"
      },
      "register": {
        "create_account": "Create account", "join": "Join", "first_name": "First Name", "last_name": "Last Name", 
        "email": "Email", "password": "Password", "confirm_password": "Confirm password", 
        "hide_password": "Hide password", "show_password": "Show password", "min_length": "Minimum 8 characters", 
        "uppercase": "At least one uppercase", "lowercase": "At least one lowercase", "number": "At least one number", 
        "special": "At least one special character", "passwords_not_match": "Passwords do not match", 
        "already_have_account": "Already have an account?", "login": "Log in", "error_register": "Registration error"
      },
      "password_recovery": {
        "recover": "Recover", "password": "Password", "subtitle": "Enter your email and we will send you a link to reset your account.", 
        "check_inbox": "Check your inbox (and spam).", "email_label": "Email", "email_placeholder": "example@email.com", 
        "sending": "Sending...", "send_link": "Send link", "back_to_login": "Back to login", 
        "error_send": "Could not send the email. Try again."
      },
      "reset_password": {
        "success_msg": "Password updated successfully! Redirecting to login...", "error_msg": "The link has expired or is invalid. Request a new one.", 
        "reset": "Reset", "password": "Password", "subtitle": "Create a new secure password for your account.", 
        "new_password": "New password", "repeat_password": "Repeat password", "char_length": "8+ characters", 
        "uppercase": "Uppercase", "number": "Number", "symbol": "Symbol (!@#)", "match": "Match", "updating": "Updating...", 
        "save_new_password": "Save new password"
      },
      "login": {
        "invalid_credentials": "Invalid credentials", "google_error": "There was a problem validating the user with the server.", 
        "validating": "Validating credentials...", "sign_in_title": "Sign in to your account", "email": "Email", 
        "password": "Password", "hide_password": "Hide password", "show_password": "Show password", "sign_in_btn": "Sign in", 
        "or": "OR", "forgot_password": "Forgot your password?", "no_account": "Don't have an account?", "register": "REGISTER"
      },
      "profile": {
        "manage_profile": "Manage My Profile", "personal_data": "Personal Data", "name": "Name", 
        "email": "Email", "telephone": "Phone", "save_changes": "Save Changes", 
        "change_password": "Change Password", "current_password": "Current Password", "new_password": "New Password", 
        "min_length": "Minimum 8 characters", "uppercase": "At least one uppercase", "lowercase": "At least one lowercase", 
        "number": "At least one number", "special": "At least one special character", "confirm_new_password": "Confirm New Password", 
        "passwords_not_match": "Passwords do not match.", "update_password": "Update Password",
        "success_profile": "Profile updated successfully.", "error_profile": "Error updating profile.",
        "connection_error": "Connection error.", "success_password": "Password updated successfully.",
        "error_password": "Error updating password."
      },
      "favorites": {
        "login_required_toggle": "Log in to toggle favorites", "error_toggle": "Could not update favorites", 
        "error_fetch": "Error fetching favorite vehicles", "login_required_view": "Log in to view your favorites.", 
        "no_favorites": "Add to favorites", "remove_favorite": "Remove favorite", "empty_favorites": "No favorites have been marked yet."
      },
      "admin_panel": {
        "search_placeholder": "Search by Brand, Model or ID...", "all": "All", "sales": "Sales", "rents": "Rentals", 
        "vehicle": "Vehicle", "type": "Type", "state": "State", "price": "Price", "actions": "Actions", 
        "searching_inventory": "Searching Inventory...", "no_ads_found": "No ads found.", 
        "delete_confirm": "Permanently delete this ad?", "delete_error": "Error deleting the ad",
        "priority_reports": "Priority Reports", "urgency": "Urgency", "vehicle_ad": "Vehicle / Ad", 
        "reason": "Reason", "date": "Date", "analyzing_reports": "Analyzing Reports...", "no_reports": "No pending reports. Platform clean!", 
        "report": "Report", "reports": "Reports", "review": "Review", "error_change_role": "Error changing role", 
        "delete_user_confirm": "Delete user? This will delete all their ads and photos. Irreversible.", 
        "error_delete": "Error deleting", "search_user_placeholder": "Search by name, email or ID...", "user": "User", 
        "role": "Role", "sync_db": "Syncing Database...", "no_users_found": "No users found matching the search.", 
        "change_permissions": "Change permissions", "delete_user": "Delete user", "protected_account": "PROTECTED ACCOUNT",
        "reports_tab": "Reports", "users_tab": "Users", "ads_tab": "Ads", "title": "Moderation Panel"
      },
      "report": {
        "loading_motives": "Error loading report motives.", "login_required": "You must log in to report an ad.", 
        "success_msg": "Your report has been sent. An admin will review it soon.", "error_processing": "Error processing the report.", 
        "error_sending": "There was an error sending the report. Try again later.", "title": "Report Ad", 
        "subtitle": "Help us keep the community safe. Select the reason for your report.", "back_to_ad": "Back to ad", 
        "other": "Other", "specify_motive": "Please specify the reason", "details_placeholder": "Write the details here...", 
        "cancel": "Cancel", "sending": "Sending...", "send_report": "Send Report"
      }
    }
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: 'es',
  interpolation: { escapeValue: false }
});

export default i18n;