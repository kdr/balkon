from flask import Flask, request, jsonify, send_from_directory
import json
import time

from .utils import save_midi_file, MIDI_FOLDER, midi_to_notes, save_melody_to_midi

from . import bach
from . import hindustani
from . import carnatic
from . import cumbia
from . import turkish

MAX_LENGTH = 32
MAX_BARS = 2
QUARTER_NOTE_PER_BAR = 4

app = Flask(__name__)

MELODY_GENERATOR_MAP = {
    #'bach': bach.generate_melody,
    'indian': hindustani.generate_melody,
    'classical': bach.generate_melody,
    'carnatic': carnatic.generate_melody,
    'cumbia': cumbia.generate_melody,
    'turkish': turkish.generate_melody,
}

# Add route to serve MIDI files
@app.route("/midi/<filename>")
def serve_midi(filename):
    return send_from_directory(MIDI_FOLDER, filename)

@app.route("/api/update_melody", methods=['POST'])
def update_melody():
    # Check if this is an upload variation request
    if request.form and 'requested_variation' in request.form:
        # Handle multipart form data (file upload)
        requested_variation = request.form.get('requested_variation')

        if requested_variation != 'upload-phrase':
            return jsonify({'error': 'Invalid request'}), 400

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        midi_file = request.files['file']
        if not midi_file:
            return jsonify({'error': 'No file provided'}), 400

        _, file_path = save_midi_file(midi_file)
        
        # Initial notes for all three note arrays
        new_notes = midi_to_notes(file_path)

        # Get other data from form
        seed_notes = json.loads(request.form.get('seed_notes', '[]'))
        current_notes = json.loads(request.form.get('current_notes', '[]'))
        variation_history = json.loads(request.form.get('variation_history', '[]'))
        is_makam_notes = json.loads(request.form.get('is_makam_notes', '[]'))

        current_melody = list(current_notes) + list(new_notes)
        is_makam_notes = is_makam_notes + list([False] * len(new_notes))
        
        midi_uri, _ = save_melody_to_midi(current_melody, is_makam_notes)

        return jsonify({
            'seed_notes': seed_notes,
            'current_notes': current_melody,
            'recent_notes': new_notes,
            'midi_uri': midi_uri,
            'is_makam_notes': is_makam_notes,
            'variation_history': variation_history + [requested_variation]
        })
    
    # Handle regular JSON requests
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    seed_notes = data.get('seed_notes', [])
    current_notes = data.get('current_notes', [])
    recent_notes = data.get('recent_notes', [])
    variation_history = data.get('variation_history', [])
    requested_variation = data.get('requested_variation', '')
    is_makam_notes = data.get('is_makam_notes', [])
    
    new_notes = []

    if requested_variation == 'repeat-previous':
        new_notes = [n for n in recent_notes]
        current_notes = list(current_notes) + list(new_notes)   
    elif requested_variation in ['turkish', 'indian', 'classical', 'carnatic', 'cumbia']:
        current_notes, new_notes = MELODY_GENERATOR_MAP[requested_variation](current_notes, length=MAX_LENGTH, max_bars=MAX_BARS)
    elif requested_variation == 'repeat-seed':
        new_notes = [n for n in seed_notes]
        current_notes = list(current_notes) + list(new_notes)   
    else:
        return jsonify({'error': 'Invalid variation'}), 400

    if requested_variation == 'turkish':
        is_makam_notes = is_makam_notes + list([True] * len(new_notes))
    else:
        is_makam_notes = is_makam_notes + list([False] * len(new_notes))
    
    #print(current_notes)
    midi_uri, _ = save_melody_to_midi(current_notes, is_makam_notes)
    
    response = {
        'seed_notes': seed_notes,
        'current_notes': current_notes,
        'recent_notes': new_notes,
        'midi_uri': midi_uri,
        'is_makam_notes': is_makam_notes,
        'variation_history': variation_history
    }
    #print(json.dumps(response, indent=2))
    return jsonify(response)

@app.route("/api/get_seed_notes", methods=['POST'])
def get_seed_notes():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    midi_file = request.files['file']
    midi_uri, file_path = save_midi_file(midi_file)
    
    # Initial notes for all three note arrays
    initial_notes = midi_to_notes(file_path)

    initial_notes = [(n[0], float(n[1])) for n in initial_notes]
    is_makam_notes = [False] * len(initial_notes)
    
    # Mock response with initial data
    return jsonify({
        'seed_notes': initial_notes,
        'current_notes': initial_notes,
        'recent_notes': initial_notes,
        'midi_uri': midi_uri,
        'is_makam_notes': is_makam_notes,
        'variation_history': ['seed']
    })

@app.route("/api/generate_accompaniment", methods=['POST'])
def generate_accompaniment():
    try:
        # Simulate processing time
        time.sleep(5)
        
        # Mock response - in a real implementation, this would be where you generate
        # the accompaniment and return the actual file URL
        mock_file_url = "/midi/accompaniment.mid"
        
        return jsonify({
            "success": True,
            "midi_uri": mock_file_url
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500