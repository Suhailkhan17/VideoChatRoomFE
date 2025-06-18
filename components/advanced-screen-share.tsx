"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Monitor, Square, Chrome, Maximize, Volume2, VolumeX, Settings, Zap, Wifi, Eye } from "lucide-react"

interface AdvancedScreenShareProps {
  onSelectType: (type: "screen" | "window" | "tab", options: ScreenShareOptions) => void
  onClose: () => void
  isScreenSharing: boolean
  onStopSharing: () => void
}

interface ScreenShareOptions {
  includeAudio: boolean
  quality: "low" | "medium" | "high" | "ultra"
  frameRate: number
  cursor: "always" | "motion" | "never"
  optimization: "auto" | "text" | "motion" | "detail"
}

export function AdvancedScreenShare({
  onSelectType,
  onClose,
  isScreenSharing,
  onStopSharing,
}: AdvancedScreenShareProps) {
  const [includeAudio, setIncludeAudio] = useState(true)
  const [quality, setQuality] = useState<"low" | "medium" | "high" | "ultra">("high")
  const [frameRate, setFrameRate] = useState([30])
  const [cursor, setCursor] = useState<"always" | "motion" | "never">("motion")
  const [optimization, setOptimization] = useState<"auto" | "text" | "motion" | "detail">("auto")

  const shareOptions: ScreenShareOptions = {
    includeAudio,
    quality,
    frameRate: frameRate[0],
    cursor,
    optimization,
  }

  const qualitySettings = {
    low: { resolution: "720p", bitrate: "500 kbps" },
    medium: { resolution: "1080p", bitrate: "1 Mbps" },
    high: { resolution: "1080p", bitrate: "2 Mbps" },
    ultra: { resolution: "4K", bitrate: "4 Mbps" },
  }

  const shareTypes = [
    {
      type: "screen" as const,
      icon: Maximize,
      title: "Entire Screen",
      description: "Share everything visible on your screen",
      color: "bg-blue-600",
      recommended: false,
    },
    {
      type: "window" as const,
      icon: Square,
      title: "Application Window",
      description: "Share a specific application or window",
      color: "bg-green-600",
      recommended: true,
    },
    {
      type: "tab" as const,
      icon: Chrome,
      title: "Browser Tab",
      description: "Share content from a specific browser tab",
      color: "bg-purple-600",
      recommended: false,
    },
  ]

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[500px] max-h-[80vh] overflow-y-auto bg-[#121949] border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-400" />
            Screen Share Options
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-black">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          {isScreenSharing && (
            <div className="p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Currently sharing screen</span>
                </div>
                <Button
                  onClick={onStopSharing}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  Stop Sharing
                </Button>
              </div>
            </div>
          )}

          {/* Share Type Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">What would you like to share?</h3>
            <div className="grid gap-3">
              {shareTypes.map((shareType) => {
                const Icon = shareType.icon
                return (
                  <Button
                    key={shareType.type}
                    onClick={() => onSelectType(shareType.type, shareOptions)}
                    variant="outline"
                    className="h-auto p-4 border-gray-600 text-left hover:bg-[#354db0] relative"
                    disabled={isScreenSharing}
                  >
                    <div className="flex items-center gap-4 w-full text-black hover:text-white">
                      <div className={`w-12 h-12 ${shareType.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{shareType.title}</span>
                          {shareType.recommended && (
                            <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{shareType.description}</p>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio Settings
            </h3>
            <div className="flex items-center justify-between p-3 bg-[#354db0] rounded-lg">
              <div className="flex items-center gap-2">
                {includeAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <Label htmlFor="include-audio">Include system audio</Label>
              </div>
              <Switch
                id="include-audio"
                checked={includeAudio}
                onCheckedChange={setIncludeAudio}
                disabled={isScreenSharing}
              />
            </div>
          </div>

          {/* Quality Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Video Quality
            </h3>

            <div className="space-y-3 p-3 bg-[#354db0] rounded-lg">
              <div className="space-y-2">
                <Label>Quality Preset</Label>
                <Select value={quality} onValueChange={(value: any) => setQuality(value)} disabled={isScreenSharing}>
                  <SelectTrigger className="bg-gray-600 border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500 text-white">
                    <SelectItem value="low">
                      Low - {qualitySettings.low.resolution} ({qualitySettings.low.bitrate})
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - {qualitySettings.medium.resolution} ({qualitySettings.medium.bitrate})
                    </SelectItem>
                    <SelectItem value="high">
                      High - {qualitySettings.high.resolution} ({qualitySettings.high.bitrate})
                    </SelectItem>
                    <SelectItem value="ultra">
                      Ultra - {qualitySettings.ultra.resolution} ({qualitySettings.ultra.bitrate})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frame Rate: {frameRate[0]} FPS</Label>
                <Slider
                  value={frameRate}
                  onValueChange={setFrameRate}
                  max={60}
                  min={5}
                  step={5}
                  disabled={isScreenSharing}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </h3>

            <div className="space-y-3 p-3 bg-[#354db0] rounded-lg">
              <div className="space-y-2">
                <Label>Mouse Cursor</Label>
                <Select value={cursor} onValueChange={(value: any) => setCursor(value)} disabled={isScreenSharing}>
                  <SelectTrigger className="bg-gray-600 border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500 text-white">
                    <SelectItem value="always">Always show cursor</SelectItem>
                    <SelectItem value="motion">Show on motion</SelectItem>
                    <SelectItem value="never">Never show cursor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Optimization</Label>
                <Select
                  value={optimization}
                  onValueChange={(value: any) => setOptimization(value)}
                  disabled={isScreenSharing}
                >
                  <SelectTrigger className="bg-gray-600 border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500 text-white">
                    <SelectItem value="auto">Auto (Recommended)</SelectItem>
                    <SelectItem value="text">Optimize for text</SelectItem>
                    <SelectItem value="motion">Optimize for motion</SelectItem>
                    <SelectItem value="detail">Optimize for detail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Performance Info */}
          <div className="p-3 bg-[#354db0] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Performance Impact</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-white">CPU Usage</div>
                <div
                  className={`font-medium ${quality === "ultra" ? "text-red-400" : quality === "high" ? "text-yellow-400" : "text-green-400"}`}
                >
                  {quality === "ultra" ? "High" : quality === "high" ? "Medium" : "Low"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-white">Bandwidth</div>
                <div className="font-medium text-blue-400">{qualitySettings[quality].bitrate}</div>
              </div>
              <div className="text-center">
                <div className="text-white">Quality</div>
                <div className="font-medium text-green-400">{qualitySettings[quality].resolution}</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Wifi className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-200">
                <div className="font-medium mb-1">Tips for better screen sharing:</div>
                <ul className="space-y-1 text-blue-300">
                  <li>• Close unnecessary applications to improve performance</li>
                  <li>• Use "Application Window" for focused sharing</li>
                  <li>• Lower quality if experiencing lag</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}