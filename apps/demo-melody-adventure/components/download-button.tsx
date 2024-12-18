'use client'

import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'

export function DownloadButton() {
  const handleDownload = () => {
    // Mock download functionality
    const element = document.createElement('a')
    element.href = 'https://storage.googleapis.com/aviary-labs-media-public/example1.mid' // TODO: placeholder
    element.download = 'melody.mid'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Button onClick={handleDownload} className="w-full max-w-xs">
      <Download className="mr-2 h-4 w-4" />
      Download MIDI
    </Button>
  )
}
