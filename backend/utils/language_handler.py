"""
Language Handler Module for Krishi Sathi
Handles language detection, translation, and multilingual support
"""

import re
from typing import Dict, List, Optional, Tuple
import json
from pathlib import Path

class LanguageHandler:
    """
    Handles language detection and translation operations for the application
    """
    
    # Supported languages
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'hi': 'हिन्दी',
        'mr': 'मराठी',
        'kn': 'ಕನ್ನಡ'
    }
    
    # Language detection patterns
    LANGUAGE_PATTERNS = {
        'hi': re.compile(r'[\u0900-\u097F]+'),  # Devanagari script (Hindi)
        'mr': re.compile(r'[\u0900-\u097F]+'),  # Devanagari script (Marathi)
        'kn': re.compile(r'[\u0C80-\u0CFF]+'),  # Kannada script
        'en': re.compile(r'[a-zA-Z]+')          # English
    }
    
    # Common greetings in different languages
    GREETINGS = {
        'en': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        'hi': ['नमस्ते', 'नमस्कार', 'हैलो', 'हाय', 'सुप्रभात', 'शुभ संध्या'],
        'mr': ['नमस्कार', 'नमस्ते', 'हॅलो', 'हाय', 'सुप्रभात', 'शुभ संध्याकाळ'],
        'kn': ['ನमಸ್ಕಾರ', 'ಹಲೋ', 'ಹಾಯ್', 'ಶುಭೋದಯ', 'ಶುಭ ಸಂಜೆ']
    }
    
    # Agriculture-related keywords in different languages
    AGRICULTURE_KEYWORDS = {
        'weather': {
            'en': ['weather', 'rain', 'temperature', 'forecast', 'climate'],
            'hi': ['मौसम', 'बारिश', 'तापमान', 'पूर्वानुमान', 'जलवायु'],
            'mr': ['हवामान', 'पाऊस', 'तापमान', 'अंदाज', 'हवामान'],
            'kn': ['ಹವಾಮಾನ', 'ಮಳೆ', 'ತಾಪಮಾನ', 'ಮುನ್ಸೂಚನೆ', 'ವಾತಾವರಣ']
        },
        'crops': {
            'en': ['crop', 'seed', 'plant', 'farming', 'cultivation', 'harvest'],
            'hi': ['फसल', 'बीज', 'पौधा', 'खेती', 'कृषि', 'कटाई'],
            'mr': ['पीक', 'बियाणे', 'रोप', 'शेती', 'लागवड', 'कापणी'],
            'kn': ['ಬೆಳೆ', 'ಬೀಜ', 'ಸಸಿ', 'ಕೃಷಿ', 'ಬೆಳೆಯುವಿಕೆ', 'ಕೊಯ್ಲು']
        },
        'pesticides': {
            'en': ['pesticide', 'fertilizer', 'insecticide', 'fungicide', 'herbicide'],
            'hi': ['कीटनाशक', 'उर्वरक', 'कीटनाशक', 'फफूंदनाशक', 'खरपतवारनाशी'],
            'mr': ['कीटकनाशक', 'खत', 'किडनाशक', 'बुरशीनाशक', 'तणनाशक'],
            'kn': ['ಕೀಟನಾಶಕ', 'ರಸಗೊಬ್ಬರ', 'ಕೀಟನಾಶಕ', 'ಶಿಲೀಂಧ್ರನಾಶಕ', 'ಕಳೆನಾಶಕ']
        },
        'schemes': {
            'en': ['scheme', 'loan', 'subsidy', 'grant', 'insurance', 'government'],
            'hi': ['योजना', 'ऋण', 'सब्सिडी', 'अनुदान', 'बीमा', 'सरकार'],
            'mr': ['योजना', 'कर्ज', 'सवलत', 'अनुदान', 'विमा', 'सरकार'],
            'kn': ['ಯೋಜನೆ', 'ಸಾಲ', 'ಸಬ್ಸಿಡಿ', 'ಅನುದಾನ', 'ವಿಮೆ', 'ಸರ್ಕಾರ']
        }
    }
    
    def __init__(self):
        """Initialize the language handler"""
        self.default_language = 'en'
        self.current_language = 'en'
    
    def detect_language(self, text: str) -> str:
        """
        Detect the language of the input text
        
        Args:
            text: Input text to detect language
            
        Returns:
            Language code (en, hi, mr, kn)
        """
        if not text or not text.strip():
            return self.default_language
        
        text = text.strip().lower()
        
        # Count characters for each language script
        language_scores = {}
        
        for lang_code, pattern in self.LANGUAGE_PATTERNS.items():
            matches = pattern.findall(text)
            if matches:
                total_chars = sum(len(match) for match in matches)
                language_scores[lang_code] = total_chars
        
        # Return language with highest character count
        if language_scores:
            detected_lang = max(language_scores, key=language_scores.get)
            
            # Special handling for Devanagari (Hindi vs Marathi)
            if detected_lang in ['hi', 'mr']:
                # Check for Marathi-specific words
                marathi_indicators = ['आहे', 'होते', 'आणि', 'माझे', 'तुझे']
                hindi_indicators = ['है', 'था', 'और', 'मेरा', 'तुम्हारा']
                
                marathi_count = sum(1 for word in marathi_indicators if word in text)
                hindi_count = sum(1 for word in hindi_indicators if word in text)
                
                if marathi_count > hindi_count:
                    return 'mr'
                elif hindi_count > marathi_count:
                    return 'hi'
            
            return detected_lang
        
        # Default to English if no pattern matches
        return self.default_language
    
    def detect_category(self, text: str, language: str = None) -> Optional[str]:
        """
        Detect the agriculture category from user query
        
        Args:
            text: User query text
            language: Language code (auto-detect if None)
            
        Returns:
            Category name (weather, crops, pesticides, schemes) or None
        """
        if language is None:
            language = self.detect_language(text)
        
        text = text.lower()
        
        # Count keyword matches for each category
        category_scores = {}
        
        for category, keywords_dict in self.AGRICULTURE_KEYWORDS.items():
            if language in keywords_dict:
                keywords = keywords_dict[language]
                score = sum(1 for keyword in keywords if keyword.lower() in text)
                if score > 0:
                    category_scores[category] = score
        
        # Return category with highest score
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return None
    
    def is_greeting(self, text: str, language: str = None) -> bool:
        """
        Check if the text is a greeting
        
        Args:
            text: Input text
            language: Language code (auto-detect if None)
            
        Returns:
            True if greeting, False otherwise
        """
        if language is None:
            language = self.detect_language(text)
        
        text = text.lower().strip()
        
        if language in self.GREETINGS:
            greetings = self.GREETINGS[language]
            return any(greeting in text for greeting in greetings)
        
        return False
    
    def get_greeting_response(self, language: str = 'en') -> str:
        """
        Get appropriate greeting response in specified language
        
        Args:
            language: Language code
            
        Returns:
            Greeting message
        """
        responses = {
            'en': "Hello! I am Krishi Sathi, your agricultural assistant. How can I help you today?",
            'hi': "नमस्ते! मैं कृषि साथी हूं, आपका कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूं?",
            'mr': "नमस्कार! मी कृषि साथी आहे, तुमचा शेती सहाय्यक. आज मी तुमची कशी मदत करू शकतो?",
            'kn': "ನಮಸ್ಕಾರ! ನಾನು ಕೃಷಿ ಸಾಥಿ, ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
        }
        
        return responses.get(language, responses['en'])
    
    def get_category_prompt(self, category: str, language: str = 'en') -> str:
        """
        Get appropriate prompt for a category in specified language
        
        Args:
            category: Category name
            language: Language code
            
        Returns:
            Prompt message
        """
        prompts = {
            'weather': {
                'en': "I can help you with weather forecasts. Please tell me your location.",
                'hi': "मैं मौसम पूर्वानुमान में आपकी मदद कर सकता हूं। कृपया मुझे अपना स्थान बताएं।",
                'mr': "मी तुम्हाला हवामान अंदाजामध्ये मदत करू शकतो. कृपया मला तुमचे स्थान सांगा.",
                'kn': "ನಾನು ನಿಮಗೆ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು. ದಯವಿಟ್ಟು ನನಗೆ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ."
            },
            'crops': {
                'en': "I can provide information about seeds and crops. What would you like to know?",
                'hi': "मैं बीज और फसलों के बारे में जानकारी प्रदान कर सकता हूं। आप क्या जानना चाहेंगे?",
                'mr': "मी बियाणे आणि पिकांबद्दल माहिती देऊ शकतो. तुम्हाला काय जाणून घ्यायचे आहे?",
                'kn': "ನಾನು ಬೀಜಗಳು ಮತ್ತು ಬೆಳೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಯನ್ನು ನೀಡಬಹುದು. ನೀವು ಏನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?"
            },
            'pesticides': {
                'en': "I can help with pesticides and fertilizers information. What do you need?",
                'hi': "मैं कीटनाशकों और उर्वरकों की जानकारी में मदद कर सकता हूं। आपको क्या चाहिए?",
                'mr': "मी कीटकनाशके आणि खतांच्या माहितीत मदत करू शकतो. तुम्हाला काय हवे आहे?",
                'kn': "ನಾನು ಕೀಟನಾಶಕಗಳು ಮತ್ತು ರಸಗೊಬ್ಬರಗಳ ಮಾಹಿತಿಯೊಂದಿಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ನಿಮಗೆ ಏನು ಬೇಕು?"
            },
            'schemes': {
                'en': "I can inform you about government schemes and loans. What information do you need?",
                'hi': "मैं आपको सरकारी योजनाओं और ऋणों के बारे में सूचित कर सकता हूं। आपको क्या जानकारी चाहिए?",
                'mr': "मी तुम्हाला सरकारी योजना आणि कर्जांबद्दल माहिती देऊ शकतो. तुम्हाला कोणती माहिती हवी आहे?",
                'kn': "ನಾನು ನಿಮಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಾಲಗಳ ಬಗ್ಗೆ ತಿಳಿಸಬಹುದು. ನಿಮಗೆ ಯಾವ ಮಾಹಿತಿ ಬೇಕು?"
            }
        }
        
        if category in prompts and language in prompts[category]:
            return prompts[category][language]
        
        return prompts.get(category, {}).get('en', "How can I assist you?")
    
    def translate_field(self, data: Dict, field_name: str, language: str = 'en') -> str:
        """
        Extract translated field from multilingual data
        
        Args:
            data: Dictionary containing translations
            field_name: Name of the field to extract
            language: Target language code
            
        Returns:
            Translated text or empty string
        """
        if not data:
            return ""
        
        # Check if translations exist
        if 'translations' in data and language in data['translations']:
            return data['translations'][language].get(field_name, "")
        
        # Fallback to English
        if 'translations' in data and 'en' in data['translations']:
            return data['translations']['en'].get(field_name, "")
        
        # Direct field access as fallback
        return data.get(field_name, "")
    
    def get_language_name(self, language_code: str) -> str:
        """
        Get full language name from code
        
        Args:
            language_code: Language code
            
        Returns:
            Full language name
        """
        return self.SUPPORTED_LANGUAGES.get(language_code, 'English')
    
    def validate_language(self, language_code: str) -> bool:
        """
        Validate if language code is supported
        
        Args:
            language_code: Language code to validate
            
        Returns:
            True if supported, False otherwise
        """
        return language_code in self.SUPPORTED_LANGUAGES
    
    def get_error_message(self, error_type: str, language: str = 'en') -> str:
        """
        Get error message in specified language
        
        Args:
            error_type: Type of error
            language: Language code
            
        Returns:
            Error message
        """
        error_messages = {
            'no_data': {
                'en': "Sorry, no information available at the moment.",
                'hi': "क्षमा करें, इस समय कोई जानकारी उपलब्ध नहीं है।",
                'mr': "माफ करा, सध्या कोणतीही माहिती उपलब्ध नाही.",
                'kn': "ಕ್ಷಮಿಸಿ, ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
            },
            'invalid_input': {
                'en': "I didn't understand that. Could you please rephrase?",
                'hi': "मुझे वह समझ में नहीं आया। क्या आप कृपया दोबारा कह सकते हैं?",
                'mr': "मला ते समजले नाही. कृपया पुन्हा सांगाल का?",
                'kn': "ನನಗೆ ಅದು ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಬಹುದೇ?"
            },
            'database_error': {
                'en': "Sorry, there was an error accessing the database. Please try again later.",
                'hi': "क्षमा करें, डेटाबेस तक पहुंचने में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।",
                'mr': "माफ करा, डेटाबेस ऍक्सेस करताना त्रुटी आली. कृपया नंतर पुन्हा प्रयत्न करा.",
                'kn': "ಕ್ಷಮಿಸಿ, ಡೇಟಾಬೇಸ್ ಪ್ರವೇಶಿಸುವಲ್ಲಿ ದೋಷವಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            },
            'network_error': {
                'en': "Network error. Please check your connection.",
                'hi': "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।",
                'mr': "नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा.",
                'kn': "ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ."
            }
        }
        
        if error_type in error_messages and language in error_messages[error_type]:
            return error_messages[error_type][language]
        
        return error_messages.get(error_type, {}).get('en', "An error occurred.")
    
    def format_response(self, data: List[Dict], language: str = 'en') -> str:
        """
        Format database results into readable response
        
        Args:
            data: List of data dictionaries
            language: Target language
            
        Returns:
            Formatted response string
        """
        if not data:
            return self.get_error_message('no_data', language)
        
        # Format based on number of results
        if len(data) == 1:
            item = data[0]
            response_parts = []
            
            # Extract all translation fields
            if 'translations' in item and language in item['translations']:
                trans = item['translations'][language]
                for key, value in trans.items():
                    if value:
                        response_parts.append(f"{value}")
            
            return "\n\n".join(response_parts)
        
        else:
            # Multiple results - create summary
            summaries = []
            for idx, item in enumerate(data[:5], 1):  # Limit to 5 results
                if 'translations' in item and language in item['translations']:
                    trans = item['translations'][language]
                    name = trans.get('crop_name') or trans.get('product_name') or \
                           trans.get('scheme_name') or trans.get('location_name', f"Item {idx}")
                    summaries.append(f"{idx}. {name}")
            
            return "\n".join(summaries)


# Global instance
language_handler = LanguageHandler()


def detect_language(text: str) -> str:
    """Convenience function to detect language"""
    return language_handler.detect_language(text)


def detect_category(text: str, language: str = None) -> Optional[str]:
    """Convenience function to detect category"""
    return language_handler.detect_category(text, language)


def get_greeting_response(language: str = 'en') -> str:
    """Convenience function to get greeting"""
    return language_handler.get_greeting_response(language)
