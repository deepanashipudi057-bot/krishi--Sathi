"""
Helper Functions Module for Krishi Sathi
Contains utility functions for data processing, validation, and formatting
"""

import re
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def sanitize_input(text: str) -> str:
    """
    Sanitize user input to prevent injection attacks
    
    Args:
        text: Input text to sanitize
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    text = re.sub(r'[<>\"\'%;()&+]', '', text)
    
    # Trim whitespace
    text = text.strip()
    
    return text


def validate_language_code(language_code: str) -> bool:
    """
    Validate language code
    
    Args:
        language_code: Language code to validate
        
    Returns:
        True if valid, False otherwise
    """
    valid_codes = ['en', 'hi', 'mr', 'kn']
    return language_code in valid_codes


def validate_phone_number(phone: str) -> bool:
    """
    Validate Indian phone number
    
    Args:
        phone: Phone number to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Indian phone number pattern (10 digits)
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone))


def validate_email(email: str) -> bool:
    """
    Validate email address
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def format_date(date_obj: datetime, language: str = 'en') -> str:
    """
    Format date according to language preference
    
    Args:
        date_obj: datetime object
        language: Language code
        
    Returns:
        Formatted date string
    """
    if language == 'en':
        return date_obj.strftime('%d %B %Y')
    elif language in ['hi', 'mr', 'kn']:
        # Use Indian date format
        return date_obj.strftime('%d-%m-%Y')
    
    return date_obj.strftime('%Y-%m-%d')


def format_currency(amount: float, language: str = 'en') -> str:
    """
    Format currency in Indian Rupees
    
    Args:
        amount: Amount to format
        language: Language code
        
    Returns:
        Formatted currency string
    """
    try:
        amount = float(amount)
        
        # Indian numbering system
        if amount >= 10000000:  # 1 crore
            formatted = f"₹{amount/10000000:.2f} Crore"
        elif amount >= 100000:  # 1 lakh
            formatted = f"₹{amount/100000:.2f} Lakh"
        elif amount >= 1000:  # 1 thousand
            formatted = f"₹{amount/1000:.2f}K"
        else:
            formatted = f"₹{amount:.2f}"
        
        return formatted
    except (ValueError, TypeError):
        return "₹0.00"


def generate_token(length: int = 32) -> str:
    """
    Generate a secure random token
    
    Args:
        length: Length of token
        
    Returns:
        Random token string
    """
    return secrets.token_urlsafe(length)


def hash_password(password: str) -> str:
    """
    Hash password using SHA-256
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return hashlib.sha256(password.encode()).hexdigest()


def parse_json_file(file_path: str) -> Optional[Dict]:
    """
    Parse JSON file and return data
    
    Args:
        file_path: Path to JSON file
        
    Returns:
        Parsed data or None
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return None
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in file: {file_path}")
        return None


def write_json_file(file_path: str, data: Dict) -> bool:
    """
    Write data to JSON file
    
    Args:
        file_path: Path to JSON file
        data: Data to write
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error writing to file {file_path}: {str(e)}")
        return False


def paginate_results(data: List, page: int = 1, per_page: int = 10) -> Dict:
    """
    Paginate list of results
    
    Args:
        data: List of data items
        page: Page number (1-indexed)
        per_page: Items per page
        
    Returns:
        Dictionary with paginated data and metadata
    """
    total = len(data)
    total_pages = (total + per_page - 1) // per_page
    
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'data': data[start:end],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
    }


def filter_by_field(data: List[Dict], field: str, value: Any) -> List[Dict]:
    """
    Filter list of dictionaries by field value
    
    Args:
        data: List of dictionaries
        field: Field name to filter by
        value: Value to match
        
    Returns:
        Filtered list
    """
    return [item for item in data if item.get(field) == value]


def search_in_data(data: List[Dict], search_term: str, fields: List[str]) -> List[Dict]:
    """
    Search for term in specified fields
    
    Args:
        data: List of dictionaries
        search_term: Term to search for
        fields: List of field names to search in
        
    Returns:
        Filtered list of matching items
    """
    search_term = search_term.lower()
    results = []
    
    for item in data:
        for field in fields:
            if field in item:
                value = str(item[field]).lower()
                if search_term in value:
                    results.append(item)
                    break
            # Search in translations
            elif 'translations' in item:
                for lang, trans in item['translations'].items():
                    if field in trans:
                        value = str(trans[field]).lower()
                        if search_term in value:
                            results.append(item)
                            break
    
    return results


