'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const AvatarCanvas = dynamic(() => import('../../components/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0f0f1a] flex items-center justify-center">
      <p className="text-white text-xl">Loading…</p>
    </div>
  ),
})

const AVATARS = {
  sophia: { url: '/avatars/sophia/sophia.glb', body: 'F' as const, label: 'Sophia — HR' },
  eric:   { url: '/avatars/eric/eric.glb',     body: 'M' as const, label: 'Eric — Tech' },
  nancy:  { url: '/avatars/nancy/nancy.glb',   body: 'F' as const, label: 'Nancy — PM' },
}

export default function InterviewPage() {
  const [selected, setSelected] = useState<'sophia' | 'eric' | 'nancy'>('sophia')
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center gap-8">
        <h1 className="text-white text-3xl font-bold">Choose your interviewer</h1>
        <div className="flex gap-6">
          {(Object.entries(AVATARS) as [keyof typeof AVATARS, typeof AVATARS['sophia']][]).map(
            ([key, av]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`px-8 py-4 rounded-xl border-2 text-white font-medium text-lg transition-all ${
                  selected === key
                    ? 'border-blue-400 bg-blue-600/30'
                    : 'border-white/20 hover:border-white/50'
                }`}
              >
                {av.label}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="mt-4 px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors"
        >
          Start Interview
        </button>
      </div>
    )
  }

  const av = AVATARS[selected]

  return (
    <AvatarCanvas
      avatarUrl={av.url}
      body={av.body}
      speaker={selected}
    />
  )
}
