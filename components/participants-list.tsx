"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Mic, Video, Crown, User } from "lucide-react"

interface ParticipantsListProps {
  participants: string[]
  onClose: () => void
}

export function ParticipantsList({ participants, onClose }: ParticipantsListProps) {
  return (
    <Card className="w-80 bg-gray-800 border-gray-700 text-white h-full rounded-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Participants ({participants.length})</CardTitle>
        <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {participants.map((participant, index) => (
          <div key={participant} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {participant}
                  {index === 0 && " (You)"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                      <Crown className="h-2 w-2 mr-1" />
                      Host
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Mic className="h-3 w-3 text-white" />
              </div>
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <Video className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        ))}

        {participants.length === 1 && (
          <div className="text-center py-8 text-gray-400">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for others to join...</p>
            <p className="text-xs mt-1">Share the room ID to invite participants</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
