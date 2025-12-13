CREATE DATABASE IF NOT EXISTS krishi_sathi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE krishi_sathi_db;

-- Languages table
CREATE TABLE languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL
);

INSERT INTO languages (code, name) VALUES 
    ('en', 'English'),
    ('hi', 'हिन्दी'),
    ('mr', 'मराठी'),
    ('kn', 'ಕನ್ನಡ');

-- Weather forecast table
CREATE TABLE weather_forecast (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100),
    date DATE,
    temperature VARCHAR(50),
    humidity VARCHAR(50),
    rainfall VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weather_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    weather_id INT,
    language_code VARCHAR(10),
    location_name VARCHAR(100),
    conditions TEXT,
    advice TEXT,
    FOREIGN KEY (weather_id) REFERENCES weather_forecast(id),
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Seeds and crops table
CREATE TABLE seeds_crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_type VARCHAR(100),
    season VARCHAR(50),
    duration VARCHAR(50),
    yield_per_acre VARCHAR(50)
);

CREATE TABLE seeds_crops_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_id INT,
    language_code VARCHAR(10),
    crop_name VARCHAR(100),
    description TEXT,
    planting_method TEXT,
    care_instructions TEXT,
    FOREIGN KEY (crop_id) REFERENCES seeds_crops(id),
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Pesticides and fertilizers table
CREATE TABLE pesticides_fertilizers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_type ENUM('pesticide', 'fertilizer'),
    usage_per_acre VARCHAR(50),
    price_range VARCHAR(50)
);

CREATE TABLE pesticides_fertilizers_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    language_code VARCHAR(10),
    product_name VARCHAR(100),
    description TEXT,
    usage_instructions TEXT,
    precautions TEXT,
    FOREIGN KEY (product_id) REFERENCES pesticides_fertilizers(id),
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Government schemes table
CREATE TABLE government_schemes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_type ENUM('subsidy', 'loan', 'insurance', 'grant'),
    eligibility TEXT,
    amount_range VARCHAR(100),
    contact_info VARCHAR(200)
);

CREATE TABLE government_schemes_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT,
    language_code VARCHAR(10),
    scheme_name VARCHAR(200),
    description TEXT,
    benefits TEXT,
    application_process TEXT,
    FOREIGN KEY (scheme_id) REFERENCES government_schemes(id),
    FOREIGN KEY (language_code) REFERENCES languages(code)
);
