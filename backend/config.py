import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    LIVEKIT_URL = os.getenv('LIVEKIT_URL')
    LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
    LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    MYSQL_CONFIG = {
        'host': os.getenv('MYSQL_HOST', 'localhost'),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD'),
        'database': os.getenv('MYSQL_DATABASE', 'krishi_sathi_db'),
        'charset': 'utf8mb4'
    }
    
    SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'kn']
