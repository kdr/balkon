import { UploadForm } from '@/components/upload-form'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-zinc-900 to-zinc-800">
      <div className="w-full max-w-md space-y-8 p-6 bg-zinc-950 rounded-xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Balkon Melody Generator
          </h1>
          <p className="text-zinc-400">
            Upload a seed melody or start from scratch to begin your musical journey
          </p>
        </div>
        <UploadForm />
      </div>
    </main>
  )
}

