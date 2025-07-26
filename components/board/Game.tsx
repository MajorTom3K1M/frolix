"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Box, Typography, Button } from "@mui/material"
import Board from "@/components/board/Board";
import Tray from "@/components/tray/Tray";
import CustomDragLayer from "@/components/tile/TileDragLayer";
import { useMobile } from "@/hooks/useMobile"
import { MathTile, LetterTile } from "@/types/tiles"
import BoardActionButton from "../button/BoardActionButton"
import { RotateCcw, Shuffle } from "lucide-react"
import { SquareType } from "@/types/global"

const MATH_TILE_VALUES: Record<string, number> = {
  // Numbers 0-20
  '0': 1, '1': 1, '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 2, '8': 2, '9': 2,
  '10': 3, '11': 4, '12': 3, '13': 6, '14': 4, '15': 4, '16': 4, '17': 6, '18': 4, '19': 7, '20': 5,

  // Operators
  '+': 2, '-': 2, '±': 1, '×': 2, '÷': 2, '×/÷': 1, '=': 1,

  // Blank tiles
  'blank': 0,
}

// A-Math tile pool with exact distribution as specified
const createAMathTilePool = (): string[] => {
  const pool: string[] = []
  
  // Numbers
  pool.push(...Array(5).fill('0'))
  pool.push(...Array(6).fill('1')) 
  pool.push(...Array(6).fill('2'))
  pool.push(...Array(5).fill('3'))
  pool.push(...Array(5).fill('4'))
  pool.push(...Array(4).fill('5'))
  pool.push(...Array(4).fill('6'))
  pool.push(...Array(4).fill('7'))
  pool.push(...Array(4).fill('8'))
  pool.push(...Array(4).fill('9'))
  pool.push(...Array(2).fill('10'))
  pool.push(...Array(1).fill('11')) 
  pool.push(...Array(2).fill('12'))
  pool.push(...Array(1).fill('13'))
  pool.push(...Array(1).fill('14'))
  pool.push(...Array(1).fill('15'))
  pool.push(...Array(1).fill('16'))
  pool.push(...Array(1).fill('17'))
  pool.push(...Array(1).fill('18'))
  pool.push(...Array(1).fill('19'))
  pool.push(...Array(1).fill('20'))
  
  // Operators
  pool.push(...Array(4).fill('+'))
  pool.push(...Array(4).fill('-'))
  pool.push(...Array(5).fill('±'))
  pool.push(...Array(4).fill('×'))
  pool.push(...Array(4).fill('÷'))
  pool.push(...Array(4).fill('×/÷'))
  pool.push(...Array(11).fill('='))
  
  // Blank tiles
  pool.push(...Array(4).fill('blank'))
  
  return pool
}

const generateRandomMathTiles = (count: number): MathTile[] => {
  const tilePool = createAMathTilePool()
  const result: MathTile[] = []
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * tilePool.length)
    const symbol = tilePool.splice(randomIndex, 1)[0] // Remove from pool to avoid duplicates
    
    const getType = (sym: string): 'number' | 'operator' | 'equals' | 'blank' | 'dual' => {
      if (sym === 'blank') return 'blank'
      if (sym === '=') return 'equals'
      if (['±', '×/÷'].includes(sym)) return 'dual'
      if (['+', '-', '×', '÷'].includes(sym)) return 'operator'
      return 'number'
    }
    
    result.push({
      id: `tile-${i}-${Date.now()}-${Math.random()}`,
      symbol: symbol,
      value: MATH_TILE_VALUES[symbol],
      type: getType(symbol),
      isBlank: symbol === 'blank',
    })
  }
  return result
}

