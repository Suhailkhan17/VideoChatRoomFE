"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pen, Eraser, Square, Circle, Type, Download, Trash2, Undo, Redo, Lock, Unlock } from "lucide-react"

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

  // Unified history system
  const [history, setHistory] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  
  // Canvas boundary constraint toggle
  const [allowOutsideCanvas, setAllowOutsideCanvas] = useState(true)

  // Helper function to check if coordinates are within canvas bounds
  const isWithinCanvas = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return false
    return x >= 0 && y >= 0 && x <= canvas.width && y <= canvas.height
  }

  // Helper function to constrain coordinates to canvas bounds
  const constrainToCanvas = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x, y }
    
    return {
      x: Math.max(0, Math.min(canvas.width, x)),
      y: Math.max(0, Math.min(canvas.height, y))
    }
  }

  useEffect(() => {
    // Add document-level event listeners for mouse events outside canvas
    const handleDocumentMouseMove = (e: MouseEvent) => {
      const { x, y } = getDocumentMousePos(e)
      
      // In locked mode, if mouse goes outside canvas, stop drawing and ignore movement
      if (!allowOutsideCanvas && !isWithinCanvas(x, y)) {
        // Stop any ongoing drawing
        if (isDrawing) {
          const ctx = canvasRef.current?.getContext("2d")
          if (ctx) {
            ctx.closePath()
            ctx.globalCompositeOperation = "source-over"
            saveToHistory()
          }
          setIsDrawing(false)
        }
        
        // Stop shape drawing
        if (startPos) {
          setStartPos(null)
        }
        
        // Don't update mouse position or continue any operations
        return
      }
      
      setMousePos({ x, y })

      if (!isDrawing && !startPos) return

      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx) return

      if (isDrawing) {
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
    }

    const handleDocumentMouseUp = (e: MouseEvent) => {
      const { x, y } = getDocumentMousePos(e)
      
      // In locked mode, ignore mouse up events outside canvas
      if (!allowOutsideCanvas && !isWithinCanvas(x, y)) {
        return
      }
      
      const wasDrawing = isDrawing
      const hadStartPos = startPos !== null
      
      setIsDrawing(false)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      if (tool === "pen" || tool === "eraser") {
        if (wasDrawing) {
          ctx.closePath()
          // Reset composite operation to normal
          ctx.globalCompositeOperation = "source-over"
          // Save to history after pen/eraser stroke is complete
          saveToHistory()
        }
      }

      if ((tool === "rectangle" || tool === "circle") && hadStartPos) {
        const x2 = x
        const y2 = y

        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.globalCompositeOperation = "source-over"

        if (tool === "rectangle") {
          const width = x2 - startPos!.x
          const height = y2 - startPos!.y
          ctx.strokeRect(startPos!.x, startPos!.y, width, height)
        }

        if (tool === "circle") {
          const radius = Math.sqrt(Math.pow(x2 - startPos!.x, 2) + Math.pow(y2 - startPos!.y, 2)) / 2
          const centerX = (startPos!.x + x2) / 2
          const centerY = (startPos!.y + y2) / 2
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.stroke()
        }

        setStartPos(null)
        // Save to history after shape is complete
        saveToHistory()
      }
    }

    // Always add document listeners
    document.addEventListener('mousemove', handleDocumentMouseMove)
    document.addEventListener('mouseup', handleDocumentMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [isDrawing, tool, color, lineWidth, startPos, allowOutsideCanvas])

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

    // Save initial blank state to history
    setHistory([canvas.toDataURL()])
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const ctx = overlay.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, overlay.width, overlay.height)

      if (tool === "eraser" && mousePos) {
        const { x, y } = mousePos
        
        // Only show eraser preview if within canvas bounds (in locked mode)
        if (allowOutsideCanvas || isWithinCanvas(x, y)) {
          ctx.beginPath()
          ctx.arc(x, y, lineWidth, 0, Math.PI * 2)
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      if ((tool === "rectangle" || tool === "circle") && startPos && mousePos) {
        const { x, y } = mousePos
        
        // Only show shape preview if within canvas bounds (in locked mode)
        if (allowOutsideCanvas || isWithinCanvas(x, y)) {
          ctx.strokeStyle = color
          ctx.lineWidth = lineWidth

          if (tool === "rectangle") {
            const width = x - startPos.x
            const height = y - startPos.y
            ctx.strokeRect(startPos.x, startPos.y, width, height)
          }

          if (tool === "circle") {
            const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)) / 2
            const centerX = (startPos.x + x) / 2
            const centerY = (startPos.y + y) / 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(render)
    }

    render()
  }, [tool, mousePos, lineWidth, startPos, color, allowOutsideCanvas])

  // Save current canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const newImage = canvas.toDataURL()
    setHistory(prev => [...prev, newImage])
    setRedoStack([]) // Clear redo stack when new action is performed
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Get mouse position for document-level events (when mouse leaves canvas)
  const getDocumentMousePos = (e: MouseEvent) => {
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
      setIsDrawing(true)
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (tool === "rectangle" || tool === "circle") {
      setStartPos({ x, y })
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e)
    setMousePos({ x, y })

    if (!isDrawing) return

    const ctx = canvasRef.current?.getContext("2d")
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

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const wasDrawing = isDrawing
    const hadStartPos = startPos !== null
    
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (tool === "pen" || tool === "eraser") {
      if (wasDrawing) {
        ctx.closePath()
        // Reset composite operation to normal
        ctx.globalCompositeOperation = "source-over"
        // Save to history after pen/eraser stroke is complete
        saveToHistory()
      }
    }

    if ((tool === "rectangle" || tool === "circle") && hadStartPos) {
      const { x: x2, y: y2 } = getMousePos(e)

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.globalCompositeOperation = "source-over"

      if (tool === "rectangle") {
        const width = x2 - startPos!.x
        const height = y2 - startPos!.y
        ctx.strokeRect(startPos!.x, startPos!.y, width, height)
      }

      if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(x2 - startPos!.x, 2) + Math.pow(y2 - startPos!.y, 2)) / 2
        const centerX = (startPos!.x + x2) / 2
        const centerY = (startPos!.y + y2) / 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }

      setStartPos(null)
      // Save to history after shape is complete
      saveToHistory()
    }
  }

  // Restore canvas from data URL
  const restoreFromDataURL = (dataUrl: string) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = dataUrl
  }

  // Undo function
  const handleUndo = () => {
    if (history.length <= 1) return
    
    const newHistory = [...history]
    const currentState = newHistory.pop()
    if (currentState) {
      setRedoStack(prev => [...prev, currentState])
    }
    setHistory(newHistory)
    
    // Restore to previous state
    const previousState = newHistory[newHistory.length - 1]
    if (previousState) {
      restoreFromDataURL(previousState)
    }
  }

  // Redo function
  const handleRedo = () => {
    if (redoStack.length === 0) return
    
    const newRedoStack = [...redoStack]
    const redoState = newRedoStack.pop()
    if (!redoState) return
    
    setHistory(prev => [...prev, redoState])
    setRedoStack(newRedoStack)
    restoreFromDataURL(redoState)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    
    ctx.fillStyle = "#1f2937"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Save cleared state to history
    saveToHistory()
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "whiteboard.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const toggleCanvasBounds = () => {
    setAllowOutsideCanvas(!allowOutsideCanvas)
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

          <Button 
            onClick={toggleCanvasBounds}
            variant={allowOutsideCanvas ? "ghost" : "default"}
            size="sm"
            title={allowOutsideCanvas ? "Click to lock mouse to canvas" : "Click to allow mouse outside canvas"}
          >
            {allowOutsideCanvas ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>

          <div className="w-px h-6 bg-gray-600" />

          <Button 
            onClick={handleUndo} 
            variant="ghost" 
            size="sm"
            disabled={history.length <= 1}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleRedo} 
            variant="ghost" 
            size="sm"
            disabled={redoStack.length === 0}
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Button onClick={clearCanvas} variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={downloadCanvas} variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative flex-1 flex items-center justify-center bg-gray-900 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={() => {}} // Remove auto-stop on mouse leave
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