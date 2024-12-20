import { ScrollArea } from "@/components/ui/scroll-area"
import { Globe, Music2, Waves, Sparkles, Repeat, RotateCcw, Disc, Upload, Rewind, Music } from 'lucide-react'
import type { Variation } from '@/types/melody'

const VARIATION_ICONS = {
  turkish: Globe,
  indian: Music2,
  carnatic: Waves,
  cumbia: Sparkles,
  classical: Waves,
  ai: Sparkles,
  'repeat-previous': Repeat,
  'repeat-seed': RotateCcw,
  'upload-phrase': Upload,
  'repeat-phrase': Rewind,
  seed: Disc,
  mozart: Music
}

const VARIATION_COLORS = {
  turkish: 'text-red-400',
  indian: 'text-orange-400',
  carnatic: 'text-green-400',
  cumbia: 'text-blue-400',
  classical: 'text-violet-400',
  ai: 'text-emerald-400',
  'repeat-previous': 'text-yellow-400',
  'repeat-seed': 'text-pink-400',
  'upload-phrase': 'text-cyan-400',
  'repeat-phrase': 'text-rose-400',
  seed: 'text-zinc-400',
  mozart: 'text-green-400'
}

interface VariationHistoryProps {
  variations: Variation[]
}

export function VariationHistory({ variations }: VariationHistoryProps) {
  return (
    <div className="h-screen p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Variation History</h2>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-2 pr-4">
          {variations.map((variation, index) => {
            const Icon = VARIATION_ICONS[variation.type]
            return (
              <div
                key={variation.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50"
              >
                <div className={`p-2 rounded-full bg-zinc-800 ${VARIATION_COLORS[variation.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {variation.label}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Step {index + 1}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

