# Add extensions specific to melody generation

from .markovchain import MarkovChainMelodyGenerator

from .bars import enforce_bars
class MultiInstanceTrainableMarkovChainMelodyGenerator(MarkovChainMelodyGenerator):
    """
    Represents a Markov Chain model for melody generation that is trainable with multiple sequence/example instances

    Also allows for rests
    """

    def _calculate_transition_matrix(self, examples):
        """
        Calculate the transition matrix from the provided notes.

        Parameters:
            notes (list): A list of music21.note.Note objects.
        """
        for notes in examples:
            for i in range(len(notes) - 1):
                self._increment_transition_count(notes[i], notes[i + 1])
        self._normalize_transition_matrix()

    def _note_to_state(self, note):    
        if note.isRest:
            state = ('Rest', note.duration.quarterLength)
        else:
            state = (note.pitch.nameWithOctave, note.duration.quarterLength)
        return state
    
    def _increment_initial_probability_count(self, note):
        """
        Increment the probability count for a given note.

        Parameters:
            note (music21.note.Note): A note object.
        """
        state = self._note_to_state(note)
        self.initial_probabilities[self._state_indexes[state]] += 1

    def _increment_transition_count(self, current_note, next_note):
        """
        Increment the transition count from current_note to next_note.

        Parameters:
            current_note (music21.note.Note): The current note object.
            next_note (music21.note.Note): The next note object.
        """
        state = self._note_to_state(current_note)        
        next_state = self._note_to_state(next_note)            
        self.transition_matrix[
            self._state_indexes[state], self._state_indexes[next_state]
        ] += 1
        
    def train(self, examples):
        """
        Train the model based on a list of notes.

        Parameters:
            examples (list): A list of <list of music21.note.Note objects>, each representing an example phrase/song
        """
        notes = [x for xs in examples for x in xs] #flatten list of list to single list of notes
        self._calculate_initial_probabilities(notes)
        self._calculate_transition_matrix(examples)

    def generate(self, length, previous_sequence=[], max_bars=10, quarter_note_per_bar=4):
        """
        Generate a melody of a given length.

        Parameters:
            length (int): The length of the sequence to generate.
            previous_sequence (list of tuples): previous melody to continue from, if not specified will start from random stae

        Returns:
            full_melody (list of tuples): A list of generated states append to end of previous_sequence 
            melody (list of tuples): A list of generated states, only containing generated new pice of melody
        """
        print('>>>>>>>> length', length)
        print('>>>>>>>> previous_sequence', previous_sequence)

        previous_sequence = [tuple(x) for x in previous_sequence]
        if len(previous_sequence) == 0:
            full_melody = [self._generate_starting_state()]
        else:
            full_melody = [s for s in previous_sequence]
        for _ in range(1, length):
            full_melody.append(self._generate_next_state(full_melody[-1]))
        
        previous, new = full_melody[:len(previous_sequence)], full_melody[len(previous_sequence):]
        new = enforce_bars(new, max_bars, quarter_note_per_bar)
        return previous + new, new