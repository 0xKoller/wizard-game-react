import React, { useRef, useState, useEffect } from 'react'

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void
  onShoot: () => void
  onShootStart?: () => void
  onShootEnd?: () => void
}

export function MobileControls({ onMove, onShoot, onShootStart, onShootEnd }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 })

  const JOYSTICK_SIZE = 120
  const KNOB_SIZE = 50
  const MAX_DISTANCE = 35

  // Simple touch/mouse handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return
    
    setIsDragging(true)
    updatePosition(clientX, clientY)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    updatePosition(clientX, clientY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setKnobPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }

  const updatePosition = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

    // Limit to max distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance > MAX_DISTANCE) {
      deltaX = (deltaX / distance) * MAX_DISTANCE
      deltaY = (deltaY / distance) * MAX_DISTANCE
    }

    setKnobPosition({ x: deltaX, y: deltaY })

    // Send normalized direction (-1 to 1)
    const normalizedX = distance > 0 ? deltaX / MAX_DISTANCE : 0
    const normalizedY = distance > 0 ? deltaY / MAX_DISTANCE : 0
    
    onMove({ x: normalizedX, y: normalizedY })
  }

  // Global event listeners
  useEffect(() => {
    const handleGlobalMove = (e: any) => {
      if (!isDragging) return
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      
      handleMove(clientX, clientY)
    }

    const handleGlobalEnd = () => {
      if (isDragging) handleEnd()
    }

    if (isDragging) {
      window.addEventListener('touchmove', handleGlobalMove)
      window.addEventListener('touchend', handleGlobalEnd)
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalEnd)
    }

    return () => {
      window.removeEventListener('touchmove', handleGlobalMove)
      window.removeEventListener('touchend', handleGlobalEnd)
      window.removeEventListener('mousemove', handleGlobalMove)
      window.removeEventListener('mouseup', handleGlobalEnd)
    }
  }, [isDragging])

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 game-interface"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none'
      }}
    >
      {/* Joystick - Positioned for DS-style controls area */}
      <div className="absolute bottom-4 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative bg-gray-800/80 border-2 border-purple-400 rounded-full mobile-joystick"
          style={{ 
            width: JOYSTICK_SIZE, 
            height: JOYSTICK_SIZE,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
            border: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const touch = e.touches[0]
            handleStart(touch.clientX, touch.clientY)
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleStart(e.clientX, e.clientY)
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Base circle */}
          <div 
            className="absolute inset-2 bg-purple-500/20 rounded-full" 
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'none'
            }}
          />
          
          {/* Knob */}
          <div
            className="absolute bg-purple-500 rounded-full border-2 border-white shadow-lg"
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              left: `calc(50% + ${knobPosition.x}px - ${KNOB_SIZE/2}px)`,
              top: `calc(50% + ${knobPosition.y}px - ${KNOB_SIZE/2}px)`,
              transition: isDragging ? 'none' : 'all 0.2s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'none'
            }}
          />
        </div>
        
        {/* Joystick Label */}
        <div className="mt-2 text-center">
          <span className="text-purple-300 font-mono text-xs">MOVE</span>
        </div>
      </div>

      {/* Shoot Button - Positioned for DS-style controls area */}
      <div className="absolute bottom-4 right-6 pointer-events-auto">
        <button
          className="w-24 h-24 bg-purple-900/50 hover:bg-purple-900/70 active:bg-purple-900/70 border-4 border-purple-300 rounded-full shadow-lg active:scale-95 transition-all mobile-shoot-button"
          style={{
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onShootStart) {
              onShootStart()
            } else {
              onShoot()
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onShootEnd) {
              onShootEnd()
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onShootStart) {
              onShootStart()
            } else {
              onShoot()
            }
          }}
          onMouseUp={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onShootEnd) {
              onShootEnd()
            }
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // Fallback for simple click if no start/end handlers
            if (!onShootStart && !onShootEnd) {
              onShoot()
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <div 
            className="text-white text-3xl font-bold"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              WebkitTouchCallout: 'none',
              pointerEvents: 'none'
            }}
          >🔮</div>
        </button>
        
        {/* Shoot Button Label */}
        <div className="mt-2 text-center">
          <span className="text-purple-300 font-mono text-xs">CAST</span>
        </div>
      </div>

     
    </div>
  )
} 