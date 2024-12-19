import os
import music21 as m21

from .simplemelodygen.extensions import MultiInstanceTrainableMarkovChainMelodyGenerator

def get_generator_data():
    midi = m21.converter.parse(os.path.join(os.path.dirname(__file__), 'kanada.mid'))
    notes = []
    for element in midi.flat:
        if isinstance(element, m21.note.Note):
            duration = round(element.quarterLength * 4) / 4
            notes.append([str(element.pitch), duration])
    states = set()
    for i in range(len(notes)):
        note = (notes[i][0], notes[i][1])
        states.add(note)
    training_data = []
    for i in range(len(notes)):
        training_data.append(m21.note.Note(notes[i][0], quarterLength=notes[i][1]))
    return [training_data], list(states)

TRAINING_DATA, STATES = get_generator_data()
MODEL = MultiInstanceTrainableMarkovChainMelodyGenerator(list(STATES))
MODEL.train(TRAINING_DATA)

def generate_melody(notes, length=15, max_bars=10, quarter_note_per_bar=4):
    print(notes)
    melody = []
    new_notes = []
    if len(notes) > 0:
        try:
            melody, new_notes = MODEL.generate(length, previous_sequence=notes, max_bars=max_bars, quarter_note_per_bar=quarter_note_per_bar)
        except Exception as e:
            print(">>>>>>> Error generating melody", e)
            _, new_notes  = MODEL.generate(length)
            melody = notes + new_notes
    else:
        melody, new_notes = MODEL.generate(length)
    print(melody)

    return melody, new_notes
    