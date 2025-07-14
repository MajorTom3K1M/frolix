"use client"

import { Box, Paper, Typography } from "@mui/material"
import { BoardCell } from "@/components/board/BoardCell"

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

    const boardSize = calculateBoardSize();
    const cellSize = boardSize / 15;

    // Check if a position is part of a placed word
    const getWordForPosition = (position: string) => {
        return placedWords.find((word) => word.positions.includes(position));
    };

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
                const row = Math.floor(index / 15);
                const col = index % 15;
                const position = `${row}-${col}`;
                const tile = boardTiles[position];
                const word = getWordForPosition(position);
                const canDrop = !tile;

                return (
                    <BoardCell
                        key={position}
                        squareType={squareType}
                        position={position}
                        cellSize={cellSize}
                        tile={tile}
                        word={word}
                        canDrop={canDrop}
                        onDrop={onTileDrop}
                    />
                );
            })}
        </Paper>
    )
}
