"use client"

import { useEffect, useState } from 'react'
import { SpiralDemo } from "@/components/ui/spiral-demo"
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function Page() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="w-screen h-screen">
      {/* Loading overlay */}
      <div className={`absolute inset-0 z-50 transition-opacity duration-700 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <LoadingScreen />
      </div>

      {/* Main demo underneath */}
      <div className={`relative w-full h-full transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <SpiralDemo />
      </div>
    </div>
  )
}

