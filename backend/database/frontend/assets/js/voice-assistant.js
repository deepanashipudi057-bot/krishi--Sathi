=======
// Voice Assistant with LiveKit Integration
const BACKEND_URL = window.location.origin;
let currentLanguage = 'en';
let livekitRoom = null;
let localParticipant = null;
let remoteParticipant = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// Initialize voice assistant
document.addEventListener('DOMContentLoaded', function() {
    initializeVoiceAssistant();
    setupLanguageSwitcher();
});

// Setup language switcher for voice
function setupLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            currentLanguage = this.value;
            updateVoiceLanguageIndicator();
        });
    }
}

// Update voice language indicator
function updateVoiceLanguageIndicator() {
    const indicator = document.getElementById('languageIndicator');
    const languages = {
        'en': 'English',
        'hi': 'हिन्दी',
        'mr': 'मराठी',
        'kn': 'ಕನ್ನಡ'
    };
    if (indicator) {
        indicator.textContent = `Language: ${languages[currentLanguage] || 'English'}`;
    }
}

// Initialize voice assistant
async function initializeVoiceAssistant() {
    const voiceButton = document.getElementById('voiceButton');
    const voiceStatus = document.getElementById('voiceStatus');

    if (voiceButton) {
        voiceButton.addEventListener('click', toggleVoiceRecording);
    }

    updateVoiceLanguageIndicator();

    try {
        // Initialize LiveKit connection
        await initializeLiveKit();
        if (voiceStatus) {
            voiceStatus.textContent = 'Voice assistant connected to LiveKit';
            voiceStatus.style.color = '#4CAF50';
        }
    } catch (error) {
        console.error('Failed to initialize LiveKit:', error);
        if (voiceStatus) {
            voiceStatus.textContent = 'Voice assistant initialization failed';
            voiceStatus.style.color = '#f44336';
        }
    }
}

// Initialize LiveKit connection
async function initializeLiveKit() {
    try {
        // Get LiveKit token from backend
        const tokenResponse = await fetch(`${BACKEND_URL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_name: 'krishi-sathi-voice-room',
                participant_name: 'farmer-user'
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to get LiveKit token');
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.token;
        const url = tokenData.url;

        // Connect to LiveKit room
        const { Room } = await import('https://cdn.jsdelivr.net/npm/livekit-client@1.15.0/dist/livekit-client.esm.min.js');

        livekitRoom = new Room();
        livekitRoom.on('participantConnected', handleParticipantConnected);
        livekitRoom.on('participantDisconnected', handleParticipantDisconnected);
        livekitRoom.on('trackSubscribed', handleTrackSubscribed);

        await livekitRoom.connect(url, token);
        localParticipant = livekitRoom.localParticipant;

        console.log('Connected to LiveKit room');

    } catch (error) {
        console.error('LiveKit initialization error:', error);
        throw error;
    }
}

// Handle participant connections
function handleParticipantConnected(participant) {
    console.log('Participant connected:', participant.identity);
    remoteParticipant = participant;
}

function handleParticipantDisconnected(participant) {
    console.log('Participant disconnected:', participant.identity);
    remoteParticipant = null;
}

function handleTrackSubscribed(track, publication, participant) {
    if (track.kind === 'audio') {
        const audioElement = track.attach();
        document.body.appendChild(audioElement);
        audioElement.play();
    }
}

// Toggle voice recording
async function toggleVoiceRecording() {
    const voiceButton = document.getElementById('voiceButton');
    const voiceStatus = document.getElementById('voiceStatus');

    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

// Start voice recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await processVoiceInput(audioBlob);
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;

        const voiceButton = document.getElementById('voiceButton');
        const voiceStatus = document.getElementById('voiceStatus');

        if (voiceButton) {
            voiceButton.classList.add('recording');
            voiceButton.innerHTML = '<span class="pulse"></span><span class="mic-icon">🎤</span><span>Listening...</span>';
        }
        if (voiceStatus) {
            voiceStatus.textContent = 'Listening... Speak now';
        }

    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not access microphone. Please check permissions.');
    }
}

// Stop voice recording
function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;

        const voiceButton = document.getElementById('voiceButton');
        const voiceStatus = document.getElementById('voiceStatus');

        if (voiceButton) {
            voiceButton.classList.remove('recording');
            voiceButton.innerHTML = '<span class="pulse"></span><span class="mic-icon">🎤</span><span>Ask about Seeds & Crops</span>';
        }
        if (voiceStatus) {
            voiceStatus.textContent = 'Processing your request...';
        }
    }
}

// Process voice input
async function processVoiceInput(audioBlob) {
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceTextOutput = document.getElementById('voiceTextOutput');

    try {
        if (voiceStatus) voiceStatus.textContent = 'Processing voice...';

        // Create form data for audio upload
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('language', currentLanguage);

        // Send to backend for processing
        const response = await fetch(`${BACKEND_URL}/api/voice/process`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Display transcription
            if (voiceTextOutput) {
                voiceTextOutput.textContent = `You said: "${result.transcription}"\nResponse: "${result.response}"`;
                voiceTextOutput.style.display = 'block';
            }

            // Play audio response if available
            if (result.audio_url) {
                playAudioResponse(result.audio_url);
            }

            if (voiceStatus) {
                voiceStatus.textContent = 'Voice assistant ready';
            }
        } else {
            throw new Error(result.error || 'Voice processing failed');
        }

    } catch (error) {
        console.error('Voice processing error:', error);
        if (voiceStatus) {
            voiceStatus.textContent = 'Error processing voice. Try again.';
            voiceStatus.style.color = '#f44336';
        }
        if (voiceTextOutput) {
            voiceTextOutput.textContent = `Error: ${error.message}`;
            voiceTextOutput.style.display = 'block';
        }
    }
}

// Play audio response
function playAudioResponse(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Error playing audio response:', error);
    });
}

// Publish audio to LiveKit room (for real-time voice)
async function publishAudioToLiveKit(audioBlob) {
    if (!livekitRoom || !localParticipant) return;

    try {
        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);

        // Create audio track and publish
        const audioTrack = await createAudioTrackFromBuffer(audioBuffer);
        await localParticipant.publishTrack(audioTrack);

    } catch (error) {
        console.error('Error publishing audio to LiveKit:', error);
    }
}

// Create audio track from audio buffer (placeholder - would need WebRTC implementation)
function createAudioTrackFromBuffer(audioBuffer) {
    // This is a simplified placeholder. In a real implementation,
    // you would need to create a proper MediaStreamTrack from the audio buffer
    return null;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (livekitRoom) {
        livekitRoom.disconnect();
    }
});
