from .simplemelodygen.extensions import MultiInstanceTrainableMarkovChainMelodyGenerator

from .trainingdata import corpus_to_training_data

def get_generator_data():
    bach_data, bach_states = corpus_to_training_data('mozart')
    return bach_data, bach_states

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
            _, new_notes  = MODEL.generate(length, max_bars=max_bars, quarter_note_per_bar=quarter_note_per_bar)
            melody = notes + new_notes
    else:
        melody, new_notes = MODEL.generate(length, max_bars=max_bars, quarter_note_per_bar=quarter_note_per_bar)
    print(melody)

    return melody, new_notes
