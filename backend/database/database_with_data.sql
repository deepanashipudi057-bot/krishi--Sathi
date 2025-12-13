-- Database setup for Krishi Sathi
CREATE DATABASE IF NOT EXISTS krishi_sathi;
USE krishi_sathi;

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(5) NOT NULL,
    name VARCHAR(50) NOT NULL
);

-- Create weather_forecast table
CREATE TABLE IF NOT EXISTS weather_forecast (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    temperature DECIMAL(5,2),
    humidity INT,
    wind_speed DECIMAL(5,2),
    precipitation DECIMAL(5,2),
    description TEXT,
    language_id INT,
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Create weather_translations table
CREATE TABLE IF NOT EXISTS weather_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    weather_id INT,
    language_id INT,
    description TEXT,
    FOREIGN KEY (weather_id) REFERENCES weather_forecast(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Create pesticides_fertilizers table
CREATE TABLE IF NOT EXISTS pesticides_fertilizers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    composition VARCHAR(100),
    usage_per_acre VARCHAR(50),
    price_range VARCHAR(100),
    organic BOOLEAN DEFAULT FALSE
);

-- Create pesticides_translations table
CREATE TABLE IF NOT EXISTS pesticides_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pesticide_id INT,
    language_id INT,
    product_name VARCHAR(100),
    description TEXT,
    usage_instructions TEXT,
    precautions TEXT,
    FOREIGN KEY (pesticide_id) REFERENCES pesticides_fertilizers(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Create seeds_crops table
CREATE TABLE IF NOT EXISTS seeds_crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crop_type VARCHAR(50) NOT NULL,
    season VARCHAR(50),
    duration VARCHAR(50),
    yield_per_acre VARCHAR(50),
    water_requirement VARCHAR(20),
    soil_type VARCHAR(50)
);

-- Create seeds_crops_translations table
CREATE TABLE IF NOT EXISTS seeds_crops_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seed_crop_id INT,
    language_id INT,
    crop_name VARCHAR(100),
    description TEXT,
    planting_method TEXT,
    care_instructions TEXT,
    FOREIGN KEY (seed_crop_id) REFERENCES seeds_crops(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Create government_schemes table
CREATE TABLE IF NOT EXISTS government_schemes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_type VARCHAR(50) NOT NULL,
    eligibility VARCHAR(200),
    amount_range VARCHAR(100),
    contact_info VARCHAR(200),
    website VARCHAR(200),
    active BOOLEAN DEFAULT TRUE,
    state VARCHAR(50)
);

-- Create government_schemes_translations table
CREATE TABLE IF NOT EXISTS government_schemes_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT,
    language_id INT,
    scheme_name VARCHAR(200),
    description TEXT,
    benefits TEXT,
    application_process TEXT,
    FOREIGN KEY (scheme_id) REFERENCES government_schemes(id),
    FOREIGN KEY (language_id) REFERENCES languages(id)
);

-- Insert languages
INSERT INTO languages (code, name) VALUES
('en', 'English'),
('hi', 'Hindi'),
('mr', 'Marathi'),
('kn', 'Kannada');

-- Insert weather_forecast data
INSERT INTO weather_forecast (location, date, temperature, humidity, wind_speed, precipitation, description, language_id) VALUES
('Mumbai', '2024-01-15', 28.5, 65, 12.5, 0.0, 'Sunny with clear skies', 1),
('Delhi', '2024-01-15', 22.0, 55, 8.0, 0.0, 'Mild winter day', 1),
('Bangalore', '2024-01-15', 25.0, 70, 10.0, 0.0, 'Pleasant weather', 1),
('Chennai', '2024-01-15', 30.0, 75, 15.0, 0.0, 'Warm and humid', 1);

-- Insert weather_translations
INSERT INTO weather_translations (weather_id, language_id, description) VALUES
(1, 2, 'साफ आसमान के साथ धूप'),
(1, 3, 'स्वच्छ आकाशासह सूर्यप्रकाश'),
(1, 4, 'ಸ್ವಚ್ಛ ಆಕಾಶದೊಂದಿಗೆ ಸೂರ್ಯನ ಬೆಳಕು'),
(2, 2, 'हल्का सर्दी का दिन'),
(2, 3, 'हलक्या थंडीचा दिवस'),
(2, 4, 'ಸ್ವಲ್ಪ ಶೀತದ ದಿನ'),
(3, 2, 'आनंददायक मौसम'),
(3, 3, 'आनंददायक हवामान'),
(3, 4, 'ಸಂತೋಷಕರ ಹವಾಮಾನ'),
(4, 2, 'गर्म और नम'),
(4, 3, 'उष्ण आणि आर्द्र'),
(4, 4, 'ಬೆಚ್ಚಗಿನ ಮತ್ತು ತೇವಾಂಶ');

