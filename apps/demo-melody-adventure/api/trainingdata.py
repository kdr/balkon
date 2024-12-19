from tqdm import tqdm
from music21 import corpus, note

def corpus_to_training_data(composer):
    paths = corpus.getComposer(composer)

    all_states = set()
    all_pitches = set()
    all_durations = set()
    training_data = []
    chord_occurence_count = 0
    note_count = 0
    for p in tqdm(paths):
        # Load the score
        s = corpus.parse(p)
        
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
    
                chord_occurence_count += 1
            elif element.isRest:
                notes_sequence.append(('Rest', element.quarterLength))
    
        notes = []
        for pitch, duration in notes_sequence:    
            all_pitches.add(pitch)
            all_durations.add(duration)
            s = (pitch, duration)
            if pitch == 'Rest':
                notes.append(note.Rest(quarterLength=s[1]))
                #ignore rests for now
                #pass
            else:
                notes.append(note.Note(s[0], quarterLength=s[1]))        
            all_states.add(s)    
        training_data.append(notes)
        note_count += len(notes)

    #print(f'note_count: {note_count}\nskipped_chord_occurence_count: {chord_occurence_count}\ntraining_data_examples: {len(training_data)}\nall_states: {len(all_states)}, all_pitches: {len(all_pitches)}')        
    return training_data, list(all_states)