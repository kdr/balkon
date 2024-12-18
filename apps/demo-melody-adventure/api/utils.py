import os
import uuid

# Create a directory for MIDI files if it doesn't exist
MIDI_FOLDER = os.path.join(os.path.dirname(__file__), 'midi_files')
os.makedirs(MIDI_FOLDER, exist_ok=True)

def save_midi_file(file):
    """
    Saves a file from a Flask request with a UUID-based filename and returns the serving URL.
    
    Args:
        file: FileStorage object from Flask request.files
        
    Returns:
        str: URL path to access the saved file (e.g., '/midi/123e4567-e89b-12d3-a456-426614174000.mid')
    """
    # Generate unique filename with uuid4
    filename = f"{str(uuid.uuid4())}.mid"
    
    # Save the file
    file_path = os.path.join(MIDI_FOLDER, filename)
    file.save(file_path)
    
    # Return the URL path that can be used to serve the file
    return f"/midi/{filename}"
