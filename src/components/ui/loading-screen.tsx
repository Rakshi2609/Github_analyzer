"use client"

import { Sparkles } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-black relative overflow-hidden">
      <div className="absolute -inset-32 bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-500 opacity-80 blur-3xl transform-gpu animate-[spin_30s_linear_infinite]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="p-6 rounded-full bg-white/6 backdrop-blur-md shadow-2xl border border-white/10">
          <Sparkles className="text-white w-20 h-20 animate-pulse" />
        </div>

        <h1 className="text-white text-4xl md:text-5xl tracking-widest uppercase font-extralight drop-shadow-lg">
          Preparing the Experience
        </h1>

        <p className="text-white/80 tracking-[0.18em]">A moment of cosmic elegance...</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-white/90 animate-bounce delay-75" />
          <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce delay-150" />
          <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce delay-200" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/60">
        Tip: click anywhere to continue
      </div>
    </div>
  )
}
