'use client'

import { useState } from 'react'
import { MelodyPlayer } from '@/components/melody-player'
import { MelodyOptions } from '@/components/melody-options'
import { VariationHistory } from '@/components/variation-history'
import { DownloadSection } from '@/components/download-section'
import type { MelodyState, Variation } from '@/types/melody'

export default function MelodyAdventure() {
  const [melodyState, setMelodyState] = useState<MelodyState>({
    currentAudioUrl: '/placeholder.mp3',
    variations: [{
      id: '1',
      type: 'seed',
      timestamp: new Date().toISOString(),
      label: 'Initial Seed'
    }]
  })
  
  // Add a key to force reset of DownloadSection
  const [resetKey, setResetKey] = useState(0)

  const handleVariationSelect = async (newVariation: Variation, file?: File) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock API response
      const mockResponse = {
        audioUrl: `/placeholder.mp3?v=${Date.now()}`, // Force new URL
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

