def enforce_bars(sequence, num_bars, quarter_note_per_bar=4):
    """
    Adjusts the sequence to fit within a specific number of bars by clipping and extending notes.

    Args:
        sequence (list): List of tuples, where each tuple contains a pitch/rest string and duration in quarter notes.
        num_bars (int): The number of bars the sequence should fit into.
        quarter_note_per_bar (int): Number of quarter notes in a single bar (default is 4 for 4/4 time).

    Returns:
        list: Adjusted sequence fitting the specified number of bars.
    """
    target_duration = num_bars * quarter_note_per_bar
    adjusted_sequence = []
    current_duration = 0

    for pitch, duration in sequence:
        if current_duration + duration <= target_duration:
            # Add the note as is
            adjusted_sequence.append((pitch, duration))
            current_duration += duration
        else:
            # Clip the note to fit the remaining duration
            remaining_duration = target_duration - current_duration
            if remaining_duration > 0:
                adjusted_sequence.append((pitch, remaining_duration))
                current_duration += remaining_duration
            break

    # Extend the sequence to fill the remaining space
    remaining_duration = target_duration - current_duration
    if remaining_duration > 0:
        adjusted_sequence.append(('Rest', remaining_duration))

    return adjusted_sequence
    