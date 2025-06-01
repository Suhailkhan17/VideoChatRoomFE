"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoStream } from "@/components/video-stream"
import { ParticipantsList } from "@/components/participants-list"
import { ChatPanel } from "@/components/chat-panel"
import { RecordingPanel } from "@/components/recording-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { ReactionsPanel } from "@/components/reactions-panel"
import { WhiteboardPanel } from "@/components/whiteboard-panel"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  MessageSquare,
  Monitor,
  Copy,
  Check,
  Settings,
  Circle,
  Square,
  Smile,
  PenTool,
  MoreVertical,
  PictureInPicture,
  Maximize,
  Camera,
  X,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { AdvancedScreenShare } from "@/components/advanced-screen-share"
import { ScreenShareToolbar } from "@/components/screen-share-toolbar"

interface VideoCallProps {
  roomId: string
  userName: string
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  onVideoToggle: (enabled: boolean) => void
  onAudioToggle: (enabled: boolean) => void
  onLeaveRoom: () => void
  participants: string[]
  setParticipants: (participants: string[]) => void
}

export function VideoCall({
  roomId,
  userName,
  isVideoEnabled,
  isAudioEnabled,
  onVideoToggle,
  onAudioToggle,
  onLeaveRoom,
  participants,
  setParticipants,
}: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showScreenShareOptions, setShowScreenShareOptions] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenShareType, setScreenShareType] = useState<"screen" | "window" | "tab" | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPiPMode, setIsPiPMode] = useState(false)
  const [virtualBackground, setVirtualBackground] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  // Initialize local media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled,
        })
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    initializeMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Simulate adding participants
  useEffect(() => {
    const timer = setTimeout(() => {
      if (participants.length === 1) {
        const simulatedParticipants = ["Alice Johnson", "Bob Smith", "Carol Davis"]
        const randomParticipant = simulatedParticipants[Math.floor(Math.random() * simulatedParticipants.length)]
        if (!participants.includes(randomParticipant)) {
          setParticipants([...participants, randomParticipant])
        }
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [participants, setParticipants])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        onVideoToggle(!isVideoEnabled)
      }
    }
  }, [localStream, isVideoEnabled, onVideoToggle])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        onAudioToggle(!isAudioEnabled)
      }
    }
  }, [localStream, isAudioEnabled, onAudioToggle])

  const startScreenShare = async (type: "screen" | "window" | "tab", options?: any) => {
    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          mediaSource:
            type === "screen" ? ("screen" as any) : type === "window" ? ("window" as any) : ("browser" as any),
          frameRate: options?.frameRate || 30,
          width: { ideal: options?.quality === "ultra" ? 3840 : options?.quality === "high" ? 1920 : 1280 },
          height: { ideal: options?.quality === "ultra" ? 2160 : options?.quality === "high" ? 1080 : 720 },
        },
        audio: options?.includeAudio !== false,
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)

      setIsScreenSharing(true)
      setScreenShareType(type)
      setShowScreenShareOptions(false)

      // Replace video track in local stream
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0]
        const screenTrack = screenStream.getVideoTracks()[0]

        if (videoTrack) {
          localStream.removeTrack(videoTrack)
          videoTrack.stop()
        }

        localStream.addTrack(screenTrack)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }

        screenTrack.onended = () => {
          stopScreenShare()
        }
      }
    } catch (error) {
      console.error("Error starting screen share:", error)
    }
  }

  const stopScreenShare = async () => {
    if (localStream && isScreenSharing) {
      const screenTrack = localStream.getVideoTracks()[0]
      if (screenTrack) {
        screenTrack.stop()
        localStream.removeTrack(screenTrack)
      }

      // Restart camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        const cameraTrack = cameraStream.getVideoTracks()[0]
        localStream.addTrack(cameraTrack)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }
      } catch (error) {
        console.error("Error restarting camera:", error)
      }

      setIsScreenSharing(false)
      setScreenShareType(null)
    }
  }

  const startRecording = () => {
    if (localStream) {
      recordedChunks.current = []
      mediaRecorder.current = new MediaRecorder(localStream, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `video-call-${roomId}-${new Date().toISOString()}.webm`
        a.click()
        URL.revokeObjectURL(url)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const togglePictureInPicture = async () => {
    if (localVideoRef.current) {
      try {
        if (isPiPMode) {
          await document.exitPictureInPicture()
          setIsPiPMode(false)
        } else {
          await localVideoRef.current.requestPictureInPicture()
          setIsPiPMode(true)
        }
      } catch (error) {
        console.error("Picture-in-Picture error:", error)
      }
    }
  }

  const sendReaction = (emoji: string) => {
    setCurrentReaction(emoji)
    setTimeout(() => setCurrentReaction(null), 3000)
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pauseScreenShare = () => {
    if (localStream && isScreenSharing) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = false
        setIsPaused(true)
      }
    }
  }

  const resumeScreenShare = () => {
    if (localStream && isScreenSharing) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = true
        setIsPaused(false)
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <ScreenShareToolbar
        isScreenSharing={isScreenSharing}
        screenShareType={screenShareType}
        onStopSharing={stopScreenShare}
        onPauseSharing={pauseScreenShare}
        onResumeSharing={resumeScreenShare}
        isPaused={isPaused}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">Room: {roomId}</h1>
          <Button
            onClick={copyRoomId}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy ID"}
          </Button>

          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-2 w-2 mr-1 fill-current" />
              Recording
            </Badge>
          )}

          {isScreenSharing && (
            <Badge variant="secondary" className="bg-blue-600">
              <Monitor className="h-3 w-3 mr-1" />
              Sharing {screenShareType}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-600 text-white">
            <Users className="h-3 w-3 mr-1" />
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </Badge>

          <Button
            onClick={() => setShowParticipants(!showParticipants)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Users className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <PenTool className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRecording(true)}>
                <Circle className="h-4 w-4 mr-2" />
                Recording Options
              </DropdownMenuItem>
              <DropdownMenuItem onClick={togglePictureInPicture}>
                <PictureInPicture className="h-4 w-4 mr-2" />
                Picture in Picture
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={() => setVirtualBackground(!virtualBackground)}>
                <Camera className="h-4 w-4 mr-2" />
                {virtualBackground ? "Disable" : "Enable"} Virtual Background
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video */}
            <VideoStream
              stream={localStream}
              userName={`${userName} (You)`}
              isLocal={true}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              virtualBackground={virtualBackground}
              reaction={currentReaction}
            />

            {/* Remote Videos */}
            {participants.slice(1).map((participant, index) => (
              <VideoStream
                key={participant}
                stream={null}
                userName={participant}
                isLocal={false}
                isVideoEnabled={true}
                isAudioEnabled={true}
                isScreenSharing={false}
                virtualBackground={false}
                reaction={null}
              />
            ))}
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <ParticipantsList participants={participants} onClose={() => setShowParticipants(false)} />
        )}

        {showChat && <ChatPanel roomId={roomId} userName={userName} onClose={() => setShowChat(false)} />}

        {showWhiteboard && <WhiteboardPanel onClose={() => setShowWhiteboard(false)} />}

        {/* Overlay Panels */}
        {showScreenShareOptions && (
          <AdvancedScreenShare
            onSelectType={startScreenShare}
            onClose={() => setShowScreenShareOptions(false)}
            isScreenSharing={isScreenSharing}
            onStopSharing={stopScreenShare}
          />
        )}

        {showRecording && (
          <RecordingPanel
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onClose={() => setShowRecording(false)}
          />
        )}

        {showSettings && (
          <SettingsPanel
            virtualBackground={virtualBackground}
            onVirtualBackgroundToggle={setVirtualBackground}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showReactions && <ReactionsPanel onSendReaction={sendReaction} onClose={() => setShowReactions(false)} />}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isScreenSharing ? "secondary" : "outline"}
                size="lg"
                className={`rounded-full w-12 h-12 ${isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : ""}`}
              >
                <Monitor className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-64">
              <DropdownMenuLabel>Screen Share Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />

              <DropdownMenuItem onClick={() => startScreenShare("screen")} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Maximize className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Entire Screen</div>
                  <div className="text-xs text-gray-400">Share everything on your screen</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => startScreenShare("window")} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <Square className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Application Window</div>
                  <div className="text-xs text-gray-400">Share a specific application</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => startScreenShare("tab")} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Browser Tab</div>
                  <div className="text-xs text-gray-400">Share a specific browser tab</div>
                </div>
              </DropdownMenuItem>

              {isScreenSharing && (
                <>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={stopScreenShare} className="text-red-400 p-3">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center mr-3">
                      <X className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Stop Sharing</div>
                      <div className="text-xs text-gray-300">End screen share</div>
                    </div>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={() => setShowScreenShareOptions(true)} className="p-3">
                <Settings className="h-4 w-4 mr-3" />
                <span>Advanced Options</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setShowReactions(!showReactions)}
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            <Circle className={`h-5 w-5 ${isRecording ? "fill-current" : ""}`} />
          </Button>

          <Button onClick={onLeaveRoom} variant="destructive" size="lg" className="rounded-full w-12 h-12">
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
