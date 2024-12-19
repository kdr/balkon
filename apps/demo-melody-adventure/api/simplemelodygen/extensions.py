# Add extensions specific to melody generation

from .markovchain import MarkovChainMelodyGenerator

from .bars import enforce_bars
class MultiInstanceTrainableMarkovChainMelodyGenerator(MarkovChainMelodyGenerator):
    """
    Represents a Markov Chain model for melody generation that is trainable with multiple sequence/example instances

    Also allows for rests
    """

    def __init__(self, states, order=5):
        """Initialize with order parameter"""
        super().__init__(states, order)

    def _calculate_transition_matrix(self, examples):
        """Updated to handle multiple examples"""
        for notes in examples:
            for i in range(len(notes) - self.order):
                self._increment_transition_count(notes[i:i + self.order], notes[i + self.order])
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

    def _increment_transition_count(self, current_state, next_note):
        """
        Increment the transition count from current_state to next_note.

        Parameters:
            current_state (list): The sequence of notes representing the current state.
            next_note (music21.note.Note): The next note object.
        """
        # Convert each note in the sequence to a state
        state = tuple(self._note_to_state(note) for note in current_state)
        next_state = self._note_to_state(next_note)
        
        # Check if the state exists in our state_indexes
        if state in self._state_indexes and next_state in self._state_indexes:
            self.transition_matrix[
                self._state_indexes[state], self._state_indexes[next_state]
            ] += 1

    def _generate_next_state(self, current_states):
        """
        Generate the next state based on the transition matrix and the current states.

        Parameters:
            current_states (list): The current states in the Markov Chain.

        Returns:
            The next state in the Markov Chain.
        """
        state = tuple(current_states)
        if state in self._state_indexes and self._does_state_have_subsequent(state):
            index = np.random.choice(
                list(self._state_indexes.values()),
                p=self.transition_matrix[self._state_indexes[state]]
            )
            return self.states[index]
        return self._generate_starting_state()

    def _does_state_have_subsequent(self, state):
        """
        Check if a given state has a subsequent state in the transition matrix.

        Parameters:
            state: The state to check.

        Returns:
            True if the state has a subsequent state, False otherwise.
        """
        return (state in self._state_indexes and 
                self.transition_matrix[self._state_indexes[state]].sum() > 0)

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
        """Updated to handle previous sequence with order"""
        previous_sequence = [tuple(x) for x in previous_sequence]
        if len(previous_sequence) == 0:
            full_melody = [self._generate_starting_state()]
        else:
            full_melody = [s for s in previous_sequence]
            
        for _ in range(1, length):
            # Use last 'order' states or all available if less than order
            prev_states = full_melody[-min(self.order, len(full_melody)):]
            full_melody.append(self._generate_next_state(prev_states))
        
        previous, new = full_melody[:len(previous_sequence)], full_melody[len(previous_sequence):]
        new = enforce_bars(new, max_bars, quarter_note_per_bar)
        return previous + new, new