"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pen, Eraser, Square, Circle, Type, Download, Trash2, RotateCcw, RotateCw } from "lucide-react"

interface WhiteboardPanelProps {
  onClose: () => void
}

export function WhiteboardPanel({ onClose }: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser" | "rectangle" | "circle" | "text">("pen")
  const [color, setColor] = useState("#ffffff")
  const [lineWidth, setLineWidth] = useState(2)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  // === Undo/Redo State ===
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    const width = 800
    const height = 600

    canvas.width = width
    canvas.height = height
    overlay.width = width
    overlay.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"

    saveState()
  }, [])

  // === Preview Start ===
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const ctx = overlay.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, overlay.width, overlay.height)

      // Eraser preview
      if (tool === "eraser" && mousePos) {
        ctx.beginPath()
        ctx.arc(mousePos.x, mousePos.y, lineWidth, 0, Math.PI * 2)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Shape preview
      if ((tool === "rectangle" || tool === "circle") && startPos && mousePos) {
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth

        if (tool === "rectangle") {
          const width = mousePos.x - startPos.x
          const height = mousePos.y - startPos.y
          ctx.strokeRect(startPos.x, startPos.y, width, height)
        }

        if (tool === "circle") {
          const radius = Math.sqrt(Math.pow(mousePos.x - startPos.x, 2) + Math.pow(mousePos.y - startPos.y, 2)) / 2
          const centerX = (startPos.x + mousePos.x) / 2
          const centerY = (startPos.y + mousePos.y) / 2
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }

      requestAnimationFrame(render)
    }

    render()
  }, [tool, mousePos, lineWidth, startPos, color])
  // === Preview End ===

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

 const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const { x, y } = getMousePos(e)

  const ctx = canvasRef.current?.getContext("2d")
  if (!ctx) return

  if (tool === "pen" || tool === "eraser") {
    saveState() 
    setIsDrawing(true)
    setHasDrawn(false)
    ctx.beginPath()
    ctx.moveTo(x, y)
  } else if (tool === "rectangle" || tool === "circle") {
    setStartPos({ x, y })
  }
}


  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const { x, y } = getMousePos(e)
  setMousePos({ x, y }) // For preview

  if (!isDrawing) return

  const ctx = canvasRef.current?.getContext("2d")
  if (!ctx) return

  if (tool === "pen") {
    ctx.globalCompositeOperation = "source-over"
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true) // ✅ Track that drawing occurred
  } else if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out"
    ctx.lineWidth = lineWidth * 2
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true) // ✅ Track that erasing occurred
  }
}


  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
  setIsDrawing(false)

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  if (tool === "pen" || tool === "eraser") {
    ctx.closePath()
    return
  }

  if (!startPos) return

  const { x: x2, y: y2 } = getMousePos(e)

  if (tool === "rectangle") {
    const width = x2 - startPos.x
    const height = y2 - startPos.y
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.globalCompositeOperation = "source-over"
    ctx.strokeRect(startPos.x, startPos.y, width, height)
  }

  if (tool === "circle") {
    const radius = Math.sqrt(Math.pow(x2 - startPos.x, 2) + Math.pow(y2 - startPos.y, 2)) / 2
    const centerX = (startPos.x + x2) / 2
    const centerY = (startPos.y + y2) / 2

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.globalCompositeOperation = "source-over"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  setStartPos(null)

  // === Preview Cleanup ===
  const overlay = overlayRef.current
  if (overlay) {
    const overlayCtx = overlay.getContext("2d")
    overlayCtx?.clearRect(0, 0, overlay.width, overlay.height)
  }

  saveState()
}


  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = canvas.toDataURL()
    setUndoStack((prev) => [...prev, data])
    setRedoStack([]) // clear redo on new action
  }

  const restoreState = (dataUrl: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = new Image()
    img.src = dataUrl
    img.onload = () => ctx.drawImage(img, 0, 0)
  }

  const undo = () => {
    if (undoStack.length < 2) return
    const newUndo = [...undoStack]
    const last = newUndo.pop()!
    setRedoStack((prev) => [last, ...prev])
    const prev = newUndo[newUndo.length - 1]
    restoreState(prev)
    setUndoStack(newUndo)
  }

  const redo = () => {
    if (redoStack.length === 0) return
    const [latest, ...rest] = redoStack
    restoreState(latest)
    setUndoStack((prev) => [...prev, latest])
    setRedoStack(rest)
  }

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
    saveState()
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

          <Button onClick={undo} variant="ghost" size="sm" title="Undo">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={redo} variant="ghost" size="sm" title="Redo">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button onClick={clearCanvas} variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={downloadCanvas} variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas Stack */}
        <div className="relative flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="absolute top-0 left-0 border border-gray-600 cursor-crosshair z-10"
            style={{ backgroundColor: "#1f2937", width: "800px", height: "600px" }}
          />
          <canvas
            ref={overlayRef}
            className="pointer-events-none absolute top-0 left-0 z-20"
            width={800}
            height={600}
          />
        </div>
      </CardContent>
    </Card>
  )
}
