"""
From: https://github.com/musikalkemist/generativemusicaicourse/blob/main/12.%20Melody%20generation%20with%20Markov%20chains/Code/markovchain.py
"""
import numpy as np
from music21 import metadata, note, stream


class MarkovChainMelodyGenerator:
    """
    Represents a Markov Chain model for melody generation with a customizable order.
    """

    def __init__(self, states, order=5):
        """
        Initialize the MarkovChain with a list of states and a given order.

        Parameters:
            states (list of tuples): A list of possible (pitch, duration)
                pairs.
            order (int): The order of the Markov chain (1 for first-order, 2 for second-order, etc.).
        """
        self.states = states
        self.order = order
        self.initial_probabilities = np.zeros(len(states))
        self.transition_matrix = np.zeros((len(states), len(states)))
        self._state_indexes = {state: i for (i, state) in enumerate(states)}

    def train(self, notes):
        """
        Train the model based on a list of notes.

        Parameters:
            notes (list): A list of music21.note.Note objects.
        """
        self._calculate_initial_probabilities(notes)
        self._calculate_transition_matrix(notes)

    def generate(self, length):
        """
        Generate a melody of a given length.

        Parameters:
            length (int): The length of the sequence to generate.

        Returns:
            melody (list of tuples): A list of generated states.
        """
        melody = [self._generate_starting_state()]
        for _ in range(1, length):
            melody.append(self._generate_next_state(melody[-self.order:]))
        return melody

    def _calculate_initial_probabilities(self, notes):
        """
        Calculate the initial probabilities from the provided notes.

        Parameters:
            notes (list): A list of music21.note.Note objects.
        """
        for note in notes:
            self._increment_initial_probability_count(note)
        self._normalize_initial_probabilities()

    def _increment_initial_probability_count(self, note):
        """
        Increment the probability count for a given note.

        Parameters:
            note (music21.note.Note): A note object.
        """
        state = self._note_to_state(note)
        self.initial_probabilities[self._state_indexes[state]] += 1

    def _normalize_initial_probabilities(self):
        """
        Normalize the initial probabilities array such that the sum of all
        probabilities equals 1.
        """
        total = np.sum(self.initial_probabilities)
        if total:
            self.initial_probabilities /= total
        self.initial_probabilities = np.nan_to_num(self.initial_probabilities)

    def _calculate_transition_matrix(self, notes):
        """
        Calculate the transition matrix from the provided notes.

        Parameters:
            notes (list): A list of music21.note.Note objects.
        """
        for i in range(len(notes) - self.order):
            self._increment_transition_count(notes[i:i + self.order], notes[i + self.order])
        self._normalize_transition_matrix()

    def _increment_transition_count(self, current_state, next_note):
        """
        Increment the transition count from current_state to next_note.

        Parameters:
            current_state (list): The sequence of notes representing the current state.
            next_note (music21.note.Note): The next note object.
        """
        state = tuple(current_state)
        next_state = self._note_to_state(next_note)
        self.transition_matrix[self._state_indexes[state], self._state_indexes[next_state]] += 1

    def _normalize_transition_matrix(self):
        """
        Normalize the transition matrix so that each row sums to 1.
        """
        row_sums = self.transition_matrix.sum(axis=1)
        with np.errstate(divide="ignore", invalid="ignore"):
            self.transition_matrix = np.where(
                row_sums[:, None],
                self.transition_matrix / row_sums[:, None],
                0,
            )

    def _generate_starting_state(self):
        """
        Generate a starting state based on the initial probabilities.

        Returns:
            A state from the list of states.
        """
        initial_index = np.random.choice(list(self._state_indexes.values()), p=self.initial_probabilities)
        return self.states[initial_index]

    def _generate_next_state(self, current_states):
        """
        Generate the next state based on the transition matrix and the current state.

        Parameters:
            current_state (list): The current state in the Markov Chain.

        Returns:
            The next state in the Markov Chain.
        """
        if self._does_state_have_subsequent(current_states):
            index = np.random.choice(list(self._state_indexes.values()),
                                     p=self.transition_matrix[self._state_indexes[tuple(current_states)]])
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
        return self.transition_matrix[self._state_indexes[tuple(state)]].sum() > 0

    def _note_to_state(self, note):
        """
        Converts a note to a state representation.

        Parameters:
            note (music21.note.Note): A music21 note object.

        Returns:
            A tuple representing the state (pitch, duration).
        """
        return (note.pitch.nameWithOctave, note.duration.quarterLength)


def create_training_data():
    """
    Creates a list of sample training notes for the melody of "Twinkle
    Twinkle Little Star."

    Returns:
        - list: A list of music21.note.Note objects.
    """
    return [
        note.Note("C5", quarterLength=1),
        note.Note("C5", quarterLength=1),
        note.Note("G5", quarterLength=1),
        note.Note("G5", quarterLength=1),
        note.Note("A5", quarterLength=1),
        note.Note("A5", quarterLength=1),
        note.Note("G5", quarterLength=2),
        note.Note("F5", quarterLength=1),
        note.Note("F5", quarterLength=1),
        note.Note("E5", quarterLength=1),
        note.Note("E5", quarterLength=1),
        note.Note("D5", quarterLength=1),
        note.Note("D5", quarterLength=1),
        note.Note("C5", quarterLength=2),
    ]


def visualize_melody(melody):
    """
    Visualize a sequence of (pitch, duration) pairs using music21.

    Parameters:
        - melody (list): A list of (pitch, duration) pairs.
    """
    print(melody)
    score = stream.Score()
    score.metadata = metadata.Metadata(title="Markov Chain Melody")
    part = stream.Part()
    for n, d in melody:
        part.append(note.Note(n, quarterLength=d))
    score.append(part)
    score.show()


def main():
    """Main function for training the chain, generating a melody, and
    visualizing the result."""

    training_data = create_training_data()

    states = [
        ("C5", 1),
        ("D5", 1),
        ("E5", 1),
        ("F5", 1),
        ("G5", 1),
        ("A5", 1),
        ("C5", 2),
        ("D5", 2),
        ("E5", 2),
        ("F5", 2),
        ("G5", 2),
        ("A5", 2),
    ]
    model = MarkovChainMelodyGenerator(states)
    model.train(training_data)

    generated_melody = model.generate(40)
    visualize_melody(generated_melody)


if __name__ == "__main__":
    main()
