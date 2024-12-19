export type VariationType = 'turkish' | 'indian' | 'carnatic' | 'cumbia' | 'classical' | 'repeat-previous' | 'repeat-seed' | 'upload-phrase' | 'seed'

export interface Variation {
  id: string
  type: VariationType
  timestamp: string
  label: string
}

export interface MelodyState {
  currentAudioUrl: string
  variations: Variation[]
}

