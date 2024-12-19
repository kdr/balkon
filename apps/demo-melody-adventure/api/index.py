import os
import uuid
import tempfile
import subprocess

from flask import Flask, request, jsonify, send_from_directory
import json
import time

from .utils import save_midi_file, MIDI_FOLDER, midi_to_notes, save_melody_to_midi

from . import bach
from . import hindustani
from . import carnatic
from . import cumbia
from . import turkish
from . import mozart

from werkzeug.serving import WSGIRequestHandler

MAX_LENGTH = 100
MAX_BARS = 2
QUARTER_NOTE_PER_BAR = 4

WSGIRequestHandler.protocol_version = "HTTP/1.1"
app = Flask(__name__)
app.config['TIMEOUT'] = 300

MELODY_GENERATOR_MAP = {
    #'bach': bach.generate_melody,
    'indian': hindustani.generate_melody,
    'classical': bach.generate_melody,
    'carnatic': carnatic.generate_melody,
    'cumbia': cumbia.generate_melody,
    'turkish': turkish.generate_melody,
    'mozart': mozart.generate_melody,
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
    elif requested_variation in ['turkish', 'indian', 'classical', 'carnatic', 'cumbia', 'mozart']:
        current_notes, new_notes = MELODY_GENERATOR_MAP[requested_variation](current_notes, length=MAX_LENGTH, max_bars=MAX_BARS, quarter_note_per_bar=QUARTER_NOTE_PER_BAR)
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

    # for json serialization
    current_notes = [(n[0], float(n[1])) for n in current_notes]
    new_notes = [(n[0], float(n[1])) for n in new_notes]
    
    print(current_notes)
    print(len(current_notes), len(new_notes))
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

# Define constants for paths
MODEL_PATH = "/home/kdr_aviaryhq_com/data/music_transformer/melody_conditioned_model_16.ckpt"
OUTPUT_BASE_PATH = "/home/kdr_aviaryhq_com/github/balkon/apps/demo-melody-adventure/api/midi_files"

@app.route("/api/generate_accompaniment", methods=['POST'])
def generate_accompaniment():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        midi_uri = data.get('midi_uri')
        if not midi_uri:
            return jsonify({'error': 'No MIDI URI provided'}), 400

        # Construct the full path to the MIDI file
        melody_path = os.path.join(OUTPUT_BASE_PATH, os.path.basename(midi_uri))
        if not os.path.exists(melody_path):
            return jsonify({"error": "MIDI file not found."}), 404

        # Create a temporary directory for the output
        with tempfile.TemporaryDirectory() as tmp_output_dir:
            # Build the command to execute the melody generation program
            command = [
                "conda", "run", "-n", "magenta", "python", "/home/kdr_aviaryhq_com/github/piano_transformer/melody_sample.py",
                f"-model_path={MODEL_PATH}",
                f"-output_dir={tmp_output_dir}",
                "-decode_length=1024",
                f"-melody_path={melody_path}",
                "-num_samples=1"
            ]

            # Execute the program and wait for completion
            try:
                subprocess.run(command, check=True)
            except subprocess.CalledProcessError as e:
                return jsonify({"error": f"Failed to generate accompaniment: {str(e)}"}), 500

            # Find the generated MIDI file in the output directory
            generated_midi_file = None
            for file_name in os.listdir(tmp_output_dir):
                if file_name.endswith(".mid"):
                    generated_midi_file = os.path.join(tmp_output_dir, file_name)
                    break

            if not generated_midi_file:
                return jsonify({"error": "No accompaniment MIDI file generated."}), 500

            # Generate a unique ID and move the generated MIDI file to the final location
            midi_id = str(uuid.uuid4())
            final_midi_path = os.path.join(OUTPUT_BASE_PATH, f"{midi_id}.mid")
            os.rename(generated_midi_file, final_midi_path)

            # Return the MIDI file URL
            midi_url = f"/midi/{midi_id}.mid"
            return jsonify({
                "success": True,
                "midi_uri": midi_url
            })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
