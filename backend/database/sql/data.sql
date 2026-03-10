insert into vehicle_brands (name, created_at, updated_at) values 
('Toyota', now(), now()),
('Mercedes', now(), now()),
('Audi', now(), now()),
('BMW', now(), now()),
('Honda', now(), now()),
('Seat', now(), now());

insert into vehicle_models (name, brand_id, created_at, updated_at) values
-- Toyota
('Corolla', 1, now(), now()),
('Yaris', 1, now(), now()),
('RAV4', 1, now(), now()),
('Supra', 1, now(), now()),

-- Mercedes
('Clase A', 2, now(), now()),
('Clase C', 2, now(), now()),
('Clase E', 2, now(), now()),
('GLC', 2, now(), now()),

-- Audi
('A3', 3, now(), now()),
('A4', 3, now(), now()),
('A6', 3, now(), now()),
('Q5', 3, now(), now()),

-- BMW
('Serie 1', 4, now(), now()),
('Serie 3', 4, now(), now()),
('Serie 5', 4, now(), now()),
('X3', 4, now(), now()),

-- Honda
('Civic', 5, now(), now()),
('Accord', 5, now(), now()),
('CR-V', 5, now(), now()),
('HR-V', 5, now(), now()),

-- Seat
('Ibiza', 6, now(), now()),
('Leon', 6, now(), now()),
('Arona', 6, now(), now()),
('Ateca', 6, now(), now());