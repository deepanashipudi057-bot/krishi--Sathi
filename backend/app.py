from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import json
import os
import tempfile
from livekit import api
from config import Config
from database.queries import *
import openai
token = api.AccessToken(
    os.getenv("LIVEKIT_API_KEY"),
    os.getenv("LIVEKIT_API_SECRET"),
).with_identity("identity") \
 .with_name("name") \
 .with_grants(api.VideoGrants(
     room_join=True,
     room="my-room",
 )).to_jwt()


app = Flask(__name__,
            static_folder='database/frontend/assets',
            template_folder='database/frontend')
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pesticides.html')
def pesticides():
    return render_template('pesticides.html')

@app.route('/schemes.html')
def schemes():
    return render_template('schemes.html')

@app.route('/api/token', methods=['POST'])
def generate_token():
    """Generate LiveKit access token for voice assistant"""
    data = request.json
    room_name = data.get('room_name', 'krishi-sathi-room')
    participant_name = data.get('participant_name', 'farmer')
    
    token = api.AccessToken(Config.LIVEKIT_API_KEY, Config.LIVEKIT_API_SECRET)
    token.with_identity(participant_name).with_name(participant_name).with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
        )
    )
    
    return jsonify({
        'token': token.to_jwt(),
        'url': Config.LIVEKIT_URL
    })

@app.route('/api/weather/<language>')
def get_weather(language):
    """Get weather forecast data"""
    data = get_weather_data(language)
    return jsonify(data)

@app.route('/api/seeds-crops/<language>')
def get_seeds_crops(language):
    """Get seeds and crops information"""
    data = get_seeds_crops_data(language)
    return jsonify(data)

@app.route('/api/pesticides/<language>')
def get_pesticides(language):
    """Get pesticides and fertilizers information"""
    data = get_pesticides_data(language)
    return jsonify(data)

@app.route('/api/schemes/<language>')
def get_schemes(language):
    """Get government schemes information"""
    data = get_schemes_data(language)
    return jsonify(data)

@app.route('/api/voice/process', methods=['POST'])
def process_voice():
    """Process voice input using OpenAI"""
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        language = request.form.get('language', 'en')

        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name

        # Initialize OpenAI client
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

        # Transcribe audio using Whisper
        with open(temp_file_path, 'rb') as audio:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                language=language if language != 'en' else None
            )

        user_input = transcription.text.strip()

        # Detect language if not provided
        if language == 'en':
            # Simple language detection based on script
            if any('\u0900' <= char <= '\u097F' for char in user_input):
                detected_lang = 'hi'  # Hindi/Marathi
            elif any('\u0C80' <= char <= '\u0CFF' for char in user_input):
                detected_lang = 'kn'  # Kannada
            else:
                detected_lang = 'en'
        else:
            detected_lang = language

        # Generate response using GPT
        system_prompt = """You are Krishi Sathi, a helpful agricultural assistant for farmers in India specializing in seeds and crops information.
        Provide accurate information about various crops, planting seasons, care instructions, yield expectations, and agricultural best practices.
        Include crop types (cereals, pulses, vegetables, fruits, oilseeds, fiber), seasonal information (kharif, rabi, zaid), planting and harvesting times, soil requirements, water needs, and care instructions.
        Respond in the same language as the user's query. Be concise but informative, and provide practical farming advice."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=300,
            temperature=0.7
        )

        ai_response = response.choices[0].message.content.strip()

        # Generate speech from response
        voice_map = {
            'en': 'alloy',
            'hi': 'alloy',
            'mr': 'alloy',
            'kn': 'alloy'
        }

        speech_response = client.audio.speech.create(
            model="tts-1",
            input=ai_response,
            voice=voice_map.get(detected_lang, 'alloy')
        )

        # Save speech to temporary file
        speech_file_path = temp_file_path.replace('.wav', '_speech.mp3')
        speech_response.stream_to_file(speech_file_path)

        # Clean up temp audio file
        os.unlink(temp_file_path)

        return jsonify({
            'success': True,
            'transcription': user_input,
            'response': ai_response,
            'language': detected_lang,
            'audio_url': f'/api/voice/audio/{os.path.basename(speech_file_path)}'
        })

    except Exception as e:
        print(f"Error processing voice: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/voice/audio/<filename>')
def get_voice_audio(filename):
    """Serve generated voice audio files"""
    try:
        audio_path = os.path.join(tempfile.gettempdir(), filename)
        if os.path.exists(audio_path):
            return send_from_directory(tempfile.gettempdir(), filename, as_attachment=True)
        else:
            return jsonify({'error': 'Audio file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/frontend/<path:filename>')
def serve_frontend(filename):
    """Serve frontend files - HTML as templates, others as static files"""
    if filename.endswith('.html'):
        return render_template(filename)
    elif filename.startswith('data/'):
        # Handle data files in the data subdirectory
        data_filename = filename[5:]  # Remove 'data/' prefix
        return send_from_directory('data', data_filename)
    else:
        # For JS, CSS files in assets, serve as static files
        return send_from_directory('database/frontend', filename)



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
