'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Download, Music } from 'lucide-react'

interface DownloadSectionProps {
  audioUrl: string
}

export function DownloadSection({ audioUrl }: DownloadSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [accompanimentUrl, setAccompanimentUrl] = useState<string | null>(null)

  const handleDownloadMidi = () => {
    const element = document.createElement('a')
    element.href = '/placeholder.midi'
    element.download = 'melody.midi'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleGenerateAccompaniment = async () => {
    setIsGenerating(true)
    setAccompanimentUrl(null)

    try {
      // Mock API call with 10 second delay
      await new Promise(resolve => setTimeout(resolve, 10000))
      setAccompanimentUrl('https://storage.googleapis.com/aviary-labs-media-public/example1_accompaniment.mid')
    } catch (error) {
      console.error('Failed to generate accompaniment:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xs mx-auto">
      <Button 
        onClick={handleDownloadMidi} 
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        Download MIDI
      </Button>

      <div className="space-y-2">
        {!isGenerating && !accompanimentUrl && (
          <Button 
            onClick={handleGenerateAccompaniment} 
            variant="secondary" 
            className="w-full"
          >
            <Music className="mr-2 h-4 w-4" />
            Generate Accompaniment
          </Button>
        )}

        {isGenerating && (
          <p className="text-sm text-center text-muted-foreground py-2">
            Generating accompaniment in progress...
          </p>
        )}

        {accompanimentUrl && !isGenerating && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              const element = document.createElement('a')
              element.href = accompanimentUrl
              element.download = 'accompaniment.midi'
              document.body.appendChild(element)
              element.click()
              document.body.removeChild(element)
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Accompaniment
          </Button>
        )}
      </div>
    </div>
  )
}

