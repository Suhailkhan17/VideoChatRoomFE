"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pen, Eraser, Square, Circle, Type, Download, Trash2 } from "lucide-react"

interface WhiteboardPanelProps {
  onClose: () => void
}

export function WhiteboardPanel({ onClose }: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser" | "rectangle" | "circle" | "text">("pen")
  const [color, setColor] = useState("#ffffff")
  const [lineWidth, setLineWidth] = useState(2)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Set initial styles
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = lineWidth * 2
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "whiteboard.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const colors = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#000000"]

  return (
    <Card className="w-full max-w-4xl bg-gray-800 border-gray-700 text-white h-full rounded-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Whiteboard</CardTitle>
        <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-700 rounded-lg">
          <div className="flex gap-1">
            <Button onClick={() => setTool("pen")} variant={tool === "pen" ? "default" : "ghost"} size="sm">
              <Pen className="h-4 w-4" />
            </Button>
            <Button onClick={() => setTool("eraser")} variant={tool === "eraser" ? "default" : "ghost"} size="sm">
              <Eraser className="h-4 w-4" />
            </Button>
            <Button onClick={() => setTool("rectangle")} variant={tool === "rectangle" ? "default" : "ghost"} size="sm">
              <Square className="h-4 w-4" />
            </Button>
            <Button onClick={() => setTool("circle")} variant={tool === "circle" ? "default" : "ghost"} size="sm">
              <Circle className="h-4 w-4" />
            </Button>
            <Button onClick={() => setTool("text")} variant={tool === "text" ? "default" : "ghost"} size="sm">
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-600" />

          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded border-2 ${color === c ? "border-white" : "border-gray-500"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-600" />

          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />

          <div className="w-px h-6 bg-gray-600" />

          <Button onClick={clearCanvas} variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={downloadCanvas} variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-600 cursor-crosshair max-w-full max-h-full"
            style={{ backgroundColor: "#1f2937" }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
