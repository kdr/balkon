'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Slider } from "@/components/ui/slider"

interface MelodyPlayerProps {
  audioUrl: string
}

export function MelodyPlayer({ audioUrl }: MelodyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset player when audio URL changes
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [audioUrl])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setProgress(0)
    setIsPlaying(false)
  }

  return (
    <Card className="p-6 bg-zinc-950">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-zinc-400">
            {Math.floor(progress)}%
          </span>
        </div>
        <Slider
          value={[progress]}
          onValueChange={([value]) => setProgress(value)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </Card>
  )
}

