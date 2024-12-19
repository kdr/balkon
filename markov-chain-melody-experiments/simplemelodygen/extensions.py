# Add extensions specific to melody generation

from .markovchain import MarkovChainMelodyGenerator

class MultiInstanceTrainableMarkovChainMelodyGenerator(MarkovChainMelodyGenerator):
    """
    Represents a Markov Chain model for melody generation with multiple sequences and higher-order transitions.
    """

    def train(self, examples):
        """
        Train the model based on a list of notes.

        Parameters:
            examples (list): A list of <list of music21.note.Note objects>, each representing an example phrase/song.
        """
        notes = [x for xs in examples for x in xs]  # Flatten the list of lists
        self._calculate_initial_probabilities(notes)
        self._calculate_transition_matrix(examples)

    def generate(self, length, previous_sequence=[]):
        """
        Generate a melody of a given length, optionally continuing from a previous sequence.

        Parameters:
            length (int): The length of the sequence to generate.
            previous_sequence (list): The previous melody to continue from.

        Returns:
            full_melody (list of tuples): The entire generated melody including the previous sequence.
            melody (list of tuples): The newly generated portion of the melody.
        """
        if len(previous_sequence) == 0:
            full_melody = [self._generate_starting_state()]
        else:
            full_melody = [s for s in previous_sequence]

        for _ in range(1, length):
            full_melody.append(self._generate_next_state(full_melody[-self.order:]))

        return full_melody, full_melody[len(previous_sequence):]