def calculate_season(date_obj: Optional[datetime] = None) -> str:
    """
    Calculate Indian agricultural season from date
    
    Args:
        date_obj: datetime object (uses current date if None)
        
    Returns:
        Season name (kharif, rabi, zaid)
    """
    if date_obj is None:
        date_obj = datetime.now()
    
    month = date_obj.month
    
    # Kharif season: June to November
    if 6 <= month <= 11:
        return 'kharif'
    # Rabi season: November to April
    elif month <= 4 or month >= 11:
        return 'rabi'
    # Zaid season: March to June
    else:
        return 'zaid'


def get_date_range(days: int = 7) -> tuple:
    """
    Get date range from today
    
    Args:
        days: Number of days to include
        
    Returns:
        Tuple of (start_date, end_date)
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    return (start_date, end_date)


def format_weather_data(temperature: float, unit: str = 'C') -> str:
    """
    Format temperature with unit
    
    Args:
        temperature: Temperature value
        unit: Unit (C or F)
        
    Returns:
        Formatted temperature string
    """
    if unit == 'F':
        temperature = (temperature * 9/5) + 32
    
    return f"{temperature:.1f}°{unit}"


def extract_location(text: str) -> Optional[str]:
    """
    Extract location name from text
    
    Args:
        text: Input text
        
    Returns:
        Location name or None
    """
    # Common Indian cities
    cities = [
        'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai',
        'kolkata', 'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore',
        'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara',
        'ghaziabad', 'ludhiana', 'agra', 'nashik', 'ranchi', 'faridabad',
        'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar',
        'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad',
        'howrah', 'gwalior', 'jabalpur', 'coimbatore', 'vijayawada', 'jodhpur',
        'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur',
        'hubli', 'mysore', 'tiruchirappalli', 'bareilly', 'moradabad',
        'mysuru', 'tiruppur', 'gurgaon', 'aligarh', 'jalandhar', 'bhubaneswar'
    ]
    
    text_lower = text.lower()
    
    for city in cities:
        if city in text_lower:
            return city.title()
    
    return None


def chunk_list(lst: List, chunk_size: int) -> List[List]:
    """
    Split list into chunks
    
    Args:
        lst: List to split
        chunk_size: Size of each chunk
        
    Returns:
        List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def merge_dicts(dict1: Dict, dict2: Dict) -> Dict:
    """
    Merge two dictionaries recursively
    
    Args:
        dict1: First dictionary
        dict2: Second dictionary
        
    Returns:
        Merged dictionary
    """
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Args:
        lat1, lon1: First coordinate
        lat2, lon2: Second coordinate
        
    Returns:
        Distance in kilometers
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    distance = R * c
    return round(distance, 2)


def get_file_extension(filename: str) -> str:
    """
    Get file extension
    
    Args:
        filename: File name
        
    Returns:
        File extension (lowercase, without dot)
    """
    return Path(filename).suffix.lower().lstrip('.')


def is_valid_file_type(filename: str, allowed_types: List[str]) -> bool:
    """
    Check if file type is allowed
    
    Args:
        filename: File name
        allowed_types: List of allowed extensions
        
    Returns:
        True if allowed, False otherwise
    """
    extension = get_file_extension(filename)
    return extension in [ext.lower() for ext in allowed_types]


def truncate_text(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Truncate text to maximum length
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def log_error(error: Exception, context: str = "") -> None:
    """
    Log error with context
    
    Args:
        error: Exception object
        context: Additional context information
    """
    logger.error(f"Error in {context}: {type(error).__name__} - {str(error)}")


def create_response(success: bool, message: str, data: Any = None) -> Dict:
    """
    Create standardized API response
    
    Args:
        success: Success status
        message: Response message
        data: Response data
        
    Returns:
        Response dictionary
    """
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    return response


def get_current_timestamp() -> str:
    """
    Get current timestamp in ISO format
    
    Returns:
        ISO formatted timestamp
    """
    return datetime.now().isoformat()


def parse_date_string(date_string: str, format_str: str = '%Y-%m-%d') -> Optional[datetime]:
    """
    Parse date string to datetime object
    
    Args:
        date_string: Date string to parse
        format_str: Date format
        
    Returns:
        datetime object or None
    """
    try:
        return datetime.strptime(date_string, format_str)
    except ValueError:
        logger.error(f"Invalid date string: {date_string}")
        return None
