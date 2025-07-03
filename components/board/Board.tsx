"use client"

import { Box, Paper, Typography } from "@mui/material"
import { Star } from "lucide-react"
import { useDrop } from "react-dnd"
import { useCallback } from "react"

// Define the types of special squares on the board
type SquareType =
    | "normal"
    | "dl" // double letter
    | "tl" // triple letter
    | "dw" // double word
    | "tw" // triple word
    | "star" // center star (starting position)

// Define the board layout (15x15 grid)
const boardLayout: SquareType[][] = [
    [
        "tw",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "tw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "tw",
    ],
    [
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
    ],
    [
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
    ],
    [
        "dl",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "dl",
    ],
    [
        "normal",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "normal",
    ],
    [
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
    ],
    [
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
    ],
    [
        "tw",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "star",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "tw",
    ],
    [
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
    ],
    [
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
    ],
    [
        "normal",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "normal",
    ],
    [
        "dl",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "dl",
    ],
    [
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
        "normal",
    ],
    [
        "normal",
        "dw",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "tl",
        "normal",
        "normal",
        "normal",
        "dw",
        "normal",
    ],
    [
        "tw",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "normal",
        "tw",
        "normal",
        "normal",
        "normal",
        "dl",
        "normal",
        "normal",
        "tw",
    ],
]

// Color mapping for different square types
const squareColors: Record<SquareType, string> = {
    normal: "#f5e9d5", // light beige
    dl: "#a6d1fa", // light blue
    tl: "#4a9ced", // darker blue
    dw: "#f5b7b1", // light red
    tw: "#e74c3c", // darker red
    star: "#f5b7b1", // same as double word
}

// Text labels for special squares
const squareLabels: Record<SquareType, string> = {
    normal: "",
    dl: "DL",
    tl: "TL",
    dw: "DW",
    tw: "TW",
    star: "",
}

interface ScrabbleBoardProps {
    boardTiles: Record<string, any>
    onTileDrop: (tile: any, position: string) => void
    placedWords: any[]
}

export default function Board({ boardTiles, onTileDrop, placedWords }: ScrabbleBoardProps) {
    // Calculate the responsive size for the board
    const calculateBoardSize = () => {
        // Use viewport width for responsiveness
        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200
        // Limit the maximum size
        return Math.min(viewportWidth - 40, 600)
    }

    const boardSize = calculateBoardSize()
    const cellSize = boardSize / 15

    // Check if a position is part of a placed word
    const getWordForPosition = (position: string) => {
        return placedWords.find((word) => word.positions.includes(position))
    }

    const handleDrop = useCallback(
        (item: any, position: string) => {
            onTileDrop(item, position)
        },
        [onTileDrop],
    )

    return (
        <Paper
            elevation={3}
            sx={{
                width: boardSize,
                height: boardSize,
                display: "grid",
                gridTemplateColumns: "repeat(15, 1fr)",
                gridTemplateRows: "repeat(15, 1fr)",
                gap: "1px",
                padding: "2px",
                backgroundColor: "#8d6e63", // brown border color
                position: "relative",
            }}
        >
            {/* Render word borders and score badges */}
            {placedWords.map((word, wordIndex) => {
                // Calculate the bounding box for the word
                const positions = word.positions.map((pos: string) => {
                    const [row, col] = pos.split("-").map(Number)
                    return { row, col }
                })

                const minRow = Math.min(...positions.map((p: any) => p.row))
                const maxRow = Math.max(...positions.map((p: any) => p.row))
                const minCol = Math.min(...positions.map((p: any) => p.col))
                const maxCol = Math.max(...positions.map((p: any) => p.col))

                // Calculate position and size for the border
                // Account for gaps between cells (1px) and padding (2px)
                const cellWithGap = cellSize + 1
                const left = minCol * cellWithGap + 2
                const top = minRow * cellWithGap + 2
                const width = (maxCol - minCol + 1) * cellWithGap - 1
                const height = (maxRow - minRow + 1) * cellWithGap - 1

                // Determine if word is horizontal or vertical
                const isHorizontal = minRow === maxRow
                const isVertical = minCol === maxCol

                // Position the score badge based on word orientation
                const badgePosition = isHorizontal ? { right: -10, top: -10 } : { right: -10, bottom: -10 }

                return (
                    <Box
                        key={`word-${wordIndex}`}
                        sx={{
                            position: "absolute",
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            border: "2px solid #4caf50",
                            borderRadius: "4px",
                            pointerEvents: "none",
                            zIndex: 10,
                        }}
                    >
                        {/* Score badge */}
                        <Box
                            sx={{
                                position: "absolute",
                                ...badgePosition,
                                backgroundColor: "#4caf50",
                                color: "white",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                zIndex: 11,
                            }}
                        >
                            {word.score}
                        </Box>
                    </Box>
                )
            })}

            {/* Render board squares */}
            {boardLayout.flat().map((squareType, index) => {
                const row = Math.floor(index / 15)
                const col = index % 15
                const isCenter = squareType === "star"
                const position = `${row}-${col}`
                const tile = boardTiles[position]
                const word = getWordForPosition(position)

                // Set up drop target for each square
                const canDrop = !tile
                const [{ isOver }, drop] = useDrop({
                    accept: "LETTER",
                    drop: (item: any) => {
                        handleDrop(item, position)
                    },
                    canDrop: () => canDrop, // Can only drop if no tile is present
                    collect: (monitor) => ({
                        isOver: !!monitor.isOver(),
                    }),
                })

                return (
                    <Box
                        key={position}
                        // ref={drop}
                        sx={{
                            backgroundColor: squareColors[squareType],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            cursor: tile ? "default" : "pointer",
                            transition: "all 0.2s",
                            opacity: isOver && canDrop ? 0.7 : 1,
                            width: "100%",
                            height: "100%",
                            border: isOver && canDrop ? "2px dashed #4caf50" : "none",
                        }}
                    >
                        {isCenter ? (
                            <Star size={cellSize * 0.5} color="#8d6e63" />
                        ) : (
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: cellSize * 0.3,
                                    fontWeight: "bold",
                                    color: squareType === "normal" ? "transparent" : "#000000aa",
                                }}
                            >
                                {squareLabels[squareType]}
                            </Typography>
                        )}

                        {tile && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "2px",
                                    left: "2px",
                                    right: "2px",
                                    bottom: "2px",
                                    backgroundColor: "#f0e68c", // tile color
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "2px",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                    zIndex: 5,
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                    {tile.letter}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: "absolute",
                                        bottom: "2px",
                                        right: "2px",
                                        fontSize: "0.6rem",
                                    }}
                                >
                                    {tile.value}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )
            })}
        </Paper>
    )
}
