import json
import os
from database.db_config import execute_query

def get_weather_data(language='en'):
    """Fetch weather forecast data in specified language"""
    try:
        query = """
            SELECT w.*, wt.location_name, wt.conditions, wt.advice
            FROM weather_forecast w
            JOIN weather_translations wt ON w.id = wt.weather_id
            WHERE wt.language_code = %s
            ORDER BY w.date DESC
            LIMIT 10
        """
        return execute_query(query, (language,))
    except Exception as e:
        print(f"Database error for weather data: {e}")
        return get_weather_from_json(language)

def get_seeds_crops_data(language='en'):
    """Fetch seeds and crops data in specified language"""
    try:
        query = """
            SELECT sc.*, sct.crop_name, sct.description,
                   sct.planting_method, sct.care_instructions
            FROM seeds_crops sc
            JOIN seeds_crops_translations sct ON sc.id = sct.crop_id
            WHERE sct.language_code = %s
        """
        return execute_query(query, (language,))
    except Exception as e:
        print(f"Database error for seeds/crops data: {e}")
        return get_seeds_crops_from_json(language)

def get_pesticides_data(language='en'):
    """Fetch pesticides and fertilizers data in specified language"""
    try:
        query = """
            SELECT pf.*, pft.product_name, pft.description,
                   pft.usage_instructions, pft.precautions
            FROM pesticides_fertilizers pf
            JOIN pesticides_fertilizers_translations pft ON pf.id = pft.product_id
            WHERE pft.language_code = %s
        """
        return execute_query(query, (language,))
    except Exception as e:
        print(f"Database error for pesticides data: {e}")
        return get_pesticides_from_json(language)

def get_schemes_data(language='en'):
    """Fetch government schemes data in specified language"""
    try:
        query = """
            SELECT gs.*, gst.scheme_name, gst.description,
                   gst.benefits, gst.application_process
            FROM government_schemes gs
            JOIN government_schemes_translations gst ON gs.id = gst.scheme_id
            WHERE gst.language_code = %s
        """
        return execute_query(query, (language,))
    except Exception as e:
        print(f"Database error for schemes data: {e}")
        return get_schemes_from_json(language)

# JSON fallback functions
def get_weather_from_json(language='en'):
    """Fallback to JSON data for weather"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'weather_data.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        forecasts = data.get('weather_forecasts', [])
        # Filter forecasts that have translations for the requested language
        filtered_forecasts = []
        for forecast in forecasts:
            if 'translations' in forecast and language in forecast['translations']:
                trans = forecast['translations'][language]
                filtered_forecast = {
                    'id': forecast['id'],
                    'location': forecast['location'],
                    'coordinates': forecast['coordinates'],
                    'date': forecast['date'],
                    'temperature': forecast['temperature'],
                    'temperature_range': forecast['temperature_range'],
                    'humidity': forecast['humidity'],
                    'rainfall': forecast['rainfall'],
                    'wind_speed': forecast['wind_speed'],
                    'uv_index': forecast['uv_index'],
                    **trans
                }
                filtered_forecasts.append(filtered_forecast)
        return filtered_forecasts
    except Exception as e:
        print(f"JSON fallback error for weather: {e}")
        return []

def get_seeds_crops_from_json(language='en'):
    """Fallback to JSON data for seeds and crops"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'seeds_crops_data.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        crops = data.get('seeds_crops', [])
        # Filter crops that have translations for the requested language
        filtered_crops = []
        for crop in crops:
            if 'translations' in crop and language in crop['translations']:
                trans = crop['translations'][language]
                filtered_crop = {
                    'id': crop['id'],
                    'crop_type': crop['crop_type'],
                    'season': crop['season'],
                    'duration': crop['duration'],
                    'yield_per_acre': crop['yield_per_acre'],
                    'water_requirement': crop['water_requirement'],
                    'soil_type': crop['soil_type'],
                    **trans
                }
                filtered_crops.append(filtered_crop)
        return filtered_crops
    except Exception as e:
        print(f"JSON fallback error for seeds/crops: {e}")
        return []

def get_pesticides_from_json(language='en'):
    """Fallback to JSON data for pesticides"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'pesticides_data.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        products = data.get('pesticides_fertilizers', [])
        # Filter products that have translations for the requested language
        filtered_products = []
        for product in products:
            if 'translations' in product and language in product['translations']:
                trans = product['translations'][language]
                filtered_product = {
                    'id': product['id'],
                    'product_type': product['product_type'],
                    'category': product['category'],
                    'composition': product['composition'],
                    'usage_per_acre': product['usage_per_acre'],
                    'price_range': product['price_range'],
                    'organic': product['organic'],
                    **trans
                }
                filtered_products.append(filtered_product)
        return filtered_products
    except Exception as e:
        print(f"JSON fallback error for pesticides: {e}")
        return []

def get_schemes_from_json(language='en'):
    """Fallback to JSON data for schemes"""
    try:
        json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'schemes_data.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        schemes = data.get('government_schemes', [])
        # Filter by language if translations exist
        filtered_schemes = []
        for scheme in schemes:
            if 'translations' in scheme and language in scheme['translations']:
                trans = scheme['translations'][language]
                filtered_scheme = {
                    'id': scheme['id'],
                    'scheme_type': scheme.get('scheme_type', ''),
                    'eligibility': scheme.get('eligibility', ''),
                    'amount_range': scheme.get('amount_range', ''),
                    'contact_info': scheme.get('contact_info', ''),
                    'website': scheme.get('website', ''),
                    'active': scheme.get('active', True),
                    'state': scheme.get('state', ''),
                    **trans
                }
                filtered_schemes.append(filtered_scheme)
        return filtered_schemes
    except Exception as e:
        print(f"JSON fallback error for schemes: {e}")
        return []
