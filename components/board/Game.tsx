"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Box, Typography, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material"

import Board from "@/components/board/Board";
import Tray from "@/components/tray/Tray";
import CustomDragLayer from "@/components/tile/TileDragLayer";
import BoardActionButton from "@/components/button/BoardActionButton"
import Scoreboard from "@/components/scoreboard/Scoreboard"

import { useMobile } from "@/hooks/useMobile"
import { MathTile, LetterTile } from "@/types/tiles"
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

const generateRandomMathTiles = (count: number, fromPool?: string[]): MathTile[] => {
  const tilePool = fromPool ? [...fromPool] : createAMathTilePool()
  const result: MathTile[] = []

  for (let i = 0; i < count && tilePool.length > 0; i++) {
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
  const [trayTiles, setTrayTiles] = useState<(MathTile | null)[]>(Array(8).fill(null))
  const [boardTiles, setBoardTiles] = useState<Record<string, MathTile & { position?: string }>>({})
  const [placedEquations, setPlacedEquations] = useState<any[]>([])
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null)
  const [currentTurn, setCurrentTurn] = useState(1)
  const [turnHistory, setTurnHistory] = useState<Array<{
    turn: number
    player: string
    equation: string
    score: number
    timestamp: Date
  }>>([])
  const [tilePool, setTilePool] = useState<string[]>([])
  const [players, setPlayers] = useState<Array<{
    id: number
    name: string
    score: number
    isActive: boolean
    passCount: number
  }>>([
    { id: 1, name: "Player 1", score: 0, isActive: true, passCount: 0 },
    { id: 2, name: "Player 2", score: 0, isActive: false, passCount: 0 },
  ])
  const [selectedTilesForSwap, setSelectedTilesForSwap] = useState<string[]>([])
  const [isSwapMode, setIsSwapMode] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [currentTurnTiles, setCurrentTurnTiles] = useState<string[]>([])
  const [gameMessage, setGameMessage] = useState<string>('')
  const [hasPlacedTileThisTurn, setHasPlacedTileThisTurn] = useState(false)
  const [isFirstMove, setIsFirstMove] = useState(true)

  useEffect(() => {
    const initialPool = createAMathTilePool()
    setTilePool(initialPool)
    const newTiles = generateRandomMathTiles(8, initialPool)
    setTrayTiles(newTiles)
    // Update tile pool to reflect drawn tiles
    const usedSymbols = newTiles.map(tile => tile.symbol)
    const updatedPool = [...initialPool]
    for (const symbol of usedSymbols) {
      const index = updatedPool.indexOf(symbol)
      if (index > -1) updatedPool.splice(index, 1)
    }
    setTilePool(updatedPool)
    setGameMessage('Player 1\'s turn - Choose an action: Swap, Submit, Pass, or Resign')
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

    // 2) If it lived in the tray (no `tile.position`), remove it from there but maintain fixed positions
    if (!tile.position) {
      setTrayTiles((prev) => {
        const newTray = [...prev]
        const tileIndex = newTray.findIndex((t) => t && t.id === tile.id)
        if (tileIndex !== -1) {
          newTray[tileIndex] = null // Leave empty slot instead of removing
        }
        return newTray
      })
      // Track that a tile was placed from tray this turn
      setHasPlacedTileThisTurn(true)
      setCurrentTurnTiles(prev => [...prev, tile.id])
    }

    // 3) Finally, add it (or re‑add it) to the new board cell
    setBoardTiles((prev) => ({
      ...prev,
      [newPosition]: { ...tile, position: newPosition },
    }))
  }, [setTrayTiles, setBoardTiles]);

  const handleTrayTileDrop = useCallback((tile: (MathTile | LetterTile) & { position?: string }, index: number) => {
    // Remove tile from board if it came from there
    if (tile.position) {
      setBoardTiles((prev) => {
        const updated = { ...prev };
        delete updated[tile.position as string];
        return updated;
      });
    }

    setTrayTiles((prev) => {
      const newTray = [...prev];
      const currentIndex = newTray.findIndex((t) => t && t.id === tile.id);
      const trayTile = { ...tile } as MathTile & { position?: string };
      if (trayTile.position) {
        delete trayTile.position;
      }
      
      // If tile is already in tray, remove it from current position
      if (currentIndex !== -1) {
        newTray[currentIndex] = null;
      }
      
      // Place tile at exact drop position
      newTray[index] = trayTile;
      return newTray;
    });
  }, [setTrayTiles, setBoardTiles]);

  useEffect(() => {
    detectEquationsAndUpdateScore()
  }, [boardTiles, draggingTileId])

  // Switch to next player
  const switchTurn = () => {
    const nextTurn = currentTurn === 1 ? 2 : 1
    setCurrentTurn(nextTurn)
    setPlayers(prev => prev.map(player => ({
      ...player,
      isActive: player.id === nextTurn
    })))
    setHasPlacedTileThisTurn(false)
    setCurrentTurnTiles([])
    setGameMessage(`Player ${nextTurn}'s turn - Choose an action: Swap, Submit, Pass, or Resign`)
  }

  // Add turn to history
  const addTurnToHistory = (equation: string, scoreEarned: number) => {
    const newTurn = {
      turn: turnHistory.length + 1,
      player: `Player ${currentTurn}`,
      equation: equation,
      score: scoreEarned,
      timestamp: new Date()
    }
    setTurnHistory(prev => [...prev, newTurn])
  }

  // Check if placement is valid for first move or subsequent moves
  const isValidPlacement = (newTiles: Record<string, MathTile & { position?: string }>): { valid: boolean, message: string } => {
    const positions = Object.keys(newTiles)
    
    if (positions.length === 0) {
      return { valid: false, message: 'Place at least one tile on the board' }
    }

    // Check if tiles are in a straight line
    const rows = positions.map(pos => parseInt(pos.split('-')[0]))
    const cols = positions.map(pos => parseInt(pos.split('-')[1]))
    
    const isHorizontal = rows.every(row => row === rows[0])
    const isVertical = cols.every(col => col === cols[0])
    
    if (!isHorizontal && !isVertical) {
      return { valid: false, message: 'All newly placed tiles must be in a straight line' }
    }

    // Check for gaps in the line
    if (isHorizontal) {
      const sortedCols = cols.sort((a, b) => a - b)
      for (let i = 1; i < sortedCols.length; i++) {
        if (sortedCols[i] - sortedCols[i-1] > 1) {
          // Check if there are existing tiles filling the gap
          for (let col = sortedCols[i-1] + 1; col < sortedCols[i]; col++) {
            const gapPos = `${rows[0]}-${col}`
            if (!boardTiles[gapPos]) {
              return { valid: false, message: 'No gaps allowed between tiles in an equation' }
            }
          }
        }
      }
    } else {
      const sortedRows = rows.sort((a, b) => a - b)
      for (let i = 1; i < sortedRows.length; i++) {
        if (sortedRows[i] - sortedRows[i-1] > 1) {
          // Check if there are existing tiles filling the gap
          for (let row = sortedRows[i-1] + 1; row < sortedRows[i]; row++) {
            const gapPos = `${row}-${cols[0]}`
            if (!boardTiles[gapPos]) {
              return { valid: false, message: 'No gaps allowed between tiles in an equation' }
            }
          }
        }
      }
    }

    // First move must cover center star (7-7)
    if (isFirstMove) {
      if (!positions.includes('7-7')) {
        return { valid: false, message: 'First move must cover the center star' }
      }
    } else {
      // Subsequent moves must touch at least one existing tile
      let touchesExisting = false
      for (const pos of positions) {
        const [row, col] = pos.split('-').map(Number)
        const adjacentPositions = [
          `${row-1}-${col}`, `${row+1}-${col}`,
          `${row}-${col-1}`, `${row}-${col+1}`
        ]
        for (const adjPos of adjacentPositions) {
          if (boardTiles[adjPos] && !positions.includes(adjPos)) {
            touchesExisting = true
            break
          }
        }
        if (touchesExisting) break
      }
      if (!touchesExisting) {
        return { valid: false, message: 'New tiles must connect to existing tiles on the board' }
      }
    }

    return { valid: true, message: '' }
  }

  // Toggle tile selection for swap
  const toggleTileSelection = (tileId: string) => {
    setSelectedTilesForSwap(prev => 
      prev.includes(tileId) 
        ? prev.filter(id => id !== tileId)
        : [...prev, tileId]
    )
  }

  // Swap selected tiles
  const handleSwapTiles = () => {
    if (selectedTilesForSwap.length === 0 || tilePool.length < 5) {
      setGameMessage('Cannot swap: need at least 5 tiles in bag and tiles selected')
      return
    }

    // Get selected tiles and their symbols
    const tilesToSwap = selectedTilesForSwap.map(tileId => 
      trayTiles.find(tile => tile && tile.id === tileId)
    ).filter(Boolean) as MathTile[]

    // Add selected tile symbols back to pool
    const updatedPool = [...tilePool]
    tilesToSwap.forEach(tile => {
      updatedPool.push(tile.symbol)
    })

    // Remove selected tiles from tray
    setTrayTiles(prev => {
      const newTray = [...prev]
      selectedTilesForSwap.forEach(tileId => {
        const index = newTray.findIndex(tile => tile && tile.id === tileId)
        if (index !== -1) {
          newTray[index] = null
        }
      })
      return newTray
    })

    // Draw new tiles
    const newTiles = generateRandomMathTiles(tilesToSwap.length, updatedPool)
    const finalPool = [...updatedPool]
    newTiles.forEach(tile => {
      const index = finalPool.indexOf(tile.symbol)
      if (index > -1) finalPool.splice(index, 1)
    })

    // Place new tiles in tray
    setTrayTiles(prev => {
      const newTray = [...prev]
      let tileIndex = 0
      for (let i = 0; i < newTray.length && tileIndex < newTiles.length; i++) {
        if (newTray[i] === null) {
          newTray[i] = newTiles[tileIndex]
          tileIndex++
        }
      }
      return newTray
    })

    setTilePool(finalPool)
    setSelectedTilesForSwap([])
    setIsSwapMode(false)
    
    // Reset player pass counts when action is taken
    setPlayers(prev => prev.map(player => ({ ...player, passCount: 0 })))
    
    // Add to turn history and switch turn
    addTurnToHistory(`Swapped ${tilesToSwap.length} tiles`, 0)
    switchTurn()
  }

  // Submit equation functionality
  const handleSubmitEquation = () => {
    // Check if player has placed at least one new tile this turn
    if (!hasPlacedTileThisTurn) {
      setGameMessage('You must place at least one new tile before submitting!')
      return
    }

    // Get only the tiles placed this turn
    const newlyPlacedTiles: Record<string, MathTile & { position?: string }> = {}
    currentTurnTiles.forEach(tileId => {
      const position = Object.keys(boardTiles).find(pos => boardTiles[pos].id === tileId)
      if (position) {
        newlyPlacedTiles[position] = boardTiles[position]
      }
    })

    // Validate placement
    const placementCheck = isValidPlacement(newlyPlacedTiles)
    if (!placementCheck.valid) {
      setGameMessage(placementCheck.message)
      return
    }

    // Check if equations formed are mathematically valid
    const currentEquations = [...placedEquations]
    
    // Find equations that include newly placed tiles
    const validEquationsFormed = currentEquations.filter(eq => {
      return eq.positions.some((pos: string) => Object.keys(newlyPlacedTiles).includes(pos))
    })

    if (validEquationsFormed.length === 0) {
      setGameMessage('No valid equations found. Try again or choose another action.')
      return
    }

    // Check mathematical validity
    const hasValidEquation = validEquationsFormed.some((eq: any) => eq.isValid)
    if (!hasValidEquation) {
      setGameMessage('Invalid equation! The equation must be mathematically correct. Try again or choose another action.')
      return
    }

    // Calculate score for this turn
    const turnScore = validEquationsFormed.reduce((sum: number, eq: any) => sum + eq.score, 0)
    
    // Update player score
    setPlayers(prev => prev.map(player => 
      player.id === currentTurn 
        ? { ...player, score: player.score + turnScore, passCount: 0 }
        : { ...player, passCount: 0 }
    ))

    // Add to turn history
    const equationStrings = validEquationsFormed.map((eq: any) => eq.expression).join(', ')
    addTurnToHistory(equationStrings, turnScore)
    
    // Refill tray and mark first move as complete
    refillTray()
    setIsFirstMove(false)
    setGameMessage(`Equation submitted! Player ${currentTurn} scored ${turnScore} points.`)
    
    // Switch turn
    switchTurn()
  }

  // Pass turn functionality
  const handlePass = () => {
    // Update current player's pass count
    setPlayers(prev => prev.map(player => 
      player.id === currentTurn 
        ? { ...player, passCount: player.passCount + 1 }
        : player
    ))
    
    // Check if both players have passed 3 times each consecutively
    const updatedPlayers = players.map(player => 
      player.id === currentTurn 
        ? { ...player, passCount: player.passCount + 1 }
        : player
    )
    
    const allPlayersPassedThrice = updatedPlayers.every(player => player.passCount >= 3)
    
    if (allPlayersPassedThrice) {
      setGameEnded(true)
      addTurnToHistory("Game ended - both players passed 3 times", 0)
      setGameMessage('Game ended: Both players passed 3 times consecutively')
    } else {
      addTurnToHistory("Passed turn", 0)
      setGameMessage(`Player ${currentTurn} passed their turn`)
      switchTurn()
    }
  }

  // Resign functionality
  const handleResign = () => {
    setGameEnded(true)
    addTurnToHistory(`Player ${currentTurn} resigned`, 0)
    setGameMessage(`Player ${currentTurn} resigned. Player ${currentTurn === 1 ? 2 : 1} wins!`)
  }

  // Refill the tray with new tiles
  const refillTray = () => {
    const emptySlots = trayTiles.filter(tile => tile === null).length
    if (emptySlots > 0 && tilePool.length > 0) {
      const tilesToDraw = Math.min(emptySlots, tilePool.length)
      const newTiles = generateRandomMathTiles(tilesToDraw, tilePool)
      
      setTrayTiles((prev) => {
        const newTray = [...prev]
        let tileIndex = 0
        // Fill empty slots from left to right
        for (let i = 0; i < newTray.length && tileIndex < newTiles.length; i++) {
          if (newTray[i] === null) {
            newTray[i] = newTiles[tileIndex]
            tileIndex++
          }
        }
        return newTray
      })
      
      // Update tile pool
      const usedSymbols = newTiles.map(tile => tile.symbol)
      setTilePool(prev => {
        const updatedPool = [...prev]
        for (const symbol of usedSymbols) {
          const index = updatedPool.indexOf(symbol)
          if (index > -1) updatedPool.splice(index, 1)
        }
        return updatedPool
      })
    }
  }

  // Reset the game
  const resetGame = () => {
    const initialPool = createAMathTilePool()
    setTilePool(initialPool)
    const newTiles = generateRandomMathTiles(8, initialPool)
    
    // Create fixed 8-position array with tiles
    const trayArray: (MathTile | null)[] = Array(8).fill(null)
    newTiles.forEach((tile, index) => {
      trayArray[index] = tile
    })
    setTrayTiles(trayArray)
    
    // Update tile pool to reflect drawn tiles
    const usedSymbols = newTiles.map(tile => tile.symbol)
    const updatedPool = [...initialPool]
    for (const symbol of usedSymbols) {
      const index = updatedPool.indexOf(symbol)
      if (index > -1) updatedPool.splice(index, 1)
    }
    setTilePool(updatedPool)
    
    setBoardTiles({})
    setPlacedEquations([])
    setScore(0)
    setTurnHistory([])
    setSelectedTilesForSwap([])
    setIsSwapMode(false)
    setGameEnded(false)
    setCurrentTurn(1)
    setPlayers([
      { id: 1, name: "Player 1", score: 0, isActive: true, passCount: 0 },
      { id: 2, name: "Player 2", score: 0, isActive: false, passCount: 0 },
    ])
    setCurrentTurnTiles([])
    setHasPlacedTileThisTurn(false)
    setIsFirstMove(true)
    setGameMessage('Player 1\'s turn - Choose an action: Swap, Submit, Pass, or Resign')
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
        // Handle A-Math operators and concatenated digits
        let processed = expression
          .replace(/×/g, '*')  // Convert × to *
          .replace(/÷/g, '/')  // Convert ÷ to /
          .replace(/\s+/g, '') // Remove spaces

        // Handle leading zeros in numbers (05 -> 5, but keep single 0)
        processed = processed.replace(/\b0+(\d+)/g, '$1') // Remove leading zeros from multi-digit numbers
        processed = processed.replace(/\b0+(?=\D|$)/g, '0') // Keep standalone zeros

        // Validate only allowed characters: numbers, +, -, *, /, (, )
        if (!/^[0-9+\-*/().]+$/.test(processed)) return null

        // Check for division by zero
        if (/\/0(?!\d)/.test(processed)) return null

        // Additional validation: no numbers greater than reasonable concatenated digits
        // Allow larger numbers since we can concatenate (e.g., 123 from tiles 1,2,3)
        const numberMatches = processed.match(/\d+/g)
        if (numberMatches) {
          for (const num of numberMatches) {
            // Allow numbers up to reasonable concatenated values (e.g., up to 999)
            if (parseInt(num) > 999) return null
          }
        }

        // Use Function constructor for safe evaluation
        const result = new Function(`"use strict"; return (${processed})`)()
        
        // Check if result is a valid number (not NaN, not Infinity)
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) return null
        
        return result
      } catch {
        return null
      }
    }

    // Generate all possible combinations for an expression with blanks, dual operators, and digit concatenation
    const generateExpressionCombinations = (tiles: MathTile[]): string[] => {
      const combinations: string[] = ['']

      for (const tile of tiles) {
        const newCombinations: string[] = []

        if (tile.symbol === 'blank') {
          // Blank can be any symbol: 0-9, +, -, ×, ÷, =
          const possibleSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '×', '÷', '=']
          for (const combo of combinations) {
            for (const symbol of possibleSymbols) {
              newCombinations.push(combo + symbol)
            }
          }
        } else if (tile.symbol === '±') {
          // ± can be either + or -
          for (const combo of combinations) {
            newCombinations.push(combo + '+')
            newCombinations.push(combo + '-')
          }
        } else if (tile.symbol === '×/÷') {
          // ×/÷ can be either × or ÷
          for (const combo of combinations) {
            newCombinations.push(combo + '×')
            newCombinations.push(combo + '÷')
          }
        } else {
          // Regular tile - multi-digit tiles (10-20) stay as single units, only 0-9 can be concatenated
          for (const combo of combinations) {
            newCombinations.push(combo + tile.symbol)
          }
        }

        combinations.length = 0
        combinations.push(...newCombinations)
      }

      // Now generate all possible digit concatenations from the base combinations
      const allPossibleExpressions = new Set<string>()
      
      for (const expression of combinations) {
        // Generate all possible ways to concatenate consecutive digits
        const concatenatedVersions = generateDigitConcatenations(expression)
        concatenatedVersions.forEach(version => allPossibleExpressions.add(version))
      }

      return Array.from(allPossibleExpressions)
    }

    // Generate all possible digit concatenations for a given expression
    // Only single digits (0-9) can be concatenated, multi-digit numbers (10-20) stay as units
    const generateDigitConcatenations = (expression: string): string[] => {
      const results = new Set<string>()
      results.add(expression) // Always include the original

      // Parse the expression into tokens (numbers and operators)
      const tokens: string[] = []
      let currentToken = ''
      
      for (let i = 0; i < expression.length; i++) {
        const char = expression[i]
        if (/[+\-×÷=]/.test(char)) {
          if (currentToken) {
            tokens.push(currentToken)
            currentToken = ''
          }
          tokens.push(char)
        } else {
          currentToken += char
        }
      }
      if (currentToken) {
        tokens.push(currentToken)
      }

      // Find positions where single digits can be concatenated
      const concatenationPoints: number[] = []
      for (let i = 0; i < tokens.length - 1; i++) {
        const current = tokens[i]
        const next = tokens[i + 1]
        
        // Only concatenate if both are single digits (0-9)
        if (/^[0-9]$/.test(current) && /^[0-9]$/.test(next)) {
          concatenationPoints.push(i)
        }
      }

      // Generate all possible combinations of concatenations
      const numPoints = concatenationPoints.length
      for (let mask = 0; mask < (1 << numPoints); mask++) {
        const newTokens = [...tokens]
        const toRemove: number[] = []

        // Apply concatenations based on mask
        for (let i = 0; i < numPoints; i++) {
          if (mask & (1 << i)) {
            const pos = concatenationPoints[i]
            // Concatenate token at pos with token at pos+1
            newTokens[pos] = newTokens[pos] + newTokens[pos + 1]
            toRemove.push(pos + 1)
          }
        }

        // Remove concatenated tokens (in reverse order to maintain indices)
        toRemove.sort((a, b) => b - a)
        for (const index of toRemove) {
          newTokens.splice(index, 1)
        }

        const result = newTokens.join('')
        if (isValidConcatenatedExpression(result)) {
          results.add(result)
        }
      }

      return Array.from(results)
    }

    // Validate a concatenated expression
    const isValidConcatenatedExpression = (expression: string): boolean => {
      // Split by operators to get numbers
      const numbers = expression.split(/[+\-×÷=]/)
      
      for (const num of numbers) {
        const trimmed = num.trim()
        if (trimmed === '') continue
        
        // Check for invalid patterns
        if (trimmed === '00') return false // Cannot form 00
        if (trimmed.length > 1 && trimmed.startsWith('0') && trimmed !== '0') {
          // Leading zeros are allowed in A-Math (05 = 5), so this is actually valid
          continue
        }
      }
      
      return true
    }

    // Check if an equation string is valid (has = and both sides evaluate correctly)
    const isValidEquation = (tiles: MathTile[]): boolean => {
      const expressions = generateExpressionCombinations(tiles)

      for (const expression of expressions) {
        const parts = expression.split('=')
        if (parts.length < 2) continue

        try {
          const leftSide = evaluateExpression(parts[0].trim())
          const rightSide = evaluateExpression(parts[1].trim())

          if (leftSide !== null && rightSide !== null) {
            if (Math.abs(leftSide - rightSide) < 0.0001) { // Handle floating point precision
              return true
            }
          }
        } catch {
          continue
        }
      }

      return false
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
          if (currentEquation.tiles.length >= 3) {
            const isValid = isValidEquation(currentEquation.tiles)
            currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions) // Always calculate score
            currentEquation.isValid = isValid
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3) {
        const isValid = isValidEquation(currentEquation.tiles)
        currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions) // Always calculate score
        currentEquation.isValid = isValid
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
          if (currentEquation.tiles.length >= 3) {
            const isValid = isValidEquation(currentEquation.tiles)
            currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions) // Always calculate score
            currentEquation.isValid = isValid
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3) {
        const isValid = isValidEquation(currentEquation.tiles)
        currentEquation.score = calculateEquationScore(currentEquation.tiles, currentEquation.positions) // Always calculate score
        currentEquation.isValid = isValid
        equations.push(currentEquation)
      }
    }

    setPlacedEquations(equations)

    // Calculate total score (all equations regardless of correctness)
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
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
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
                isSwapMode={isSwapMode}
                selectedTiles={selectedTilesForSwap}
                onTileSelect={toggleTileSelection}
              />
              
              {/* Game Status Message */}
              {gameMessage && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    p: 1, 
                    bgcolor: 'info.light', 
                    color: 'info.contrastText',
                    borderRadius: 1,
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  {gameMessage}
                </Typography>
              )}
              
              {/* Current Player Indicator */}
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 1, 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {players.find(p => p.isActive)?.name}'s Turn
              </Typography>
              
              {/* Game Action Buttons */}
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsSwapMode(!isSwapMode)}
                  sx={{ 
                    bgcolor: isSwapMode ? "primary.light" : "transparent",
                    color: isSwapMode ? "white" : "primary.main"
                  }}
                >
                  {isSwapMode ? "Cancel Swap" : "Swap Tiles"}
                </Button>
                
                {isSwapMode && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSwapTiles}
                    disabled={selectedTilesForSwap.length === 0 || tilePool.length < 5}
                    sx={{ bgcolor: "warning.main" }}
                  >
                    Confirm Swap ({selectedTilesForSwap.length})
                  </Button>
                )}
                
                {!isSwapMode && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSubmitEquation}
                      disabled={Object.keys(boardTiles).length === 0}
                      sx={{ bgcolor: "success.main" }}
                    >
                      Submit Equation
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handlePass}
                      sx={{ color: "text.secondary" }}
                    >
                      Pass
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleResign}
                      sx={{ color: "error.main", borderColor: "error.main" }}
                    >
                      Resign
                    </Button>
                  </>
                )}
              </Box>
              
              {/* Game Status Messages */}
              {isSwapMode && (
                <Alert severity="info" sx={{ mt: 1, maxWidth: 400, mx: "auto" }}>
                  Click tiles to select for swapping. Need at least 5 tiles in bag.
                </Alert>
              )}
              
              {tilePool.length < 5 && (
                <Alert severity="warning" sx={{ mt: 1, maxWidth: 400, mx: "auto" }}>
                  Less than 5 tiles remaining - cannot swap tiles.
                </Alert>
              )}
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

        {/* Scoreboard */}
        <Box sx={{ minWidth: 300 }}>
          <Scoreboard 
            players={players.map(p => ({ ...p, tiles: [] }))} 
            currentTurn={currentTurn}
            turnHistory={turnHistory}
            tilesInBag={tilePool.length}
          />
        </Box>
      </Box>
      
      {/* Game End Dialog */}
      <Dialog open={gameEnded} maxWidth="sm" fullWidth>
        <DialogTitle>Game Over</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The game has ended!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Final Scores:</Typography>
            {players.map(player => (
              <Typography key={player.id} variant="body1" sx={{
                fontWeight: player.score === Math.max(...players.map(p => p.score)) ? 'bold' : 'normal',
                color: player.score === Math.max(...players.map(p => p.score)) ? 'success.main' : 'inherit'
              }}>
                {player.name}: {player.score} points {player.score === Math.max(...players.map(p => p.score)) && '🏆'}
              </Typography>
            ))}
          </Box>
          {players.every(p => p.passCount >= 3) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Game ended: Both players passed 3 times consecutively.
            </Alert>
          )}
          {turnHistory.some(turn => turn.equation.includes('resigned')) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Game ended due to resignation.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setGameEnded(false)
            resetGame()
          }} variant="contained">
            New Game
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  )
}
