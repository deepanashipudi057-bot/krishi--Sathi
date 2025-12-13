import os

class Config:
    # LiveKit Configuration
    LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY', 'your-livekit-api-key')
    LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET', 'your-livekit-api-secret')
    LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://your-livekit-server.livekit.cloud')

    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key')

    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
