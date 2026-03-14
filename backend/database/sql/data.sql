-- =========================
-- VEHICLE BRANDS
-- =========================

INSERT INTO vehicle_brands (name, created_at) VALUES
('Toyota',NOW()),
('BMW',NOW()),
('Audi',NOW()),
('Mercedes',NOW()),
('Volkswagen',NOW()),
('Ford',NOW()),
('Seat',NOW()),
('Hyundai',NOW());

-- =========================
-- VEHICLE MODELS
-- =========================

INSERT INTO vehicle_models (name,brand_id,created_at) VALUES
('Corolla',1,NOW()),
('Yaris',1,NOW()),
('Serie 3',2,NOW()),
('Serie 5',2,NOW()),
('A3',3,NOW()),
('A4',3,NOW()),
('Clase C',4,NOW()),
('Clase A',4,NOW()),
('Golf',5,NOW()),
('Passat',5,NOW()),
('Focus',6,NOW()),
('Fiesta',6,NOW()),
('Leon',7,NOW()),
('Ibiza',7,NOW()),
('i30',8,NOW());

-- =========================
-- USERS
-- password = "password"
-- =========================

INSERT INTO users (name,email,password,created_at) VALUES
('Juan Perez','juan@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.ogB7qkY3HqQ9K7gW',NOW()),
('Maria Lopez','maria@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.ogB7qkY3HqQ9K7gW',NOW()),
('Carlos Ruiz','carlos@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.ogB7qkY3HqQ9K7gW',NOW()),
('Laura Gomez','laura@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.ogB7qkY3HqQ9K7gW',NOW()),
('Pedro Sanchez','pedro@test.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.ogB7qkY3HqQ9K7gW',NOW());

-- =========================
-- ADVERTISEMENTS
-- =========================

INSERT INTO advertisements
(user_id,model_id,price,km,year,fuel_type,transmission,power_hp,doors,color,description,vehicle_condition,province,views,created_at)
VALUES
(1,9,14500,85000,2018,'diesel','manual',150,5,'black','Volkswagen Golf muy cuidado','used','Madrid',12,NOW()),
(2,5,18500,60000,2019,'diesel','manual',150,5,'white','Audi A3 en perfecto estado','used','Barcelona',20,NOW()),
(3,3,32000,30000,2021,'gasoline','automatic',190,5,'blue','BMW Serie 3 prácticamente nuevo','used','Valencia',5,NOW()),
(4,13,17000,50000,2020,'diesel','manual',150,5,'red','Seat Leon FR muy equipado','used','Sevilla',7,NOW()),
(5,11,12000,90000,2017,'diesel','manual',120,5,'grey','Ford Focus económico','used','Bilbao',15,NOW()),
(1,1,9000,120000,2015,'gasoline','manual',110,5,'silver','Toyota Corolla fiable','used','Madrid',9,NOW()),
(2,7,28000,40000,2020,'diesel','automatic',200,5,'black','Mercedes Clase C premium','used','Barcelona',11,NOW()),
(3,6,24000,55000,2019,'diesel','automatic',180,5,'white','Audi A4 muy cómodo','used','Valencia',14,NOW());

-- =========================
-- ADVERTISEMENT IMAGES
-- =========================

INSERT INTO advertisement_images
(advertisement_id,image_url,position,created_at)
VALUES
(1,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(2,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(3,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(4,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(5,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(6,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(7,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW()),
(8,'https://via.placeholder.com/800x600?text=Car+Image',1,NOW());

-- =========================
-- FAVOURITES
-- =========================

INSERT INTO favourites (user_id,advertisement_id,created_at) VALUES
(1,2,NOW()),
(1,3,NOW()),
(2,1,NOW()),
(3,4,NOW()),
(4,5,NOW());

-- =========================
-- REVIEWS
-- =========================

INSERT INTO reviews
(reviewer_id,reviewed_user_id,rating,comment,created_at)
VALUES
(2,1,5,'Muy buen vendedor',NOW()),
(3,1,4,'Todo correcto',NOW()),
(1,2,5,'Compra perfecta',NOW()),
(4,3,4,'Vehículo tal como en el anuncio',NOW());

-- =========================
-- TRANSACTIONS
-- =========================

INSERT INTO transactions
(advertisement_id,buyer_id,seller_id,price,created_at)
VALUES
(1,2,1,14500,NOW()),
(5,4,5,12000,NOW());

-- =========================
-- RENTS
-- =========================

INSERT INTO rents
(advertisement_id,owner_id,renter_id,start_date,end_date,price,created_at)
VALUES
(3,3,2,'2026-04-01','2026-04-10',900,NOW()),
(7,2,5,'2026-05-05','2026-05-12',1200,NOW());