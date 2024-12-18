from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/get_seed_notes", methods=['POST'])
def get_seed_notes():
    # Mock response for now - you'll implement actual MIDI parsing later
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    midi_file = request.files['file']
    
    # Mock response with placeholder data
    return jsonify({
        'seed_notes': [
            ['A5', 1.0],
            ['G#5', 0.25],
            ['C5', 0.5]
        ],
        'midi_uri': 'https://storage.googleapis.com/aviary-labs-media-public/example1.mid'
        #'midi_uri': 'https://storage.googleapis.com/aviary-labs-media-public/Never-Gonna-Give-You-Up-3.mid'
    })