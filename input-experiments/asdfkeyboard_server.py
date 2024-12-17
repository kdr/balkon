from flask import Flask, request, jsonify, render_template
import sounddevice as sd
import numpy as np

app = Flask(__name__)

# Map keys to frequencies (notes)
key_to_freq = {
    'a': 261.63,  # C4
    'w': 277.18,  # C#4
    's': 293.66,  # D4
    'e': 311.13,  # D#4
    'd': 329.63,  # E4
    'f': 349.23,  # F4
    't': 369.99,  # F#4
    'g': 392.00,  # G4
    'y': 415.30,  # G#4
    'h': 440.00,  # A4
    'u': 466.16,  # A#4
    'j': 493.88,  # B4
    'k': 523.25   # C5
}

def generate_sine_wave(frequency, duration, sample_rate=44100):
    """
    Generate a sine wave for the given frequency and duration.
    """
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    wave = 0.5 * np.sin(2 * np.pi * frequency * t)  # Adjust volume
    return wave

def play_tone(frequency, duration=0.5, sample_rate=44100):
    """
    Play a sine wave tone for the given frequency and duration.
    """
    if frequency == 0.0:  # Rest
        sd.sleep(int(duration * 1000))  # Convert duration to milliseconds
    else:
        wave = generate_sine_wave(frequency, duration, sample_rate)
        sd.play(wave, samplerate=sample_rate)
        sd.wait()  # Wait for playback to finish

@app.route('/')
def index():
    """
    Serve the HTML page for keyboard input.
    """
    return render_template('asdfkeyboard.html')

@app.route('/play', methods=['POST'])
def play():
    """
    API endpoint to handle keypress events and play sounds.
    """
    key = request.json.get('key')
    if key in key_to_freq:
        frequency = key_to_freq[key]
        play_tone(frequency)
        return jsonify({'message': f'Played {key}'})
    return jsonify({'message': 'Invalid key'}), 400

if __name__ == '__main__':
    app.run(debug=True, threaded=False)
