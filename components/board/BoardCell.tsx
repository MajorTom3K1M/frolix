"use client";

import { useTransition, useCallback } from "react";
import { useDrop, DropTargetMonitor, ConnectableElement } from "react-dnd";
import { Box, Typography } from "@mui/material";
import { SquareType } from "@/types/global";
import { Star } from "lucide-react";
import React from "react";

interface LetterTile {
  id: string;
  letter: string;
  value: number;
}

interface BoardCellProps {
    squareType: SquareType;
    position: string;
    cellSize: number;
    tile?: LetterTile;
    word?: { positions: string[]; score: number };
    canDrop: boolean;
    onDrop: (tile: LetterTile, position: string) => void;
}

const squareColors: Record<SquareType, string> = {
    normal: "#f5e9d5",
    dl: "#a6d1fa",
    tl: "#4a9ced",
    dw: "#f5b7b1",
    tw: "#e74c3c",
    star: "#f5b7b1",
};

const squareLabels: Record<SquareType, string> = {
    normal: "",
    dl: "DL",
    tl: "TL",
    dw: "DW",
    tw: "TW",
    star: "",
};

function Cell({ 
    squareType, position, cellSize, tile, word, canDrop, onDrop 
}: Readonly<BoardCellProps>) {
    const handleDrop = useCallback(
        (item: LetterTile) => {
            onDrop(item, position);
        },
        [onDrop, position]
    );

    const [{ isOver }, dropRef] = useDrop(
        () => ({
            accept: "LETTER",
            drop: handleDrop,
            canDrop: () => canDrop,
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [handleDrop, canDrop]
    );

    const isCenter = squareType === "star";

    return (
        <Box
            ref={(node) => { if (node) dropRef(node as ConnectableElement); }}
            sx={{
                backgroundColor: squareColors[squareType],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                cursor: tile ? "default" : "pointer",
                // transition: "all 0.2s",
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
                        backgroundColor: "#f0e68c",
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
    );
}

export const BoardCell = React.memo(Cell);