"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Circle, Square, X, Video, Mic } from "lucide-react"

interface RecordingPanelProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onClose: () => void
}

export function RecordingPanel({ isRecording, onStartRecording, onStopRecording, onClose }: RecordingPanelProps) {
  const [recordAudio, setRecordAudio] = useState(true)
  const [recordVideo, setRecordVideo] = useState(true)
  const [recordChat, setRecordChat] = useState(false)
  const [quality, setQuality] = useState<"720p" | "1080p" | "4K">("1080p")

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Circle className="h-5 w-5 text-red-500" />
            Recording Options
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRecording && (
            <div className="p-3 bg-red-600/20 border border-red-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-red-500 fill-current animate-pulse" />
                <span className="text-sm font-medium">Recording in progress...</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="record-video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Record Video
              </Label>
              <Switch id="record-video" checked={recordVideo} onCheckedChange={setRecordVideo} disabled={isRecording} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="record-audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Record Audio
              </Label>
              <Switch id="record-audio" checked={recordAudio} onCheckedChange={setRecordAudio} disabled={isRecording} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="record-chat">Include Chat Messages</Label>
              <Switch id="record-chat" checked={recordChat} onCheckedChange={setRecordChat} disabled={isRecording} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recording Quality</Label>
            <div className="flex gap-2">
              {(["720p", "1080p", "4K"] as const).map((q) => (
                <Button
                  key={q}
                  onClick={() => setQuality(q)}
                  variant={quality === q ? "default" : "outline"}
                  size="sm"
                  disabled={isRecording}
                  className="flex-1"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {!isRecording ? (
              <Button
                onClick={onStartRecording}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!recordVideo && !recordAudio}
              >
                <Circle className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={onStopRecording}
                variant="outline"
                className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-400 text-center">Recordings are saved locally to your device</div>
        </CardContent>
      </Card>
    </div>
  )
}
