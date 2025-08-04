"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Music } from "lucide-react"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // 创建音频元素
    const audio = new Audio()
    audio.src = "/bgm.mp3" // 背景音乐文件
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("音频播放失败:", error)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = 0.3
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-30 flex gap-2">
      {/* 音乐播放控制 */}
      <Button
        onClick={togglePlay}
        size="sm"
        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
      >
        {isPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <Music className="w-4 h-4" />}
      </Button>

      {/* 音量控制 */}
      <Button
        onClick={toggleMute}
        size="sm"
        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
    </div>
  )
}
