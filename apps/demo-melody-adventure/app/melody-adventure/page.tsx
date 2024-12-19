'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MelodyPlayer } from '@/components/melody-player'
import { MelodyOptions } from '@/components/melody-options'
import { VariationHistory } from '@/components/variation-history'
import { DownloadSection } from '@/components/download-section'

interface MelodyState {
  currentAudioUrl: string
  seedNotes: [string, number][]
  currentNotes: [string, number][]
  variations: {
    id: string
    type: string
    timestamp: string
    label: string
  }[]
}

export default function MelodyAdventure() {
  const searchParams = useSearchParams()
  const [melodyState, setMelodyState] = useState<MelodyState>(() => {
    // Try to initialize with the URL parameter data
    try {
      const data = searchParams.get('data')
      if (data) {
        const parsedData = JSON.parse(decodeURIComponent(data))
        return {
          currentAudioUrl: parsedData.midi_uri,
          seedNotes: parsedData.seed_notes,
          currentNotes: parsedData.seed_notes, // Initialize current notes with seed notes
          variations: [{
            id: '1',
            type: 'seed',
            timestamp: new Date().toISOString(),
            label: 'Initial Seed'
          }]
        }
      }
    } catch (error) {
      console.error('Error parsing initial seed data:', error)
    }
    
    // Fallback to empty state if no data or error
    return {
      currentAudioUrl: '',
      seedNotes: [],
      currentNotes: [],
      variations: [{
        id: '1',
        type: 'seed',
        timestamp: new Date().toISOString(),
        label: 'Initial Seed'
      }]
    }
  })
  
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setMelodyState(prev => ({
          ...prev,
          currentAudioUrl: parsedData.midi_uri,
          seedNotes: parsedData.seed_notes,
          currentNotes: parsedData.seed_notes
        }))
      } catch (error) {
        console.error('Error parsing seed data:', error)
      }
    }
  }, [searchParams])

  const handleVariationSelect = async (newVariation: { type: string, label: string }, file?: File) => {
    try {
      if (newVariation.type === 'upload') {
        if (!file) {
          console.error('No file provided for upload variation')
          return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('requested_variation', newVariation.type)
        formData.append('seed_notes', JSON.stringify(melodyState.seedNotes))
        formData.append('current_notes', JSON.stringify(melodyState.currentNotes))
        formData.append('variation_history', JSON.stringify(melodyState.variations.map(v => v.type)))

        const response = await fetch('/api/update_melody', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Failed to process upload variation')
        }

        const data = await response.json()
        setMelodyState(prev => ({
          currentAudioUrl: data.midi_uri,
          seedNotes: data.seed_notes,
          currentNotes: data.current_notes,
          variations: [...prev.variations, {
            id: Date.now().toString(),
            type: newVariation.type,
            timestamp: new Date().toISOString(),
            label: newVariation.label
          }]
        }))
      } else {
        const response = await fetch('/api/update_melody', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            seed_notes: melodyState.seedNotes,
            current_notes: melodyState.currentNotes,
            variation_history: melodyState.variations.map(v => v.type),
            requested_variation: newVariation.type
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate variation')
        }

        const data = await response.json()
        setMelodyState(prev => ({
          currentAudioUrl: data.midi_uri,
          seedNotes: data.seed_notes,
          currentNotes: data.current_notes,
          variations: [...prev.variations, {
            id: Date.now().toString(),
            type: newVariation.type,
            timestamp: new Date().toISOString(),
            label: newVariation.label
          }]
        }))
      }
      
      setResetKey(prev => prev + 1)
    } catch (error) {
      console.error('Failed to generate variation:', error)
    }
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center text-white">
            Melody Adventure
          </h1>
          <p className="text-zinc-400 text-center max-w-lg mx-auto">
            Welcome to your choose-your-own melody adventure! Use our AI-generated options or your own inputs to keep the melody going and create something unique.
          </p>
          <MelodyPlayer audioUrl={melodyState.currentAudioUrl} />
          
          <h2 className="text-xl font-semibold text-zinc-300 pt-4">
            Extend Your Melody
          </h2>
          <MelodyOptions onSelect={handleVariationSelect} />
          
          <div className="text-left">
            <h2 className="text-xl font-semibold text-zinc-300 pt-4 mb-4 text-center">
              Export Options
            </h2>
            <DownloadSection 
              key={resetKey} 
              audioUrl={melodyState.currentAudioUrl} 
            />
          </div>
        </div>
      </div>
      <div className="w-80 border-l border-zinc-700 bg-zinc-900">
        <VariationHistory variations={melodyState.variations} />
      </div>
    </main>
  )
}

