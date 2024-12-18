'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from 'lucide-react'
import MidiPlayer from 'midi-player-js'
import Soundfont from 'soundfont-player'

interface MelodyPlayerProps {
  audioUrl: string
}

export function MelodyPlayer({ audioUrl }: MelodyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const playerRef = useRef<MidiPlayer.Player | null>(null)
  const instrumentRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  
  // Initialize MIDI player only (without audio context)
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Create MIDI player
      const player = new MidiPlayer.Player()
      player.on('playing', (currentTick: number, totalTicks: number) => {
        setProgress((currentTick / totalTicks) * 100)
      })
      
      player.on('midiEvent', (event: any) => {
        if (event.name === 'Note on' && event.velocity > 0 && instrumentRef.current) {
          instrumentRef.current.play(event.noteName, 0, {
            gain: event.velocity / 100,
          })
        }
      })

      player.on('endOfFile', () => {
        setIsPlaying(false)
        setProgress(0)
      })

      playerRef.current = player
    } catch (err) {
      console.error('Failed to initialize MIDI player:', err)
      setError('Failed to initialize MIDI player')
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Initialize audio context and instrument on first user interaction
  const initializeAudio = async () => {
    if (isInitialized || !playerRef.current) return
    
    try {
      // Create AudioContext
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx

      // Load instrument
      const instrument = await Soundfont.instrument(ctx, 'acoustic_grand_piano')
      instrumentRef.current = instrument

      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to initialize audio:', err)
      setError('Failed to initialize audio')
    }
  }

  // Load MIDI file when URL changes
  useEffect(() => {
    const loadMidi = async () => {
      if (!audioUrl || !playerRef.current) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(audioUrl)
        if (!response.ok) throw new Error('Failed to fetch MIDI file')
        
        const arrayBuffer = await response.arrayBuffer()
        const midiData = new Uint8Array(arrayBuffer)
        
        playerRef.current.loadArrayBuffer(midiData)
        setProgress(0)
        setIsPlaying(false)
        
      } catch (error) {
        console.error('Failed to load MIDI file:', error)
        setError(error instanceof Error ? error.message : 'Failed to load MIDI file')
      } finally {
        setIsLoading(false)
      }
    }

    loadMidi()
  }, [audioUrl])

  const togglePlay = async () => {
    if (!playerRef.current) return

    // Initialize audio on first play
    if (!isInitialized) {
      await initializeAudio()
    }

    if (!audioContextRef.current || !instrumentRef.current) {
      setError('Audio not initialized')
      return
    }

    if (isPlaying) {
      playerRef.current.pause()
      setIsPlaying(false)
    } else {
      await audioContextRef.current.resume()
      playerRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (!playerRef.current) return
    
    playerRef.current.stop()
    setIsPlaying(false)
    setProgress(0)
  }

  const handleSeek = (value: number[]) => {
    if (!playerRef.current) return
    
    const targetTick = (value[0] / 100) * (playerRef.current.getTotalTicks() || 0)
    playerRef.current.skipToTick(targetTick)
    setProgress(value[0])
  }

  return (
    <Card className="p-6 bg-zinc-950">
      {error && (
        <div className="text-red-500 text-sm mb-4 text-center">
          Error: {error}
        </div>
      )}
      <div className="flex items-center gap-4">
        <Slider 
          value={[progress]}
          onValueChange={handleSeek}
          min={0}
          max={100}
          step={0.1}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600"
            onClick={togglePlay}
            disabled={isLoading || !!error}
          >
            {isLoading ? (
              'Loading...'
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || !!error}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

