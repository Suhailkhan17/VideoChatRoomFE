"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoCall } from "@/components/video-call"
import { Video, Users } from "lucide-react"
import { toast as useToast} from "@/components/ui/use-toast"
import {
  WhatsappShareButton,
  FacebookShareButton,
  EmailShareButton,
  WhatsappIcon,
  FacebookIcon,
  EmailIcon,
} from 'react-share'

export default function VideoChatApp() {
  const [roomId, setRoomId] = useState("")
  const [userName, setUserName] = useState("")
  const [isInRoom, setIsInRoom] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [participants, setParticipants] = useState<string[]>([])
  const [showShareOptions, setShowShareOptions] = useState(false)
useEffect(() => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === "video-chat-room" && event.newValue) {
      const data = JSON.parse(event.newValue);
      if (data.roomId === roomId && !participants.includes(data.userName)) {
        setParticipants((prev) => [...new Set([...prev, data.userName])]);
      }
    }
  };

  window.addEventListener("storage", handleStorage);      
  return () => window.removeEventListener("storage", handleStorage);
}, [roomId, participants]);
  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(id)
  }

  const joinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      setIsInRoom(true)
      setParticipants([userName])

       localStorage.setItem("video-chat-room", JSON.stringify({ roomId, userName }));
    }
  }

  const shareMessage = `Join my video chat room with ID: ${roomId}`
  const currentUrl = typeof window !== "undefined" ? window.location.href : "about:blank";


  const leaveRoom = () => {
    setIsInRoom(false)
    setParticipants([])
  }

  if (isInRoom) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <VideoCall
          roomId={roomId}
          userName={userName}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onVideoToggle={setIsVideoEnabled}
          onAudioToggle={setIsAudioEnabled}
          onLeaveRoom={leaveRoom}
          participants={participants}
          setParticipants={setParticipants}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#141b4d] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Video className="h-8 w-8 text-blue-400" />
            Video Chat Room
          </CardTitle>
          <p className="text-gray-300">Connect with others instantly</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Room ID</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={generateRoomId}
                variant="outline"
                className="border-white/20 bg-[#111745] hover:bg-blue-900 text-white hover:text-white"
              >
                Generate
              </Button>
            </div>
          </div>

          <Button
            onClick={joinRoom}
            disabled={!roomId.trim() || !userName.trim()}
            className="w-full bg-[#111745] hover:bg-blue-900 text-white"
          >
            <Video className="h-4 w-4 mr-2" />
            Join Room
          </Button>

          <div className="relative group">
  <Button
    variant="outline"
    className="w-full text-sm border-white/20 text-black hover:bg-white/10"
    onClick={() => {
      if (roomId.trim()) {
        navigator.clipboard.writeText(roomId)
        useToast({
          title: "Copied to clipboard!",
          description: `Room ID "${roomId}" is ready to share.`,
        })
        setShowShareOptions(prev => !prev) 
      } else {
        useToast({
          title: "Missing Room ID",
          description: "Please enter or generate a Room ID first.",
        })
      }
    }}
  >
    Share the Room ID with others to invite them
  </Button>

  {showShareOptions && roomId && (
    <div
      className="absolute top-full left-0 z-10 mt-2 flex gap-2 p-2 bg-white/10 rounded-xl backdrop-blur-sm"
    >
      <WhatsappShareButton title={shareMessage} url={currentUrl}>
       <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <FacebookShareButton title={shareMessage} url={currentUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <EmailShareButton subject="Join my video chat room" body={shareMessage} url={currentUrl}>
        <EmailIcon size={32} round />
      </EmailShareButton>
    </div>
  )}
</div>

        </CardContent>
      </Card>
    </div>
  )
}