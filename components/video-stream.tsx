"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoOff, MicOff, Monitor, User, Wifi, WifiOff, Signal } from "lucide-react"

interface VideoStreamProps {
  stream: MediaStream | null
  userName: string
  isLocal: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  virtualBackground?: boolean
  reaction?: string | null
}

export function VideoStream({
  stream,
  userName,
  isLocal,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  virtualBackground = false,
  reaction = null,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [connectionQuality, setConnectionQuality] = useState<"good" | "fair" | "poor">("good")

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Simulate connection quality changes
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities: ("good" | "fair" | "poor")[] = ["good", "fair", "poor"]
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)])
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Virtual background effect (simplified simulation)
  useEffect(() => {
    if (virtualBackground && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Apply a simple blur effect as virtual background simulation
        ctx.filter = "blur(10px) brightness(0.7)"
      }
    }
  }, [virtualBackground])

  const showPlaceholder = !stream || !isVideoEnabled

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case "good":
        return <Signal className="h-3 w-3 text-green-500" />
      case "fair":
        return <Wifi className="h-3 w-3 text-yellow-500" />
      case "poor":
        return <WifiOff className="h-3 w-3 text-red-500" />
    }
  }

  return (
    <Card className="relative bg-gray-800 border-gray-700 overflow-hidden aspect-video">
      {showPlaceholder ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-300 text-sm">{userName}</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover ${virtualBackground ? "filter blur-sm" : ""}`}
          />
          {virtualBackground && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)" }}
            />
          )}
        </div>
      )}

      {/* Reaction Display */}
      {reaction && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
          {reaction}
        </div>
      )}

      {/* Overlay with user info and status */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/50 text-white text-xs">
            {userName}
          </Badge>
          {isScreenSharing && (
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              <Monitor className="h-3 w-3 mr-1" />
              Screen
            </Badge>
          )}
          {virtualBackground && (
            <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
              VB
            </Badge>
          )}
        </div>

        <div className="flex gap-1">
          {!isAudioEnabled && (
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <MicOff className="h-3 w-3 text-white" />
            </div>
          )}
          {!isVideoEnabled && (
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <VideoOff className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Connection indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {!isLocal && (
          <div className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
            {getConnectionIcon()}
            <span className="text-xs text-white capitalize">{connectionQuality}</span>
          </div>
        )}
        {!isLocal && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
      </div>

      {/* Audio level indicator */}
      {isAudioEnabled && (
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-1 h-3 bg-green-500 rounded-full ${
                  Math.random() > 0.5 ? "opacity-100" : "opacity-30"
                } transition-opacity duration-200`}
                style={{ height: `${level * 4}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
