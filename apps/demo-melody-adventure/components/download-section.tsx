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
    if (!audioUrl || audioUrl === "") {
      console.error('No MIDI URL available')
      return
    }

    const element = document.createElement('a')
    element.href = audioUrl
    element.download = 'melody.mid'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleGenerateAccompaniment = async () => {
    if (!audioUrl || audioUrl === "") {
      console.error('No MIDI URL available')
      return
    }

    setIsGenerating(true)
    setAccompanimentUrl(null)

    try {
      const response = await fetch('/api/generate_accompaniment', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate accompaniment')
      }

      const data = await response.json()
      setAccompanimentUrl(data.midi_uri)
    } catch (error) {
      console.error('Failed to generate accompaniment:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          onClick={handleDownloadMidi} 
          className="w-[240px]"
          disabled={!audioUrl || audioUrl === ""}
        >
          <Download className="mr-2 h-4 w-4" />
          Download MIDI
        </Button>

        {!isGenerating && !accompanimentUrl && (
          <Button 
            onClick={handleGenerateAccompaniment} 
            variant="secondary" 
            className="w-[240px]"
            disabled={!audioUrl || audioUrl === ""}
          >
            <Music className="mr-2 h-4 w-4" />
            Generate Accompaniment
          </Button>
        )}

        {accompanimentUrl && !isGenerating && (
          <Button 
            variant="outline" 
            className="w-[240px]"
            onClick={() => {
              const element = document.createElement('a')
              element.href = accompanimentUrl
              element.download = 'accompaniment.mid'
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

      {isGenerating && (
        <p className="text-sm text-center text-muted-foreground py-2">
          Generating accompaniment in progress...
        </p>
      )}
    </div>
  )
}

