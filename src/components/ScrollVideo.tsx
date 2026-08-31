'use client'

import { useEffect, useRef } from 'react'

const VIDEO_URL =
  'https://res-a.generateprompt.net/prompt/web-design/prompt-assets/prompt-040505207cb53470/hf-20260611-104107-121bfb5a-b1df-4e0d-8240-25b81f7cc85d.mp4'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fallbackRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const fallbackVideo = fallbackRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let cancelled = false
    let rafId = 0
    let objectUrl: string | null = null
    let smoothed = 0
    let lastIndex = -1
    const frames: ImageBitmap[] = []

    const getProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return 0
      return clamp(window.scrollY / scrollable, 0, 1)
    }

    const resizeCanvas = () => {
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
    }

    const onScroll = () => {
      if (frames.length > 0) return
      if (!fallbackVideo) return
      const duration = fallbackVideo.duration || 0
      if (!duration) return
      const target = getProgress() * duration
      if (Math.abs(target - fallbackVideo.currentTime) > 0.001) {
        fallbackVideo.currentTime = target
      }
    }

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      if (frames.length === 0) return
      const progress = getProgress()
      smoothed += (progress - smoothed) * 0.1
      const index = Math.min(
        frames.length - 1,
        Math.max(0, Math.round(smoothed * (frames.length - 1))),
      )
      if (index === lastIndex) return
      lastIndex = index
      const frame = frames[index]
      const scale = Math.max(
        canvas.width / frame.width,
        canvas.height / frame.height,
      )
      const dw = frame.width * scale
      const dh = frame.height * scale
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(frame, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)
    }

    const extract = async () => {
      try {
        const response = await fetch(VIDEO_URL)
        if (cancelled || !response.ok) return
        const blob = await response.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)

        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        video.src = objectUrl

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve()
          video.onerror = () => reject(new Error('failed to load video'))
        })
        if (cancelled) return

        const duration = video.duration || 0
        if (!duration) return

        const maxWidth = 1280
        const scale = Math.min(1, maxWidth / (video.videoWidth || 1))
        const width = Math.max(1, Math.round((video.videoWidth || 1) * scale))
        const height = Math.max(1, Math.round((video.videoHeight || 1) * scale))
        const frameCount = clamp(Math.round(duration * 24), 30, 120)
        const span = Math.max(0.05, duration - 0.05)

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) return
          video.currentTime = (i / Math.max(1, frameCount - 1)) * span
          await new Promise<void>((resolve) => {
            let resolved = false
            const done = () => {
              if (!resolved) {
                resolved = true
                video.removeEventListener('seeked', done)
                resolve()
              }
            }
            video.addEventListener('seeked', done)
            window.setTimeout(done, 1000)
          })
          if (cancelled) return
          const bitmap = await createImageBitmap(video, {
            resizeWidth: width,
            resizeHeight: height,
          })
          frames.push(bitmap)
        }
      } catch {
        // frames stay empty; the fallback video handles scrubbing
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('scroll', onScroll, { passive: true })
    draw()
    extract()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('scroll', onScroll)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      frames.forEach((frame) => frame.close())
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
      <video
        ref={fallbackRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
    </div>
  )
}
