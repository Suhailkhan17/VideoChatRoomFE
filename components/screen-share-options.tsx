"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Square, Maximize, X, Chrome } from "lucide-react"

interface ScreenShareOptionsProps {
  onSelectType: (type: "screen" | "window" | "tab") => void
  onClose: () => void
}

export function ScreenShareOptions({ onSelectType, onClose }: ScreenShareOptionsProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Share Your Screen</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onSelectType("screen")}
            variant="outline"
            className="w-full h-16 border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col gap-2"
          >
            <Maximize className="h-6 w-6" />
            <span className="text-sm">Entire Screen</span>
          </Button>

          <Button
            onClick={() => onSelectType("window")}
            variant="outline"
            className="w-full h-16 border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col gap-2"
          >
            <Square className="h-6 w-6" />
            <span className="text-sm">Application Window</span>
          </Button>

          <Button
            onClick={() => onSelectType("tab")}
            variant="outline"
            className="w-full h-16 border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col gap-2"
          >
            <Chrome className="h-6 w-6" />
            <span className="text-sm">Browser Tab</span>
          </Button>

          <div className="text-xs text-gray-400 text-center pt-2">
            Choose what you want to share with other participants
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
