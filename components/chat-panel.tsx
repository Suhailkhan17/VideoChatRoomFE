
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, User } from "lucide-react"

interface Message {
  id: string
  userName: string
  text: string
  timestamp: Date
  isOwn: boolean
}

interface ChatPanelProps {
  roomId: string
  userName: string
  onClose: () => void
}

export function ChatPanel({ roomId, userName, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      userName: "System",
      text: `Welcome to room ${roomId}!`,
      timestamp: new Date(),
      isOwn: false,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate receiving messages
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 1) {
        setMessages((prev) => [
          ...prev,
          {
            id: "2",
            userName: "Alice Johnson",
            text: "Hello everyone! Great to be here.",
            timestamp: new Date(),
            isOwn: false,
          },
        ])
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [messages.length])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        userName,
        text: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true,
      }
      setMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="w-80 bg-[#121949] border-gray-700 text-white h-full rounded-none flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-lg">Chat</CardTitle>
        <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-black">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isOwn
                    ? "bg-blue-600 text-white"
                    : message.userName === "System"
                      ? "bg-[#2563eb] text-gray-200"
                      : "bg-[#2563eb] text-white"
                }`}
              >
                {!message.isOwn && message.userName !== "System" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                      <User className="h-2 w-2" />
                    </div>
                    <p className="text-xs font-medium text-gray-300">{message.userName}</p>
                  </div>
                )}
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-[#121949] border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="bg-[#21abf3] hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}