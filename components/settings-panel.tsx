"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Camera, Mic, Wifi } from "lucide-react"

interface SettingsPanelProps {
  virtualBackground: boolean
  onVirtualBackgroundToggle: (enabled: boolean) => void
  onClose: () => void
}

export function SettingsPanel({ virtualBackground, onVirtualBackgroundToggle, onClose }: SettingsPanelProps) {
  const [micVolume, setMicVolume] = useState([80])
  const [speakerVolume, setSpeakerVolume] = useState([70])
  const [videoQuality, setVideoQuality] = useState("720p")
  const [bandwidth, setBandwidth] = useState("auto")
  const [noiseCancellation, setNoiseCancellation] = useState(true)
  const [echoCancellation, setEchoCancellation] = useState(true)

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-[80vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Settings</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Video Settings
            </h3>

            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <Label>Virtual Background</Label>
                <Switch checked={virtualBackground} onCheckedChange={onVirtualBackgroundToggle} />
              </div>

              <div className="space-y-2">
                <Label>Video Quality</Label>
                <Select value={videoQuality} onValueChange={setVideoQuality}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Audio Settings
            </h3>

            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label>Microphone Volume</Label>
                <Slider value={micVolume} onValueChange={setMicVolume} max={100} step={1} className="w-full" />
                <div className="text-xs text-gray-400">{micVolume[0]}%</div>
              </div>

              <div className="space-y-2">
                <Label>Speaker Volume</Label>
                <Slider value={speakerVolume} onValueChange={setSpeakerVolume} max={100} step={1} className="w-full" />
                <div className="text-xs text-gray-400">{speakerVolume[0]}%</div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Noise Cancellation</Label>
                <Switch checked={noiseCancellation} onCheckedChange={setNoiseCancellation} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Echo Cancellation</Label>
                <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
              </div>
            </div>
          </div>

          {/* Network Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Network Settings
            </h3>

            <div className="space-y-3 pl-6">
              <div className="space-y-2">
                <Label>Bandwidth Limit</Label>
                <Select value={bandwidth} onValueChange={setBandwidth}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="low">Low (500 kbps)</SelectItem>
                    <SelectItem value="medium">Medium (1 Mbps)</SelectItem>
                    <SelectItem value="high">High (2 Mbps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