-- Insert pesticides_fertilizers data
INSERT INTO pesticides_fertilizers (product_type, category, composition, usage_per_acre, price_range, organic) VALUES
('fertilizer', 'nitrogen', '46% N', '50-60 kg', '₹300-400 per 50kg bag', FALSE),
('fertilizer', 'phosphate', '46% P2O5', '40-50 kg', '₹400-500 per 50kg bag', FALSE),
('pesticide', 'insecticide', 'Chlorpyrifos 20% EC', '400-500 ml', '₹250-350 per liter', FALSE),
('pesticide', 'organic', 'Neem Oil 1500 ppm', '2-3 liters', '₹400-600 per liter', TRUE);

-- Insert pesticides_translations
INSERT INTO pesticides_translations (pesticide_id, language_id, product_name, description, usage_instructions, precautions) VALUES
(1, 1, 'Urea', 'Urea is the most commonly used nitrogen fertilizer. It provides quick nitrogen to plants and is suitable for all crops.', 'Apply in split doses for better efficiency. First dose at sowing, second after 30 days, third at flowering stage. Mix with soil, don\'t apply on leaves. Water immediately after application.', 'Wear gloves while handling. Store in cool, dry place away from direct sunlight. Keep away from children and animals. Wash hands thoroughly after use. Avoid mixing with other fertilizers.'),
(1, 2, 'यूरिया', 'यूरिया सबसे अधिक उपयोग किया जाने वाला नाइट्रोजन उर्वरक है। यह पौधों को त्वरित नाइट्रोजन प्रदान करता है और सभी फसलों के लिए उपयुक्त है।', 'बेहतर दक्षता के लिए विभाजित खुराक में डालें। पहली खुराक बुवाई पर, दूसरी 30 दिनों के बाद, तीसरी फूल आने के चरण में। मिट्टी में मिलाएं, पत्तियों पर न डालें। प्रयोग के तुरंत बाद पानी दें।', 'संभालते समय दस्ताने पहनें। सीधी धूप से दूर ठंडी, सूखी जगह पर स्टोर करें। बच्चों और जानवरों से दूर रखें। उपयोग के बाद हाथों को अच्छी तरह धोएं। अन्य उर्वरकों के साथ मिश्रण से बचें।'),
(1, 3, 'युरिया', 'युरिया हे सर्वाधिक वापरले जाणारे नायट्रोजन खत आहे. हे रोपांना जलद नायट्रोजन पुरवते आणि सर्व पिकांसाठी योग्य आहे.', 'चांगल्या कार्यक्षमतेसाठी विभाजित डोसमध्ये घाला. पहिला डोस पेरणीच्या वेळी, दुसरा 30 दिवसांनंतर, तिसरा फुलांच्या अवस्थेत. मातीमध्ये मिसळा, पानांवर घालू नका. वापरल्यानंतर लगेच पाणी द्या.', 'हाताळताना हातमोजे घाला. थेट सूर्यप्रकाशापासून दूर थंड, कोरड्या ठिकाणी साठवा. मुले आणि प्राण्यांपासून दूर ठेवा. वापरल्यानंतर हात चांगले धुवा. इतर खतांशी मिश्रण करणे टाळा.'),
(1, 4, 'ಯೂರಿಯಾ', 'ಯೂರಿಯಾ ಅತ್ಯಂತ ಸಾಮಾನ್ಯವಾಗಿ ಬಳಸುವ ಸಾರಜನಕ ರಸಗೊಬ್ಬರವಾಗಿದೆ. ಇದು ಸಸ್ಯಗಳಿಗೆ ತ್ವರಿತ ಸಾರಜನಕವನ್ನು ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ಎಲ್ಲಾ ಬೆಳೆಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.', 'ಉತ್ತಮ ದಕ್ಷತೆಗಾಗಿ ವಿಭಜಿತ ಪ್ರಮಾಣದಲ್ಲಿ ಅನ್ವಯಿಸಿ. ಮೊದಲ ಪ್ರಮಾಣ ಬಿತ್ತನೆಯ ಸಮಯದಲ್ಲಿ, ಎರಡನೇದು 30 ದಿನಗಳ ನಂತರ, ಮೂರನೇದು ಹೂಬಿಡುವ ಹಂತದಲ್ಲಿ. ಮಣ್ಣಿನೊಂದಿಗೆ ಬೆರೆಸಿ, ಎಲೆಗಳ ಮೇಲೆ ಹಾಕಬೇಡಿ. ಅನ್ವಯದ ತಕ್ಷಣ ನೀರು ಹಾಕಿ.', 'ನಿರ್ವಹಿಸುವಾಗ ಕೈಗವಸುಗಳನ್ನು ಧರಿಸಿ. ನೇರ ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ದೂರದಲ್ಲಿ ತಂಪಾದ, ಒಣ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ಮಕ್ಕಳು ಮತ್ತು ಪ್ರಾಣಿಗಳಿಂದ ದೂರವಿರಿಸಿ. ಬಳಕೆಯ ನಂತರ ಕೈಗಳನ್ನು ಚೆನ್ನಾಗಿ ತೊಳೆಯಿರಿ. ಇತರ ರಸಗೊಬ್ಬರಗಳೊಂದಿಗೆ ಬೆರೆಸುವುದನ್ನು ತಪ್ಪಿಸಿ.'),
(2, 1, 'Single Super Phosphate (SSP)', 'SSP is a phosphatic fertilizer that promotes root development, flowering, and fruiting. It also contains sulfur and calcium.', 'Apply as basal dose at the time of sowing or planting. Mix thoroughly with soil in seed furrow. For standing crops, apply around the plant base and cover with soil. Suitable for all crops especially oilseeds and pulses.', 'Use protective gear during application. Avoid inhalation of dust. Store in moisture-free environment. Do not contaminate water sources. Keep container tightly closed when not in use.'),
(2, 2, 'सिंगल सुपर फॉस्फेट (SSP)', 'SSP एक फास्फेटिक उर्वरक है जो जड़ विकास, फूल और फलों को बढ़ावा देता है। इसमें सल्फर और कैल्शियम भी होता है।', 'बुवाई या रोपण के समय बेसल डोज के रूप में डालें। बीज की नाली में मिट्टी के साथ अच्छी तरह मिलाएं। खड़ी फसलों के लिए, पौधे के आधार के चारों ओर डालें और मिट्टी से ढक दें। सभी फसलों के लिए उपयुक्त विशेष रूप से तिलहन और दालें।', 'प्रयोग के दौरान सुरक्षात्मक गियर का उपयोग करें। धूल के साँस लेने से बचें। नमी मुक्त वातावरण में स्टोर करें। जल स्रोतों को दूषित न करें। उपयोग में न होने पर कंटेनर को कसकर बंद रखें।'),
(2, 3, 'सिंगल सुपर फॉस्फेट (SSP)', 'SSP हे फॉस्फेटिक खत आहे जे मुळांचा विकास, फुलणे आणि फळे येणे यांना प्रोत्साहन देते. यात सल्फर आणि कॅल्शियम देखील असते.', 'पेरणी किंवा लागवडीच्या वेळी बेसल डोज म्हणून घाला. बियाणे ओळीत मातीमध्ये चांगले मिसळा. उभ्या पिकांसाठी, रोपाच्या पायथ्याभोवती घाला आणि मातीने झाका. सर्व पिकांसाठी विशेषतः तेलबिया आणि कडधान्यांसाठी योग्य.', 'वापरादरम्यान संरक्षणात्मक गियर वापरा. धूळ श्वास घेणे टाळा. आर्द्रता मुक्त वातावरणात साठवा. जलस्रोत दूषित करू नका. वापरात नसताना कंटेनर घट्ट बंद ठेवा.'),
(2, 4, 'ಸಿಂಗಲ್ ಸೂಪರ್ ಫಾಸ್ಫೇಟ್ (SSP)', 'SSP ಫಾಸ್ಫೇಟ್ ರಸಗೊಬ್ಬರವಾಗಿದ್ದು ಇದು ಬೇರು ಬೆಳವಣಿಗೆ, ಹೂಬಿಡುವಿಕೆ ಮತ್ತು ಫಲೀಕರಣವನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ. ಇದು ಗಂಧಕ ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ಅನ್ನು ಸಹ ಹೊಂದಿದೆ.', 'ಬಿತ್ತನೆ ಅಥವಾ ನೆಡುವ ಸಮಯದಲ್ಲಿ ಮೂಲ ಪ್ರಮಾಣವಾಗಿ ಅನ್ವಯಿಸಿ. ಬೀಜದ ಗಾಳಿಯಲ್ಲಿ ಮಣ್ಣಿನೊಂದಿಗೆ ಚೆನ್ನಾಗಿ ಬೆರೆಸಿ. ನಿಂತಿರುವ ಬೆಳೆಗಳಿಗೆ, ಸಸ್ಯದ ತಳದ ಸುತ್ತಲೂ ಅನ್ವಯಿಸಿ ಮತ್ತು ಮಣ್ಣಿನಿಂದ ಮುಚ್ಚಿ. ಎಲ್ಲಾ ಬೆಳೆಗಳಿಗೆ ವಿಶೇಷವಾಗಿ ಎಣ್ಣೆಬೀಜಗಳು ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.', 'ಅನ್ವಯದ ಸಮಯದಲ್ಲಿ ರಕ್ಷಣಾತ್ಮಕ ಸಾಧನಗಳನ್ನು ಬಳಸಿ. ಧೂಳಿನ ಉಸಿರಾಟವನ್ನು ತಪ್ಪಿಸಿ. ತೇವಾಂಶ ಮುಕ್ತ ವಾತಾವರಣದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ನೀರಿನ ಮೂಲಗಳನ್ನು ಕಲುಷಿತಗೊಳಿಸಬೇಡಿ. ಬಳಕೆಯಲ್ಲಿಲ್ಲದಿದ್ದಾಗ ಧಾರಕವನ್ನು ಬಿಗಿಯಾಗಿ ಮುಚ್ಚಿ ಇರಿಸಿ.'),
(3, 1, 'Chlorpyrifos', 'Chlorpyrifos is a broad-spectrum insecticide effective against sucking and chewing pests. Works through contact and ingestion.', 'Dilute 400-500 ml in 200 liters of water per acre. Spray during early morning or late evening. Ensure complete coverage of plant parts. Repeat application after 15 days if needed. Use minimum 2 sprays per season.', 'HIGHLY TOXIC - Handle with extreme care. Wear protective clothing, gloves, mask, and goggles. Do not eat, drink, or smoke while spraying. Avoid contact with skin and eyes. Do not spray against wind. Keep livestock away from treated areas for 7 days. Observe harvest interval of 15 days.'),
(3, 2, 'क्लोरपायरीफॉस', 'क्लोरपायरीफॉस एक व्यापक स्पेक्ट्रम कीटनाशक है जो चूसने और चबाने वाले कीटों के खिलाफ प्रभावी है। संपर्क और सेवन के माध्यम से काम करता है।', 'प्रति एकड़ 200 लीटर पानी में 400-500 मिली घोलें। सुबह जल्दी या देर शाम को स्प्रे करें। पौधे के भागों को पूरी तरह से कवर करें। आवश्यकता पड़ने पर 15 दिनों के बाद दोबारा प्रयोग करें। प्रति सीजन न्यूनतम 2 स्प्रे का उपयोग करें।', 'अत्यधिक विषाक्त - अत्यधिक सावधानी से संभालें। सुरक्षात्मक कपड़े, दस्ताने, मास्क और चश्मा पहनें। स्प्रे करते समय खाना, पीना या धूम्रपान न करें। त्वचा और आंखों के संपर्क से बचें। हवा के खिलाफ स्प्रे न करें। उपचारित क्षेत्रों से पशुओं को 7 दिनों तक दूर रखें। 15 दिनों के कटाई अंतराल का पालन करें।'),
(3, 3, 'क्लोरपायरीफॉस', 'क्लोरपायरीफॉस हे शोषक आणि चर्वण करणाऱ्या कीटकांविरुद्ध प्रभावी व्यापक स्पेक्ट्रम कीटकनाशक आहे. संपर्क आणि सेवनाद्वारे कार्य करते.', 'प्रति एकर 200 लिटर पाण्यात 400-500 मिली मिसळा. लवकर सकाळी किंवा संध्याकाळी फवारणी करा. रोपाच्या भागांचे संपूर्ण कव्हरेज सुनिश्चित करा. आवश्यक असल्यास 15 दिवसांनंतर पुन्हा वापरा. हंगामात किमान 2 फवारण्या वापरा.', 'अत्यंत विषारी - अत्यंत काळजीपूर्वक हाताळा. संरक्षक कपडे, हातमोजे, मास्क आणि चष्मा घाला. फवारणी करताना खाणे, पिणे किंवा धूम्रपान करू नका. त्वचा आणि डोळ्यांचा संपर्क टाळा. वाऱ्याच्या विरुद्ध फवारणी करू नका. उपचारित भागातून 7 दिवस पशुधन दूर ठेवा. 15 दिवसांचा कापणी मध्यांतर पाळा.'),
(3, 4, 'ಕ್ಲೋರ್ಪೈರಿಫಾಸ್', 'ಕ್ಲೋರ್ಪೈರಿಫಾಸ್ ಹೀರುವ ಮತ್ತು ಅಗಿಯುವ ಕೀಟಗಳ ವಿರುದ್ಧ ಪರಿಣಾಮಕಾರಿ ವಿಶಾಲ-ವರ್ಣಪಟಲದ ಕೀಟನಾಶಕವಾಗಿದೆ. ಸಂಪರ್ಕ ಮತ್ತು ಸೇವನೆಯ ಮೂಲಕ ಕೆಲಸ ಮಾಡುತ್ತದೆ.', 'ಪ್ರತಿ ಎಕರೆಗೆ 200 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ 400-500 ಮಿಲಿ ದ್ರವೀಕರಿಸಿ. ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ತಡವಾಗಿ ಸಿಂಪಡಿಸಿ. ಸಸ್ಯ ಭಾಗಗಳ ಸಂಪೂರ್ಣ ವ್ಯಾಪ್ತಿಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ. ಅಗತ್ಯವಿದ್ದರೆ 15 ದಿನಗಳ ನಂತರ ಅನ್ವಯವನ್ನು ಪುನರಾವರ್ತಿಸಿ. ಪ್ರತಿ ಋತುವಿಗೆ ಕನಿಷ್ಠ 2 ಸಿಂಪಡಣೆಗಳನ್ನು ಬಳಸಿ.', 'ಅತ್ಯಂತ ವಿಷಕಾರಿ - ಅತ್ಯಂತ ಜಾಗರೂಕತೆಯಿಂದ ನಿರ್ವಹಿಸಿ. ರಕ್ಷಣಾತ್ಮಕ ಉಡುಪು, ಕೈಗವಸುಗಳು, ಮುಖವಾಡ ಮತ್ತು ಕನ್ನಡಕಗಳನ್ನು ಧರಿಸಿ. ಸಿಂಪಡಿಸುವಾಗ ತಿನ್ನಬೇಡಿ, ಕುಡಿಯಬೇಡಿ ಅಥವಾ ಧೂಮಪಾನ ಮಾಡಬೇಡಿ. ಚರ್ಮ ಮತ್ತು ಕಣ್ಣುಗಳೊಂದಿಗೆ ಸಂಪರ್ಕವನ್ನು ತಪ್ಪಿಸಿ. ಗಾಳಿಯ ವಿರುದ್ಧ ಸಿಂಪಡಿಸಬೇಡಿ. 7 ದಿನಗಳವರೆಗೆ ಚಿಕಿತ್ಸೆ ನೀಡಿದ ಪ್ರದೇಶಗಳಿಂದ ಜಾನುವಾರುಗಳನ್ನು ದೂರವಿರಿಸಿ. 15 ದಿನಗಳ ಕೊಯ್ಲು ಮಧ್ಯಂತರವನ್ನು ಗಮನಿಸಿ.'),
(4, 1, 'Neem Oil (Organic)', 'Neem oil is a natural, organic pesticide extracted from neem seeds. Effective against aphids, whiteflies, mites, and fungal diseases. Safe for beneficial insects.', 'Mix 2-3 liters with 200 liters of water per acre. Add liquid soap (10ml per liter) as emulsifier. Spray during cooler hours. Repeat every 7-10 days. Can be used up to harvest day. Compatible with most organic farming practices.', 'Non-toxic and eco-friendly. Wear normal protective gear. Avoid spraying during hot sunny hours as it may cause leaf burn. Store in cool, dark place. Shake well before use. Safe for humans and animals. No harvest interval required.'),
(4, 2, 'नीम का तेल (जैविक)', 'नीम का तेल नीम के बीज से निकाला गया एक प्राकृतिक, जैविक कीटनाशक है। एफिड्स, सफेद मक्खियों, माइट्स और फंगल रोगों के खिलाफ प्रभावी। लाभकारी कीड़ों के लिए सुरक्षित।', 'प्रति एकड़ 200 लीटर पानी में 2-3 लीटर मिलाएं। इमल्सीफायर के रूप में तरल साबुन (10 मिली प्रति लीटर) जोड़ें। ठंडे घंटों के दौरान स्प्रे करें। हर 7-10 दिनों में दोहराएं। कटाई के दिन तक उपयोग किया जा सकता है। अधिकांश जैविक खेती प्रथाओं के साथ संगत।', 'गैर-विषाक्त और पर्यावरण के अनुकूल। सामान्य सुरक्षात्मक गियर पहनें। गर्म धूप के घंटों में स्प्रे करने से बचें क्योंकि यह पत्ती जलने का कारण बन सकता है। ठंडी, अंधेरी जगह में स्टोर करें। उपयोग से पहले अच्छी तरह हिलाएं। मनुष्यों और जानवरों के लिए सुरक्षित। कोई कटाई अंतराल आवश्यक नहीं।'),
(4, 3, 'कडुनिंबाचे तेल (सेंद्रिय)', 'कडुनिंबाचे तेल हे कडुनिंबाच्या बियांपासून काढलेले नैसर्गिक, सेंद्रिय कीटकनाशक आहे. मुंग्या, पांढऱ्या माशा, माइट्स आणि बुरशीजन्य रोगांविरुद्ध प्रभावी. फायदेशीर कीटकांसाठी सुरक्षित.', 'प्रति एकर 200 लिटर पाण्यात 2-3 लिटर मिसळा. इमल्सिफायर म्हणून द्रव साबण (10 मिली प्रति लिटर) घाला. थंड तासांमध्ये फवारणी करा. दर 7-10 दिवसांनी पुनरावृत्ती करा. कापणीच्या दिवसापर्यंत वापरता येते. बहुतेक सेंद्रिय शेती पद्धतींशी सुसंगत.', 'विषारी नसलेले आणि पर्यावरणस्नेही. सामान्य संरक्षक गियर घाला. उष्ण सूर्यप्रकाशाच्या तासांमध्ये फवारणी टाळा कारण यामुळे पाने जळू शकतात. थंड, गडद ठिकाणी साठवा. वापरापूर्वी चांगले हलवा. मानव आणि प्राण्यांसाठी सुरक्षित. कापणी मध्यांतराची आवश्यकता नाही.'),
(4, 4, 'ಬೇವಿನ ಎಣ್ಣೆ (ಸಾವಯವ)', 'ಬೇವಿನ ಎಣ್ಣೆ ಬೇವಿನ ಬೀಜಗಳಿಂದ ಹೊರತೆಗೆಯಲಾದ ನೈಸರ್ಗಿಕ, ಸಾವಯವ ಕೀಟನಾಶಕವಾಗಿದೆ. ಗಿಡಹೇನುಗಳು, ಬಿಳಿ ನೊಣಗಳು, ಹುಳಗಳು ಮತ್ತು ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ವಿರುದ್ಧ ಪರಿಣಾಮಕಾರಿ. ಪ್ರಯೋಜನಕಾರಿ ಕೀಟಗಳಿಗೆ ಸುರಕ್ಷಿತ.', 'ಪ್ರತಿ ಎಕರೆಗೆ 200 ಲೀಟರ್ ನೀರಿನೊಂದಿಗೆ 2-3 ಲೀಟರ್ ಬೆರೆಸಿ. ಎಮಲ್ಸಿಫೈಯರ್ ಆಗಿ ದ್ರವ ಸಾಬೂನು (ಪ್ರತಿ ಲೀಟರ್‌ಗೆ 10 ಮಿಲಿ) ಸೇರಿಸಿ. ತಂಪಾದ ಗಂಟೆಗಳಲ್ಲಿ ಸಿಂಪಡಿಸಿ. ಪ್ರತಿ 7-10 ದಿನಗಳಿಗೊಮ್ಮೆ ಪುನರಾವರ್ತಿಸಿ. ಕೊಯ್ಲು ದಿನದವರೆಗೆ ಬಳಸಬಹುದು. ಹೆಚ್ಚಿನ ಸಾವಯವ ಕೃಷಿ ಪದ್ಧತಿಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ.', 'ವಿಷಕಾರಿಯಲ್ಲದ ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ. ಸಾಮಾನ್ಯ ರಕ್ಷಣಾತ್ಮಕ ಸಾಧನಗಳನ್ನು ಧರಿಸಿ. ಬಿಸಿಲಿನ ಬಿಸಿ ಗಂಟೆಗಳಲ್ಲಿ ಸಿಂಪಡಿಸುವುದನ್ನು ತಪ್ಪಿಸಿ ಏಕೆಂದರೆ ಇದು ಎಲೆ ಸುಡುವಿಕೆಗೆ ಕಾರಣವಾಗಬಹುದು. ತಂಪಾದ, ಕತ್ತಲೆಯ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ. ಬಳಸುವ ಮೊದಲು ಚೆನ್ನಾಗಿ ಅಲ್ಲಾಡಿಸಿ. ಮಾನವರು ಮತ್ತು ಪ್ರಾಣಿಗಳಿಗೆ ಸುರಕ್ಷಿತ. ಕೊಯ್ಲು ಮಧ್ಯಂತರದ ಅಗತ್ಯವಿಲ್ಲ.');

