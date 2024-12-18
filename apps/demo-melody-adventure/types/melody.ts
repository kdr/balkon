export type VariationType = 'turkish' | 'indian' | 'carnatic' | 'cumbia' | 'classical' | 'ai' | 'repeat-previous' | 'repeat-seed' | 'seed' | 'upload-phrase' | 'repeat-phrase'

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

