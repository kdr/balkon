'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from 'lucide-react'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

interface MelodyPlayerProps {
  audioUrl: string
}

type EnhancedPolySynth = Tone.PolySynth & {
  startTime?: number;
}

export function MelodyPlayer({ audioUrl }: MelodyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const midiData = useRef<Midi | null>(null)
  const synth = useRef<EnhancedPolySynth | null>(null)
  const duration = useRef(0)
  const progressInterval = useRef<NodeJS.Timeout>()

  // Initialize synth only once
  useEffect(() => {
    if (!synth.current) {
      synth.current = new Tone.PolySynth().toDestination()
    }
    
    // Cleanup when component unmounts
    return () => {
      if (synth.current) {
        Tone.Transport.stop()
        Tone.Transport.cancel()
        synth.current.dispose()
        synth.current = null
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  // Load MIDI file when URL changes
  useEffect(() => {
    const loadMidi = async () => {
      if (!audioUrl) return
      
      setIsLoading(true)
      try {
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        midiData.current = new Midi(arrayBuffer)
        
        // Get duration from the last note's end time
        const lastNote = midiData.current.tracks[0].notes.slice(-1)[0]
        duration.current = lastNote ? lastNote.time + lastNote.duration : 0
        
        // Stop any playing notes and reset state
        handleReset()
      } catch (error) {
        console.error('Failed to load MIDI file:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMidi()
  }, [audioUrl])

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        const currentTime = Tone.Transport.seconds
        const progressPercent = (currentTime / duration.current) * 100
        setProgress(progressPercent)

        // Stop at the end
        if (currentTime >= duration.current) {
          handleReset()
        }
      }, 16) // ~60fps
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying])

  const scheduleMidi = () => {
    if (!midiData.current || !synth.current) return
    
    // Clear any previous events
    Tone.Transport.cancel()
    
    // Schedule all notes
    midiData.current.tracks[0].notes.forEach(note => {
      Tone.Transport.schedule((time) => {
        synth.current?.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity
        )
      }, note.time)
    })
  }

  const playMidi = async () => {
    if (!midiData.current || !synth.current) return

    // Ensure audio context is started
    await Tone.start()
    
    // Schedule notes if not already scheduled
    scheduleMidi()
    
    // Start playback
    Tone.Transport.start()
  }

  const stopMidi = () => {
    // Pause the transport (maintains position)
    Tone.Transport.pause()
    
    // Release any currently playing notes
    if (synth.current) {
      synth.current.releaseAll()
    }
  }

  const handleSeek = (value: number[]) => {
    const newPosition = (value[0] / 100) * duration.current
    Tone.Transport.seconds = newPosition
    setProgress(value[0])
  }

  const togglePlay = async () => {
    if (isPlaying) {
      stopMidi()
      setIsPlaying(false)
    } else {
      await playMidi()
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (isPlaying) {
      stopMidi()
      setIsPlaying(false)
    }
    // Reset transport to beginning
    Tone.Transport.stop()
    Tone.Transport.position = 0
    setProgress(0)
  }

  return (
    <Card className="p-6 bg-zinc-950">
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
            disabled={isLoading}
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
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

