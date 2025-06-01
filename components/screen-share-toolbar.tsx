"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Monitor, Square, Pause, Play, Maximize2, Minimize2, MousePointer, Volume2, VolumeX } from "lucide-react"

interface ScreenShareToolbarProps {
  isScreenSharing: boolean
  screenShareType: "screen" | "window" | "tab" | null
  onStopSharing: () => void
  onPauseSharing: () => void
  onResumeSharing: () => void
  isPaused: boolean
}

export function ScreenShareToolbar({
  isScreenSharing,
  screenShareType,
  onStopSharing,
  onPauseSharing,
  onResumeSharing,
  isPaused,
}: ScreenShareToolbarProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)

  if (!isScreenSharing) return null

  const getShareTypeIcon = () => {
    switch (screenShareType) {
      case "screen":
        return <Monitor className="h-4 w-4" />
      case "window":
        return <Square className="h-4 w-4" />
      case "tab":
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getShareTypeText = () => {
    switch (screenShareType) {
      case "screen":
        return "Entire Screen"
      case "window":
        return "Application Window"
      case "tab":
        return "Browser Tab"
      default:
        return "Screen"
    }
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="bg-red-600 border-red-700 text-white shadow-lg">
        <div className={`flex items-center gap-3 p-3 ${isMinimized ? "px-4" : ""}`}>
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            {!isMinimized && (
              <>
                {getShareTypeIcon()}
                <span className="font-medium">Sharing {getShareTypeText()}</span>
                {isPaused && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white">
                    Paused
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <Button
                onClick={isPaused ? onResumeSharing : onPauseSharing}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-700"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>

              <Button
                onClick={() => setShowCursor(!showCursor)}
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-red-700 ${!showCursor ? "opacity-50" : ""}`}
              >
                <MousePointer className="h-4 w-4" />
              </Button>

              <Button
                onClick={() => setAudioEnabled(!audioEnabled)}
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-red-700 ${!audioEnabled ? "opacity-50" : ""}`}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <div className="w-px h-4 bg-red-400"></div>

              <Button
                onClick={onStopSharing}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-800 font-medium"
              >
                Stop Sharing
              </Button>
            </div>
          )}

          {/* Minimize/Maximize */}
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-700"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
