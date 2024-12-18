from flask import Flask, request, jsonify, send_from_directory
import os
import json
app = Flask(__name__)

# Create a directory for MIDI files if it doesn't exist
MIDI_FOLDER = os.path.join(os.path.dirname(__file__), 'midi_files')
os.makedirs(MIDI_FOLDER, exist_ok=True)

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
        
        if requested_variation == 'upload':
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
                
            midi_file = request.files['file']
            if not midi_file:
                return jsonify({'error': 'No file provided'}), 400

            # Get other data from form
            seed_notes = json.loads(request.form.get('seed_notes', '[]'))
            current_notes = json.loads(request.form.get('current_notes', '[]'))
            variation_history = json.loads(request.form.get('variation_history', '[]'))
            
            # Mock response with uploaded file
            # You can save the file here if needed
            # midi_file.save(os.path.join(MIDI_FOLDER, 'uploaded.mid'))
            
            return jsonify({
                'seed_notes': seed_notes,
                'current_notes': current_notes + [["C5", 2.0], ["A5", 0.5]],
                'midi_uri': '/midi/example1.mid',
                'variation_history': variation_history + [requested_variation]
            })
    
    # Handle regular JSON requests for other variations
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    # Extract input data
    seed_notes = data.get('seed_notes', [])
    current_notes = data.get('current_notes', [])
    variation_history = data.get('variation_history', [])
    requested_variation = data.get('requested_variation', '')
    
    # Mock update to current_notes (append some new notes)
    new_current_notes = current_notes + [["C5", 2.0], ["A5", 0.5]]
    
    # Update variation history
    new_variation_history = variation_history + [requested_variation]
    
    # Mock response with updated data
    response = {
        'seed_notes': seed_notes,
        'current_notes': new_current_notes,
        'midi_uri': '/midi/example1.mid',
        'variation_history': new_variation_history
    }
    return jsonify(response)

@app.route("/api/get_seed_notes", methods=['POST'])
def get_seed_notes():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    midi_file = request.files['file']
    
    # Mock response with initial data
    return jsonify({
        'seed_notes': [
            ['A5', 1.0],
            ['G#5', 0.25],
            ['C5', 0.5]
        ],
        'current_notes': [  # Add initial current_notes
            ['A5', 1.0],
            ['G#5', 0.25],
            ['C5', 0.5]
        ],
        'midi_uri': '/midi/twinkle.mid',
        'variation_history': ['seed']  # Add initial variation history
    })