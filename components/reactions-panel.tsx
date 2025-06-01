"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ReactionsPanelProps {
  onSendReaction: (emoji: string) => void
  onClose: () => void
}

export function ReactionsPanel({ onSendReaction, onClose }: ReactionsPanelProps) {
  const reactions = ["👍", "👎", "❤️", "😂", "😮", "😢", "😡", "👏", "🎉", "🔥", "💯", "👌", "✋", "🤝", "💪", "🙌"]

  return (
    <div className="absolute bottom-20 right-4 z-50">
      <Card className="w-64 bg-gray-800 border-gray-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Quick Reactions</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <X className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {reactions.map((emoji) => (
              <Button
                key={emoji}
                onClick={() => {
                  onSendReaction(emoji)
                  onClose()
                }}
                variant="ghost"
                className="h-10 w-10 text-xl hover:bg-gray-700"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
