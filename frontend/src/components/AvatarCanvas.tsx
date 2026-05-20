'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AvatarCanvasProps {
  avatarUrl: string
  body: 'M' | 'F'
  speaker: 'sophia' | 'eric' | 'nancy'
}

export default function AvatarCanvas({ avatarUrl, body, speaker }: AvatarCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'speaking' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [inputText, setInputText] = useState(
    "Welcome to your mock interview. Tell me — why are you interested in this role?"
  )

  // Listen for messages from the avatar iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data?.type) return
      switch (e.data.type) {
        case 'ready':           setStatus('ready'); break
        case 'speaking':        setStatus('speaking'); break
        case 'speaking-stopped': setStatus('ready'); break
        case 'error':
          setErrorMsg(e.data.message || 'Unknown error')
          setStatus('error')
          break
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const speak = useCallback(() => {
    if (!inputText.trim() || status === 'speaking') return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'speak', text: inputText, speaker },
      '*'
    )
  }, [inputText, speaker, status])

  const iframeSrc =
    `/avatar.html?avatar=${encodeURIComponent(avatarUrl)}&speaker=${speaker}&body=${body}`

  return (
    <div className="relative w-full h-screen bg-[#0f0f1a] overflow-hidden">
      {/* Camera in avatar.html frames head→hips — iframe is full height */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="absolute w-full h-full border-0 left-0 top-0"
        allow="autoplay"
      />

      {/* Loading overlay on top of iframe */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/40 text-lg font-light">Loading avatar…</div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-red-400 text-base max-w-md text-center px-6">
            <div className="font-semibold mb-1">Avatar failed to load</div>
            <div className="text-sm opacity-70">{errorMsg}</div>
          </div>
        </div>
      )}

      {(status === 'ready' || status === 'speaking') && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && speak()}
              disabled={status === 'speaking'}
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white/60 text-sm"
              placeholder="Type what the avatar should say…"
            />
            <button
              onClick={speak}
              disabled={status === 'speaking'}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait text-white font-medium text-sm transition-colors"
            >
              {status === 'speaking' ? 'Speaking…' : 'Speak'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
