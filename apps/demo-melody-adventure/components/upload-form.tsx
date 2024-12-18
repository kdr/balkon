'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UploadForm() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'audio/midi' || droppedFile.type === 'text/plain')) {
      setFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mock POST request
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/melody-adventure')
  }

  const handleStartEmpty = () => {
    router.push('/melody-adventure')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-500 transition-colors",
          isDragging && "border-zinc-500 bg-zinc-900"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <Upload className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            {file ? file.name : 'Drop your MIDI or text file here, or click to browse'}
          </p>
        </label>
      </Card>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!file}>
          <Upload className="mr-2 h-4 w-4" />
          Upload and Continue
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleStartEmpty}
        >
          <Music className="mr-2 h-4 w-4" />
          Start Without Seed
        </Button>
      </div>
    </form>
  )
}

