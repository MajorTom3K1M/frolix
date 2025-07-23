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
import { LetterTile } from "@/types/tiles"
import BoardActionButton from "../button/BoardActionButton"
import { RotateCcw, Shuffle } from "lucide-react"

const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
}

// Generate a random set of 7 letters
const generateRandomLetters = (count: number) => {
  const letters = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ"
  const result = []
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length)
    result.push({
      id: `tile-${i}-${Date.now()}`,
      letter: letters[randomIndex],
      value: LETTER_VALUES[letters[randomIndex]],
    })
  }
  return result
}

export default function ScrabbleGame() {
  const isMobile = useMobile()
  const [score, setScore] = useState(0)
  const [trayTiles, setTrayTiles] = useState<any[]>([])
  const [boardTiles, setBoardTiles] = useState<Record<string, any>>({})
  const [placedWords, setPlacedWords] = useState<any[]>([])

  // Initialize the tray with random letters
  useEffect(() => {
    setTrayTiles(generateRandomLetters(7))
  }, []);

  const handleTileDrop = useCallback((tile: LetterTile & { position?: string }, newPosition: string) => {
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

  const handleTrayTileDrop = useCallback((tile: LetterTile & { position?: string }, index: number) => {
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
      const trayTile = { ...tile } as LetterTile & { position?: string };
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
    detectWordsAndUpdateScore()
  }, [boardTiles])

  // Refill the tray with new tiles
  const refillTray = () => {
    const currentCount = trayTiles.length
    if (currentCount < 7) {
      const newTiles = generateRandomLetters(7 - currentCount)
      setTrayTiles((prev) => [...prev, ...newTiles])
    }
  }

  // Reset the game
  const resetGame = () => {
    setTrayTiles(generateRandomLetters(7))
    setBoardTiles({})
    setPlacedWords([])
    setScore(0)
  }

  // Detect words and calculate score
  const detectWordsAndUpdateScore = () => {
    const positions = Object.keys(boardTiles)
    const visited = new Set<string>()
    const words: any[] = []

    // Helper function to check if a position has a tile
    const hasTile = (pos: string) => boardTiles[pos] !== undefined

    // Helper function to get adjacent positions
    const getAdjacent = (pos: string) => {
      const [row, col] = pos.split("-").map(Number)
      return [
        `${row}-${col + 1}`, // right
        `${row}-${col - 1}`, // left
        `${row + 1}-${col}`, // down
        `${row - 1}-${col}`, // up
      ]
    }

    // First, try to find horizontal words
    for (let row = 0; row < 15; row++) {
      let currentWord: any = null

      for (let col = 0; col < 15; col++) {
        const pos = `${row}-${col}`

        if (hasTile(pos) && !visited.has(pos)) {
          if (!currentWord) {
            currentWord = {
              tiles: [boardTiles[pos]],
              positions: [pos],
              score: 0,
              isHorizontal: true,
            }
          } else {
            currentWord.tiles.push(boardTiles[pos])
            currentWord.positions.push(pos)
          }
          visited.add(pos)
        } else if (!hasTile(pos) && currentWord) {
          // End of word
          if (currentWord.tiles.length >= 2) {
            currentWord.score = currentWord.tiles.reduce((sum: number, tile: any) => sum + tile.value, 0)
            words.push(currentWord)
          }
          currentWord = null
        }
      }

      // Check if word ends at the edge of the board
      if (currentWord && currentWord.tiles.length >= 2) {
        currentWord.score = currentWord.tiles.reduce((sum: number, tile: any) => sum + tile.value, 0)
        words.push(currentWord)
      }
    }

    visited.clear()

    // Then, find vertical words
    for (let col = 0; col < 15; col++) {
      let currentWord: any = null

      for (let row = 0; row < 15; row++) {
        const pos = `${row}-${col}`

        if (hasTile(pos) && !visited.has(pos)) {
          if (!currentWord) {
            currentWord = {
              tiles: [boardTiles[pos]],
              positions: [pos],
              score: 0,
              isHorizontal: false,
            }
          } else {
            currentWord.tiles.push(boardTiles[pos])
            currentWord.positions.push(pos)
          }
          visited.add(pos)
        } else if (!hasTile(pos) && currentWord) {
          // End of word
          if (currentWord.tiles.length >= 2) {
            currentWord.score = currentWord.tiles.reduce((sum: number, tile: any) => sum + tile.value, 0)
            words.push(currentWord)
          }
          currentWord = null
        }
      }

      // Check if word ends at the edge of the board
      if (currentWord && currentWord.tiles.length >= 2) {
        currentWord.score = currentWord.tiles.reduce((sum: number, tile: any) => sum + tile.value, 0)
        words.push(currentWord)
      }
    }

    setPlacedWords(words)

    // Calculate total score
    const totalScore = words.reduce((sum, word) => sum + word.score, 0)
    setScore(totalScore)
  }

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

        <Board boardTiles={boardTiles} onTileDrop={handleTileDrop} placedWords={placedWords} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Shuffle */}
          <BoardActionButton
            // onClick={handleShuffleTiles}
            icon={<Shuffle size={20} />}
            ariaLabel="Shuffle tiles"
          />

          <Box sx={{ textAlign: "center" }}>
            <Tray tiles={trayTiles} onTileDrop={handleTrayTileDrop} />
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