-- Insert seeds_crops data
INSERT INTO seeds_crops (crop_type, season, duration, yield_per_acre, water_requirement, soil_type) VALUES
('cereals', 'kharif', '120-150 days', '25-30 quintals', 'high', 'clay_loam'),
('pulses', 'rabi', '90-110 days', '8-12 quintals', 'medium', 'loamy'),
('vegetables', 'all_year', '60-80 days', '80-100 quintals', 'high', 'sandy_loam'),
('cash_crops', 'kharif', '150-180 days', '15-20 quintals', 'medium', 'black_soil');

-- Insert seeds_crops_translations
INSERT INTO seeds_crops_translations (seed_crop_id, language_id, crop_name, description, planting_method, care_instructions) VALUES
(1, 1, 'Rice (Paddy)', 'Rice is a staple cereal crop that requires well-leveled fields with proper water management. It thrives in warm, humid climates.', 'Transplanting: Prepare seedbed 30 days before transplanting. Maintain 2-3 inches of water level. Plant spacing: 20cm x 15cm.', 'Regular weeding required. Apply nitrogen fertilizers in split doses. Monitor for pests like stem borers and leaf folders. Drain water 10-15 days before harvest.'),
(1, 2, 'धान (चावल)', 'धान एक प्रमुख अनाज फसल है जिसे उचित जल प्रबंधन के साथ अच्छी तरह से समतल खेतों की आवश्यकता होती है। यह गर्म, आर्द्र जलवायु में पनपता है।', 'प्रत्यारोपण: प्रत्यारोपण से 30 दिन पहले बीज की क्यारी तैयार करें। 2-3 इंच पानी का स्तर बनाए रखें। पौधे की दूरी: 20 सेमी x 15 सेमी।', 'नियमित निराई आवश्यक है। विभाजित खुराक में नाइट्रोजन उर्वरक लगाएं। तना छेदक और पत्ती मोड़क जैसे कीटों की निगरानी करें। कटाई से 10-15 दिन पहले पानी निकालें।'),
(1, 3, 'तांदूळ (भात)', 'तांदूळ हे एक प्रमुख धान्य पीक आहे ज्यासाठी योग्य पाणी व्यवस्थापनासह चांगल्या प्रकारे समतल शेते आवश्यक असतात. हे उष्ण, आर्द्र हवामानात वाढते.', 'प्रत्यारोपण: प्रत्यारोपणाच्या 30 दिवस आधी बियाणे पलंग तयार करा. 2-3 इंच पाण्याची पातळी राखा. रोपांचे अंतर: 20 सेमी x 15 सेमी.', 'नियमित तण काढणे आवश्यक. विभाजित डोसमध्ये नायट्रोजन खते घाला. स्टेम बोअरर आणि लीफ फोल्डर यांसारख्या कीटकांचे निरीक्षण करा. कापणीच्या 10-15 दिवस आधी पाणी काढा.'),
(1, 4, 'ಅಕ್ಕಿ (ಭತ್ತ)', 'ಅಕ್ಕಿ ಒಂದು ಪ್ರಮುಖ ಧಾನ್ಯ ಬೆಳೆಯಾಗಿದ್ದು, ಸರಿಯಾದ ನೀರು ನಿರ್ವಹಣೆಯೊಂದಿಗೆ ಚೆನ್ನಾಗಿ ನೆಲಸಮವಾದ ಹೊಲಗಳ ಅಗತ್ಯವಿರುತ್ತದೆ. ಇದು ಬೆಚ್ಚಗಿನ, ತೇವಾಂಶವುಳ್ಳ ವಾತಾವರಣದಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ.', 'ಕಸಿ ಮಾಡುವುದು: ಕಸಿ ಮಾಡುವ 30 ದಿನಗಳ ಮೊದಲು ಬೀಜದ ತೊಟ್ಟಿಯನ್ನು ತಯಾರಿಸಿ. 2-3 ಇಂಚು ನೀರಿನ ಮಟ್ಟವನ್ನು ನಿರ್ವಹಿಸಿ. ಸಸಿ ಅಂತರ: 20 ಸೆಂ.ಮೀ x 15 ಸೆಂ.ಮೀ.', 'ನಿಯಮಿತ ಕಳೆ ತೆಗೆಯುವುದು ಅವಶ್ಯಕ. ವಿಭಜಿತ ಪ್ರಮಾಣದಲ್ಲಿ ಸಾರಜನಕ ರಸಗೊಬ್ಬರಗಳನ್ನು ಅನ್ವಯಿಸಿ. ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುಗಳು ಮತ್ತು ಎಲೆ ಮಡಚುವವುಗಳಂತಹ ಕೀಟಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ. ಕೊಯ್ಲುಗೆ 10-15 ದಿನಗಳ ಮೊದಲು ನೀರನ್ನು ಬರಿದುಮಾಡಿ.'),
(2, 1, 'Chickpea (Gram)', 'Chickpea is an important pulse crop rich in protein. It is drought-resistant and improves soil fertility through nitrogen fixation.', 'Direct sowing: Sow seeds at 30cm row spacing and 10cm plant spacing. Seed depth: 5-7cm. Seed rate: 25-30 kg per acre.', 'One or two irrigations at critical stages. Earthing up after 30-35 days. Protect from pod borer. Harvest when 80% pods turn brown.'),
(2, 2, 'चना (काबुली चना)', 'चना प्रोटीन से भरपूर एक महत्वपूर्ण दलहन फसल है। यह सूखा प्रतिरोधी है और नाइट्रोजन स्थिरीकरण के माध्यम से मिट्टी की उर्वरता में सुधार करता है।', 'सीधी बुवाई: 30 सेमी पंक्ति की दूरी और 10 सेमी पौधे की दूरी पर बीज बोएं। बीज की गहराई: 5-7 सेमी। बीज दर: 25-30 किलो प्रति एकड़।', 'महत्वपूर्ण चरणों में एक या दो सिंचाई। 30-35 दिनों के बाद मिट्टी चढ़ाना। फली छेदक से सुरक्षा। जब 80% फलियां भूरी हो जाएं तो कटाई करें।'),
(2, 3, 'हरभरा (चणे)', 'हरभरा हे प्रथिनांनी समृद्ध एक महत्त्वाचे कडधान्य पीक आहे. हे दुष्काळ प्रतिरोधक आहे आणि नायट्रोजन स्थिरीकरणाद्वारे मातीची सुपीकता सुधारते.', 'थेट पेरणी: 30 सेमी ओळीचे अंतर आणि 10 सेमी रोपांचे अंतर ठेवून बिया पेरा. बियाणे खोली: 5-7 सेमी. बियाणे दर: 25-30 किलो प्रति एकर.', 'गंभीर टप्प्यांवर एक किंवा दोन पाणी पुरवठा. 30-35 दिवसांनंतर मातीचा उंच भराव. शेंगा पोखरणाऱ्या किड्यांपासून संरक्षण. 80% शेंगा तपकिरी झाल्यावर कापणी करा.'),
(2, 4, 'ಕಡಲೆ (ಚಣಾ)', 'ಕಡಲೆ ಪ್ರೋಟೀನ್‌ನಿಂದ ಸಮೃದ್ಧವಾದ ಪ್ರಮುಖ ದ್ವಿದಳ ಧಾನ್ಯ ಬೆಳೆಯಾಗಿದೆ. ಇದು ಬರ-ನಿರೋಧಕವಾಗಿದೆ ಮತ್ತು ಸಾರಜನಕ ಸ್ಥಿರೀಕರಣದ ಮೂಲಕ ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ.', 'ನೇರ ಬಿತ್ತನೆ: 30 ಸೆಂ.ಮೀ ಸಾಲು ಅಂತರ ಮತ್ತು 10 ಸೆಂ.ಮೀ ಸಸಿ ಅಂತರದಲ್ಲಿ ಬೀಜಗಳನ್ನು ಬಿತ್ತಿರಿ. ಬೀಜದ ಆಳ: 5-7 ಸೆಂ.ಮೀ. ಬೀಜ ದರ: ಪ್ರತಿ ಎಕರೆಗೆ 25-30 ಕೆ.ಜಿ.', 'ನಿರ್ಣಾಯಕ ಹಂತಗಳಲ್ಲಿ ಒಂದು ಅಥವಾ ಎರಡು ನೀರಾವರಿ. 30-
