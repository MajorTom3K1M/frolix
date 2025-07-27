"use client"

import { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Box, Typography, Button } from "@mui/material"

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
  const [currentTurn, setCurrentTurn] = useState(1)
  const [players, setPlayers] = useState<(Player & { tiles: any[] })[]>([
    { id: 1, name: "Player 1", score: 0, isActive: false, tiles: [] },
    { id: 2, name: "Player 2", score: 0, isActive: false, tiles: [] },
  ])

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
            currentEquation.score = isValid ? calculateEquationScore(currentEquation.tiles, currentEquation.positions) : 0
            currentEquation.isValid = isValid
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3) {
        const isValid = isValidEquation(currentEquation.tiles)
        currentEquation.score = isValid ? calculateEquationScore(currentEquation.tiles, currentEquation.positions) : 0
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
            currentEquation.score = isValid ? calculateEquationScore(currentEquation.tiles, currentEquation.positions) : 0
            currentEquation.isValid = isValid
            equations.push(currentEquation)
          }
          currentEquation = null
        }
      }

      // Check if equation ends at the edge of the board
      if (currentEquation && currentEquation.tiles.length >= 3) {
        const isValid = isValidEquation(currentEquation.tiles)
        currentEquation.score = isValid ? calculateEquationScore(currentEquation.tiles, currentEquation.positions) : 0
        currentEquation.isValid = isValid
        equations.push(currentEquation)
      }
    }

    setPlacedEquations(equations)

    // Calculate total score (only valid equations)
    const totalScore = equations.filter(eq => eq.isValid).reduce((sum, eq) => sum + eq.score, 0)
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

        {/* Scoreboard */}
        <Box sx={{ minWidth: 300 }}>
          <Scoreboard players={players} currentTurn={currentTurn} />
        </Box>
      </Box>
    </DndProvider>
  )
}
