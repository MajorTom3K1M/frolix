"use client"

import { Box, Paper, Typography } from "@mui/material"
import { BoardCell } from "@/components/board/BoardCell"

type SquareType =
    | "normal"
    | "dt"
    | "tt"
    | "de"
    | "te"
    | "star"

const boardLayout: SquareType[][] = [
    [
        "te",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "te",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "te",
    ],
    [
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
    ],
    [
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
    ],
    [
        "dt",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "dt",
    ],
    [
        "normal",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "normal",
    ],
    [
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
    ],
    [
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
    ],
    [
        "te",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "star",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "te",
    ],
    [
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
    ],
    [
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
    ],
    [
        "normal",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "normal",
    ],
    [
        "dt",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "dt",
    ],
    [
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
        "normal",
    ],
    [
        "normal",
        "de",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "tt",
        "normal",
        "normal",
        "normal",
        "de",
        "normal",
    ],
    [
        "te",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "normal",
        "te",
        "normal",
        "normal",
        "normal",
        "dt",
        "normal",
        "normal",
        "te",
    ],
]

interface ScrabbleBoardProps {
    boardTiles: Record<string, any>
    onTileDrop: (tile: any, position: string) => void
    placedWords: any[]
    onDragStart: (tileId: string) => void
    onDragEnd: () => void
}

export default function Board({ boardTiles, onTileDrop, placedWords, onDragStart, onDragEnd }: ScrabbleBoardProps) {
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
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    />
                );
            })}

            {/* Render word borders and score badges */}
            {placedWords.map((word, wordIndex) => {
                const coords = word.positions.map((pos: string) =>
                    pos.split("-").map(Number)
                ) as [number, number][];

                const rows = coords.map(([r]) => r)
                const cols = coords.map(([, c]) => c);

                const minRow = Math.min(...rows), maxRow = Math.max(...rows);
                const minCol = Math.min(...cols), maxCol = Math.max(...cols);

                const isHorizontal = minRow === maxRow;
                const cellWithGap = cellSize
                const width = (maxCol - minCol + 1) * cellWithGap - 1
                const height = (maxRow - minRow + 1) * cellWithGap - 1

                // const badgePosition = isHorizontal ? { right: -10, top: -10 } : { right: -10, top: -10 }
                const badgePosition = { right: -10, top: -10 };

                // Choose colors based on equation validity
                const borderColor = word.isValid ? "#4caf50" : "#f44336"; // green for valid, red for invalid
                const badgeColor = word.isValid ? "#4caf50" : "#f44336";

                const key = `word-${wordIndex}`
                return (
                    <Box
                        key={key}
                        sx={{
                            position: "absolute",
                            width: `${width}px`,
                            height: `${height}px`,
                            gridArea: `${minRow + 1}/${minCol + 1}/${maxRow + 2}/${maxCol + 2}`,
                            border: `2px solid ${borderColor}`,
                            borderRadius: "6px",
                            pointerEvents: "none",
                            zIndex: 10,
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                ...badgePosition,
                                backgroundColor: badgeColor,
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
        </Paper>
    )
}
