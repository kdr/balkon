'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Midi } from '@tonejs/midi'
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
  
  const midiRef = useRef<Midi | null>(null)
  const instrumentRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const playbackRef = useRef<any>(null)
  const startTimeRef = useRef<number>(0)
  const seekPositionRef = useRef<number>(0)
  const activeNotesRef = useRef<number[]>([])
  const pausedTimeRef = useRef<number>(0)
  
  // Initialize audio context and instrument on first user interaction
  const initializeAudio = async () => {
    if (isInitialized) return
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
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
      if (!audioUrl) return
      
      // Stop any current playback
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
      stopAllNotes()
      setIsPlaying(false)
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(audioUrl)
        if (!response.ok) throw new Error('Failed to fetch MIDI file')
        
        const arrayBuffer = await response.arrayBuffer()
        const midi = new Midi(arrayBuffer)
        midiRef.current = midi
        setProgress(0)
        
      } catch (error) {
        console.error('Failed to load MIDI file:', error)
        setError(error instanceof Error ? error.message : 'Failed to load MIDI file')
      } finally {
        setIsLoading(false)
      }
    }

    loadMidi()
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [audioUrl])

  const stopAllNotes = () => {
    if (!instrumentRef.current) return
    
    try {
      // Stop all notes safely
      instrumentRef.current.stop()
      activeNotesRef.current = []
    } catch (err) {
      console.error('Error stopping notes:', err)
    }
  }

  const playNotes = (startTime: number) => {
    if (!midiRef.current || !instrumentRef.current || !audioContextRef.current) return

    stopAllNotes()

    try {
      const currentAudioTime = audioContextRef.current.currentTime
      
      midiRef.current.tracks.forEach(track => {
        track.notes.forEach(note => {
          if (note.time >= startTime) {
            instrumentRef.current.play(note.name, currentAudioTime + (note.time - startTime), {
              gain: note.velocity,
              duration: note.duration
            })
          }
        })
      })
    } catch (err) {
      console.error('Error playing notes:', err)
      setError('Error playing audio')
    }
  }

  const togglePlay = async () => {
    if (!midiRef.current) return

    if (!isInitialized) {
      await initializeAudio()
    }

    if (!audioContextRef.current || !instrumentRef.current) {
      setError('Audio not initialized')
      return
    }

    if (isPlaying) {
      clearInterval(playbackRef.current)
      stopAllNotes()
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      seekPositionRef.current = elapsed
      setIsPlaying(false)
    } else {
      await audioContextRef.current.resume()
      const duration = midiRef.current.duration
      startTimeRef.current = Date.now() - (seekPositionRef.current * 1000)
      
      playNotes(seekPositionRef.current)
      
      playbackRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        const progress = (elapsed / duration) * 100
        
        if (progress >= 100) {
          clearInterval(playbackRef.current)
          stopAllNotes()
          setIsPlaying(false)
          setProgress(0)
          seekPositionRef.current = 0
        } else {
          setProgress(progress)
          seekPositionRef.current = elapsed
        }
      }, 16)
      
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (playbackRef.current) {
      clearInterval(playbackRef.current)
    }
    stopAllNotes()
    setIsPlaying(false)
    setProgress(0)
    seekPositionRef.current = 0
  }

  const handleSeek = (value: number[]) => {
    if (!midiRef.current) return
    
    const wasPlaying = isPlaying
    
    // Stop current playback
    if (playbackRef.current) {
      clearInterval(playbackRef.current)
    }
    stopAllNotes()
    setIsPlaying(false)
    
    const targetPercent = value[0]
    const duration = midiRef.current.duration
    seekPositionRef.current = (targetPercent / 100) * duration
    setProgress(targetPercent)
    
    if (wasPlaying) {
      togglePlay()
    }
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