export default function AMathGame() {
  const isMobile = useMobile()
  const [score, setScore] = useState(0)
  const [trayTiles, setTrayTiles] = useState<MathTile[]>([])
  const [boardTiles, setBoardTiles] = useState<Record<string, MathTile & { position?: string }>>({})
  const [placedEquations, setPlacedEquations] = useState<any[]>([])
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null)

  useEffect(() => {
    setTrayTiles(generateRandomMathTiles(8))
  }, []);

  const handleTileDrop = useCallback((tile: MathTile & { position?: string }, newPosition: string) => {
    // 1) If this tile already lived on the board, remove it from its old cell
    setBoardTiles((prev) => {
      if (tile.position && prev[tile.position]) {
        const updated = { ...prev }
        delete updated[tile.position]
        return updated
      }
      return prev
    });

    // 2) If it lived in the tray (no `tile.position`), remove it from there
    if (!tile.position) {
      setTrayTiles((prev) => prev.filter((t) => t.id !== tile.id))
    }

    // 3) Finally, add it (or re‑add it) to the new board cell
    setBoardTiles((prev) => ({
      ...prev,
      [newPosition]: { ...tile, position: newPosition },
    }))
  }, [setTrayTiles, setBoardTiles]);

  const handleTrayTileDrop = useCallback((tile: (MathTile | LetterTile) & { position?: string }, index: number) => {
    if (tile.position) {
      setBoardTiles((prev) => {
        const updated = { ...prev };
        delete updated[tile.position as string];
        return updated;
      });
    }

    setTrayTiles((prev) => {
      const newTray = [...prev];
      const currentIndex = newTray.findIndex((t) => t.id === tile.id);
      const trayTile = { ...tile } as MathTile & { position?: string };
      if (trayTile.position) {
        delete trayTile.position;
      }
      if (currentIndex !== -1) {
        const temp = newTray[index];
        newTray[index] = trayTile;
        newTray[currentIndex] = temp;
      } else {
        newTray.splice(index, 0, trayTile);
      }
      return newTray;
    });
  }, [setTrayTiles, setBoardTiles]);

  useEffect(() => {
    detectEquationsAndUpdateScore()
  }, [boardTiles, draggingTileId])

  // Refill the tray with new tiles
  const refillTray = () => {
    const currentCount = trayTiles.length
    if (currentCount < 8) {
      const newTiles = generateRandomMathTiles(8 - currentCount)
      setTrayTiles((prev) => [...prev, ...newTiles])
    }
  }

  // Reset the game
  const resetGame = () => {
    setTrayTiles(generateRandomMathTiles(8))
    setBoardTiles({})
    setPlacedEquations([])
    setScore(0)
  }

  const getBoardSquareType = (position: string): SquareType => {
    const [row, col] = position.split('-').map(Number)
    const boardLayout = [
      ["te", "normal", "normal", "dt", "normal", "normal", "normal", "te", "normal", "normal", "normal", "dt", "normal", "normal", "te"],
      ["normal", "de", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "de", "normal"],
      ["normal", "normal", "de", "normal", "normal", "normal", "dt", "normal", "dt", "normal", "normal", "normal", "de", "normal", "normal"],
      ["dt", "normal", "normal", "de", "normal", "normal", "normal", "dt", "normal", "normal", "normal", "de", "normal", "normal", "dt"],
      ["normal", "normal", "normal", "normal", "de", "normal", "normal", "normal", "normal", "normal", "de", "normal", "normal", "normal", "normal"],
      ["normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal"],
      ["normal", "normal", "dt", "normal", "normal", "normal", "dt", "normal", "dt", "normal", "normal", "normal", "dt", "normal", "normal"],
      ["te", "normal", "normal", "dt", "normal", "normal", "normal", "star", "normal", "normal", "normal", "dt", "normal", "normal", "te"],
      ["normal", "normal", "dt", "normal", "normal", "normal", "dt", "normal", "dt", "normal", "normal", "normal", "dt", "normal", "normal"],
      ["normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal"],
      ["normal", "normal", "normal", "normal", "de", "normal", "normal", "normal", "normal", "normal", "de", "normal", "normal", "normal", "normal"],
      ["dt", "normal", "normal", "de", "normal", "normal", "normal", "dt", "normal", "normal", "normal", "de", "normal", "normal", "dt"],
      ["normal", "normal", "de", "normal", "normal", "normal", "dt", "normal", "dt", "normal", "normal", "normal", "de", "normal", "normal"],
      ["normal", "de", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "tt", "normal", "normal", "normal", "de", "normal"],
      ["te", "normal", "normal", "dt", "normal", "normal", "normal", "te", "normal", "normal", "normal", "dt", "normal", "normal", "te"]
    ]
    return (boardLayout[row]?.[col] || "normal") as SquareType
  }

  const calculateEquationScore = (tiles: MathTile[], positions: string[]): number => {
    let totalScore = 0
    let equationMultiplier = 1
    
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i]
      const position = positions[i]
      const squareType = getBoardSquareType(position)
      
      let tileScore = tile.value
      
      if (squareType === 'dt') { // Double Tile
        tileScore *= 2
      } else if (squareType === 'tt') { // Triple Tile
        tileScore *= 3
      }
      
      if (squareType === 'de') { // Double Equation
        equationMultiplier = Math.max(equationMultiplier, 2)
      } else if (squareType === 'te') { // Triple Equation
        equationMultiplier = Math.max(equationMultiplier, 3)
      }
      
      totalScore += tileScore
    }
    
    // Apply equation multiplier
    return totalScore * equationMultiplier
  }

  // Detect equations and calculate score (excluding currently dragging tile)
  const detectEquationsAndUpdateScore = () => {
    const positions = Object.keys(boardTiles)
    const visited = new Set<string>()
    const equations: any[] = []

    // Helper function to check if a position has a tile (excluding dragging tile)
    const hasTile = (pos: string) => {
      const tile = boardTiles[pos]
      return tile !== undefined && tile.id !== draggingTileId
    }

    // Helper function to evaluate a mathematical expression for A-Math
    const evaluateExpression = (expression: string): number | null => {
      try {
        // Handle A-Math operators and numbers 0-20
        let processed = expression
          .replace(/×/g, '*')  // Convert × to *
          .replace(/÷/g, '/')  // Convert ÷ to /
          .replace(/\s+/g, '') // Remove spaces
        
        // Handle dual operators (±, ×/÷) by resolving them to their chosen values
        // For now, we'll need to handle this in the tile placement logic
        
        // Validate only allowed characters: numbers 0-20, +, -, *, /, (, )
        if (!/^[0-9+\-*/().]+$/.test(processed)) return null
        
        // Additional validation for numbers up to 20
        const numberMatches = processed.match(/\d+/g)
        if (numberMatches) {
          for (const num of numberMatches) {
            if (parseInt(num) > 20) return null
          }
        }
        
        // Use Function constructor for safe evaluation
        const result = new Function(`"use strict"; return (${processed})`)()
        return typeof result === 'number' && !isNaN(result) ? result : null
      } catch {
        return null
      }
    }

    // Check if an equation string is valid (has = and both sides evaluate correctly)
    const isValidEquation = (equationStr: string): boolean => {
      const parts = equationStr.split('=')
      if (parts.length < 2) return false
      
      try {
        const leftSide = evaluateExpression(parts[0].trim())
        const rightSide = evaluateExpression(parts[1].trim())
        
        if (leftSide === null || rightSide === null) return false
        return Math.abs(leftSide - rightSide) < 0.0001 // Handle floating point precision
      } catch {
        return false
      }
    }

    // First, try to find horizontal equations
    for (let row = 0; row < 15; row++) {
      let currentEquation: any = null

      for (let col = 0; col < 15; col++) {
        const pos = `${row}-${col}`

        if (hasTile(pos) && !visited.has(pos)) {
          const tile = boardTiles[pos]
          if (!currentEquation) {
            currentEquation = {
              tiles: [tile],
              positions: [pos],
              score: 0,
              isHorizontal: true,
              expression: tile.symbol,
            }
          } else {
            currentEquation.tiles.push(tile)
            currentEquation.positions.push(pos)
            currentEquation.expression += tile.symbol
          }
          visited.add(pos)
        } else if (!hasTile(pos) && currentEquation) {
          // End of equation
          if (currentEquation.tiles.length >= 3 && isValidEquation(currentEquation.expression)) {
            currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions)
            currentEquation.isValid = true
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3 && isValidEquation(currentEquation.expression)) {
        currentEquation.score = currentEquation.tiles.reduce((sum: number, tile: MathTile) => sum + tile.value, 0)
        currentEquation.isValid = true
        equations.push(currentEquation)
      }
    }

    visited.clear()

    // Then, find vertical equations
    for (let col = 0; col < 15; col++) {
      let currentEquation: any = null

      for (let row = 0; row < 15; row++) {
        const pos = `${row}-${col}`

        if (hasTile(pos) && !visited.has(pos)) {
          const tile = boardTiles[pos]
          if (!currentEquation) {
            currentEquation = {
              tiles: [tile],
              positions: [pos],
              score: 0,
              isHorizontal: false,
              expression: tile.symbol,
            }
          } else {
            currentEquation.tiles.push(tile)
            currentEquation.positions.push(pos)
            currentEquation.expression += tile.symbol
          }
          visited.add(pos)
        } else if (!hasTile(pos) && currentEquation) {
          // End of equation
          if (currentEquation.tiles.length >= 3 && isValidEquation(currentEquation.expression)) {
            currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions)
            currentEquation.isValid = true
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3 && isValidEquation(currentEquation.expression)) {
        currentEquation.score = currentEquation.tiles.reduce((sum: number, tile: MathTile) => sum + tile.value, 0)
        currentEquation.isValid = true
        equations.push(currentEquation)
      }
    }

    setPlacedEquations(equations)

    // Calculate total score
    const totalScore = equations.reduce((sum, eq) => sum + eq.score, 0)
    setScore(totalScore)
  }

  // Handle drag start to track dragging tile
  const handleDragStart = useCallback((tileId: string) => {
    setDraggingTileId(tileId)
  }, [])

  // Handle drag end to stop tracking dragging tile
  const handleDragEnd = useCallback(() => {
    setDraggingTileId(null)
  }, [])

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <CustomDragLayer />
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
            borderRadius: 2,
            bgcolor: "#f5f5f5",
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Score: {score}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={refillTray}>
              Refill Tray
            </Button>
            <Button variant="outlined" color="secondary" onClick={resetGame}>
              Reset Game
            </Button>
          </Box>
        </Box>

        <Board 
          boardTiles={boardTiles} 
          onTileDrop={handleTileDrop} 
          placedWords={placedEquations} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Shuffle */}
          <BoardActionButton
            // onClick={handleShuffleTiles}
            icon={<Shuffle size={20} />}
            ariaLabel="Shuffle tiles"
          />

          <Box sx={{ textAlign: "center" }}>
            <Tray 
              tiles={trayTiles} 
              onTileDrop={handleTrayTileDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </Box>

          {/* Clear / Undo */}
          <BoardActionButton
            // onClick={handleClearBoard}
            // disabled={currentTurnTiles.length === 0}
            icon={<RotateCcw size={20} />}
            ariaLabel="Clear board"
          />
        </Box>
      </Box>
    </DndProvider>
  )
}
