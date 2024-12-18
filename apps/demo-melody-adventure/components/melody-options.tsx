'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, Music2, Waves, Sparkles, Repeat, RotateCcw, Upload, Rewind } from 'lucide-react'
import type { Variation } from '@/types/melody'

const OPTIONS = [
  { 
    id: 'turkish', 
    label: 'Turkish Makam', 
    icon: Globe,
    color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
  },
  { 
    id: 'indian', 
    label: 'Hindustani', 
    icon: Music2,
    color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
  },
  { 
    id: 'carnatic', 
    label: 'Carnatic', 
    icon: Waves,
    color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
  },
  { 
    id: 'cumbia', 
    label: 'Cumbia', 
    icon: Sparkles,
    color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
  },
  { 
    id: 'classical',
    label: 'Classic Bach', 
    icon: Waves,
    color: 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-400'
  },
  { 
    id: 'repeat-previous', 
    label: 'Repeat Previous', 
    icon: Repeat,
    color: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
  },
  { 
    id: 'repeat-seed', 
    label: 'Repeat Seed', 
    icon: RotateCcw,
    color: 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400'
  },
  { 
    id: 'upload-phrase', 
    label: 'Upload Phrase', 
    icon: Upload,
    color: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400',
    isUpload: true
  },
]

interface MelodyOptionsProps {
  onSelect: (variation: Variation, file?: File) => Promise<void>
}

export function MelodyOptions({ onSelect }: MelodyOptionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOptionSelect = async (optionId: string, file?: File) => {
    setLoading(optionId)
    try {
      // Reset accompaniment state by passing a new audioUrl
      await onSelect({
        id: Math.random().toString(36).substr(2, 9),
        type: optionId as Variation['type'],
        timestamp: new Date().toISOString(),
        label: file ? `${OPTIONS.find(opt => opt.id === optionId)?.label}: ${file.name}` 
                   : OPTIONS.find(opt => opt.id === optionId)?.label || ''
      }, file)
    } finally {
      setLoading(null)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleOptionSelect('upload-phrase', file)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="*"
      />
      
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const isLoading = loading === option.id
        
        return (
          <Card
            key={option.id}
            className={`p-4 cursor-pointer transition-colors ${option.color}`}
            onClick={() => {
              if (!isLoading) {
                if (option.isUpload) {
                  fileInputRef.current?.click()
                } else {
                  handleOptionSelect(option.id)
                }
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-zinc-900/50">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium">
                {isLoading ? 'Generating...' : option.label}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

