'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MelodyPlayer } from '@/components/melody-player'
import { MelodyOptions } from '@/components/melody-options'
import { VariationHistory } from '@/components/variation-history'
import { DownloadSection } from '@/components/download-section'
import type { MelodyState, Variation } from '@/types/melody'

interface SeedData {
  seed_notes: [string, number][]
  midi_uri: string
}

export default function MelodyAdventure() {
  const searchParams = useSearchParams()
  const [seedData, setSeedData] = useState<SeedData>({ seed_notes: [], midi_uri: "" })
  const [melodyState, setMelodyState] = useState<MelodyState>(() => {
    // Try to initialize with the URL parameter data
    try {
      const data = searchParams.get('data')
      if (data) {
        const parsedData = JSON.parse(decodeURIComponent(data))
        return {
          currentAudioUrl: parsedData.midi_uri,
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
        setSeedData(parsedData)
      } catch (error) {
        console.error('Error parsing seed data:', error)
        setSeedData({ seed_notes: [], midi_uri: "" })
      }
    }
  }, [searchParams])

  const handleVariationSelect = async (newVariation: Variation, file?: File) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock API response - use the seed midi_uri if it's a repeat-seed variation
      const mockResponse = {
        audioUrl: newVariation.type === 'repeat-seed' 
          ? seedData.midi_uri 
          : `/placeholder.mp3?v=${Date.now()}`, // Force new URL
        variations: [...melodyState.variations, newVariation]
      }

      setMelodyState({
        currentAudioUrl: mockResponse.audioUrl,
        variations: mockResponse.variations
      })
      
      // Increment key to force reset of DownloadSection
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
          <MelodyPlayer audioUrl={melodyState.currentAudioUrl} />
          <MelodyOptions onSelect={handleVariationSelect} />
          <DownloadSection 
            key={resetKey} 
            audioUrl={melodyState.currentAudioUrl} 
          />
        </div>
      </div>
      <div className="w-80 border-l border-zinc-700 bg-zinc-900">
        <VariationHistory variations={melodyState.variations} />
      </div>
    </main>
  )
}

