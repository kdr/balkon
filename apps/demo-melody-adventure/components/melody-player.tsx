'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw } from 'lucide-react'

interface MelodyPlayerProps {
  audioUrl: string
}

export function MelodyPlayer({ audioUrl }: MelodyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset player when audio URL changes
  useEffect(() => {
    setIsPlaying(false)
  }, [audioUrl])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
  }

  return (
    <Card className="p-6 bg-zinc-950">
      <div className="flex items-center justify-center gap-4 w-full max-w-xs mx-auto">
        <Button
          size="lg"
          className="flex-1 bg-red-500 hover:bg-red-600"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

