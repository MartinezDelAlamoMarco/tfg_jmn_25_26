-- NIVEL 0: TABLAS INDEPENDIENTES Y USUARIOS
-- Contraseña para todos: 'password'
INSERT INTO users (id, name, email, password, telephone, role, created_at, updated_at) VALUES
(1, 'Admin', 'admin@redlinemotors.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '600111222', 'admin', NOW(), NOW());

INSERT INTO provinces (id, name, created_at, updated_at) VALUES
(1, 'Madrid', NOW(), NOW()), (2, 'Barcelona', NOW(), NOW()), (3, 'Valencia', NOW(), NOW()), (4, 'Sevilla', NOW(), NOW());

INSERT INTO fuel_types (id, name, created_at, updated_at) VALUES
(1, 'Gasolina', NOW(), NOW()), (2, 'Diésel', NOW(), NOW()), (3, 'Híbrido', NOW(), NOW()), (4, 'Eléctrico', NOW(), NOW());

INSERT INTO transmissions (id, name, created_at, updated_at) VALUES
(1, 'Manual', NOW(), NOW()), (2, 'Automático', NOW(), NOW());

INSERT INTO tonalities (id, name, created_at, updated_at) VALUES
(1, 'Blanco Perla', NOW(), NOW()), (2, 'Negro Mate', NOW(), NOW()), (3, 'Rojo Fuego', NOW(), NOW()), (4, 'Gris Nardo', NOW(), NOW());

INSERT INTO ad_states (id, name, created_at, updated_at) VALUES
(1, 'Disponible', NOW(), NOW()), (2, 'Reservado', NOW(), NOW()), (3, 'Vendido', NOW(), NOW());

INSERT INTO vehicle_brands (id, name, created_at, updated_at) VALUES
(1, 'Toyota', NOW(), NOW()), (2, 'BMW', NOW(), NOW()), (3, 'Ford', NOW(), NOW());


-- NIVEL 1: MODELOS (Dependen de marcas)
INSERT INTO vehicle_models (id, brand_id, name, created_at, updated_at) VALUES
(1, 1, 'Corolla', NOW(), NOW()),
(2, 2, 'Serie 3', NOW(), NOW()),
(3, 3, 'Mustang GT', NOW(), NOW());


-- NIVEL 2: VEHÍCULOS (Dependen de todo lo anterior)
-- Coche 1: De Javi (Corolla, Híbrido, Automático, Blanco)
-- Coche 2: De Javi (BMW, Diésel, Automático, Negro)
-- Coche 3: De Marco (Mustang, Gasolina, Manual, Rojo)
INSERT INTO vehicles (id, owner_id, model_id, fuel_type_id, transmission_id, tonality_id, year, km, power_hp, doors, created_at, updated_at) VALUES
(1, 2, 1, 3, 2, 1, 2021, 45000, 122, 5, NOW(), NOW()), 
(2, 2, 2, 2, 2, 2, 2019, 95000, 190, 4, NOW(), NOW()), 
(3, 3, 3, 1, 1, 3, 2018, 60000, 450, 2, NOW(), NOW()); 


-- NIVEL 3: ANUNCIOS E IMÁGENES
INSERT INTO advertisements (id, vehicle_id, province_id, ad_state_id, price, description, views, created_at, updated_at) VALUES
(1, 1, 1, 1, 18500.00, 'Toyota Corolla muy cuidado, siempre en garaje. Etiqueta ECO.', 120, NOW(), NOW()),
(2, 2, 2, 1, 24000.00, 'BMW Serie 3 paquete M. Todas las revisiones al día en casa oficial.', 340, NOW(), NOW()),
(3, 3, 1, 3, 35000.00, 'Ford Mustang V8. Sonido espectacular, capricho de fin de semana.', 890, NOW(), NOW());

-- Fotos sacadas de Unsplash para que queden bonitas en el frontend
INSERT INTO advertisement_images (id, advertisement_id, image_url, is_main, created_at, updated_at) VALUES
(1, 1, 'https://images.unsplash.com/photo-1629897048514-3dd7415494d6', true, NOW(), NOW()),
(2, 2, 'https://images.unsplash.com/photo-1555353540-64fd1b62f790', true, NOW(), NOW()),
(3, 3, 'https://images.unsplash.com/photo-1584345611124-2c091bc8601c', true, NOW(), NOW());


-- NIVEL 4: NEGOCIO E INTERACCIONES
-- 1. Marco (3) le pide información a Javi (2) por el Corolla (Anuncio 1)
INSERT INTO ad_requests (id, advertisement_id, sender_id, type, status, message, created_at, updated_at) VALUES
(1, 1, 3, 'informacion', 'pendiente', 'Hola Javi, ¿el precio del Corolla es algo negociable?', NOW(), NOW());

-- 2. Transacción: Javi (2) le compra el Mustang (Anuncio 3) a Marco (3)
INSERT INTO transactions (id, advertisement_id, buyer_id, seller_id, final_price, date, created_at, updated_at) VALUES
(1, 3, 2, 3, 34000.00, '2026-04-15', NOW(), NOW());

-- 3. Review: Tras la compra, Javi (2) valora a Marco (3)
INSERT INTO reviews (id, reviewer_id, evaluated_id, rating, comment, created_at, updated_at) VALUES
(1, 2, 3, 5, 'Vendedor de 10. El Mustang estaba impecable, tal cual las fotos.', NOW(), NOW());

-- 4. Favoritos: Marco (3) guarda el BMW (Anuncio 2) en su lista de deseados
INSERT INTO favourites (id, user_id, advertisement_id, created_at, updated_at) VALUES
(1, 3, 2, NOW(), NOW());

-- 5. Alquileres: Nuria Admin (1) alquila el BMW (Anuncio 2) de Javi
INSERT INTO rents (id, advertisement_id, renter_id, start_date, end_date, total_price, created_at, updated_at) VALUES
(1, 2, 1, '2026-05-01', '2026-05-05', 300.00, NOW(), NOW());

INSERT INTO public.report_types (name, created_at, updated_at) VALUES 
('Imagen inapropiada o sexual', NOW(), NOW()),
('Información falsa o engañosa', NOW(), NOW()),
('Estafa / Fraude', NOW(), NOW()),
('Vehículo ya vendido', NOW(), NOW()),
('Comentario ofensivo', NOW(), NOW()),
('Otro', NOW(), NOW());