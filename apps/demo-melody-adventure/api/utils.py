import os
import uuid
from music21 import note, stream, converter, midi

from .turkish import makam_note_remap

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
    return f"/midi/{filename}", file_path

def midi_to_melody_note_sequence(midi_path):
    # Load the score
    s = converter.parse(midi_path)

    # Whatever defaulting path for voice to pick otherwise part 0
    soprano_part = None
    for part in s.parts:
        if "Soprano" in (part.partName or ""):  # Check for 'Soprano' in the part name
            soprano_part = part
            break
    
    # Fallback if no explicit Soprano part is named
    if soprano_part is None:
        # Assume the first part is the Soprano if no explicit naming is found
        soprano_part = s.parts[0]
    
    # Extract notes and rests (pitch and duration)
    notes_sequence = []
    for element in soprano_part.flat.notesAndRests:  # Include notes and rests
        if element.isNote:
            notes_sequence.append((element.pitch.nameWithOctave, element.quarterLength))
        elif element.isChord:        
            # If there's a chord, take the highest note (melodic line usually uses the top note)
            #notes_sequence.append((element.highestNote.nameWithOctave, element.quarterLength))

            # Get the bass (lowest) note of the chord
            bass_note = element.bass()
            notes_sequence.append((bass_note.nameWithOctave, element.quarterLength))
        elif element.isRest:
            notes_sequence.append(('Rest', element.quarterLength))

    notes = []
    for pitch, duration in notes_sequence:    
        s = (pitch, duration)
        if pitch == 'Rest':
            notes.append(note.Rest(quarterLength=s[1]))
        else:
            notes.append(note.Note(s[0], quarterLength=s[1]))        
    return notes

def note_to_state(note):    
    if note.isRest:
        state = ('Rest', note.duration.quarterLength)
    else:
        state = (note.pitch.nameWithOctave, note.duration.quarterLength)
    return state

def midi_to_notes(midi_path):
    noteSequence = midi_to_melody_note_sequence(midi_path)
    return [note_to_state(note) for note in noteSequence]

def melody_to_score(melody, is_makam_notes=None):
    score = stream.Score()
    part = stream.Part()
    #print(melody)
    i = 0
    for n, d in melody:
        if n == 'Rest':
            part.append(note.Rest(quarterLength=d))    
        else:
            if is_makam_notes is not None and is_makam_notes[i]:
                part.append(makam_note_remap(n, d))
            else: 
                part.append(note.Note(n, quarterLength=d))    
        i += 1
    
    score.append(part)

    return score

def save_melody_to_midi(melody, is_makam_notes=None):
    s = melody_to_score(melody, is_makam_notes)
    mf = midi.translate.music21ObjectToMidiFile(s)
    filename = f"{str(uuid.uuid4())}.mid"
    file_path = os.path.join(MIDI_FOLDER, filename)
    mf.open(file_path, 'wb')
    mf.write()
    mf.close()

    return f"/midi/{filename}", file_path