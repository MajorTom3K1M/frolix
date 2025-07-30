import React, { useCallback } from "react";
import { useDrop, DropTargetMonitor, ConnectableElement } from "react-dnd";
import { Box, Typography } from "@mui/material";
import { SquareType } from "@/types/global";
import { Star } from "lucide-react";
import DraggableTile from "../tile/DraggableTile";
import { LetterTile, MathTile } from "@/types/tiles";

interface BoardCellProps {
    squareType: SquareType;
    position: string;
    cellSize: number;
    tile?: LetterTile | MathTile;
    word?: { positions: string[]; score: number };
    canDrop: boolean;
    onDrop: (tile: LetterTile | MathTile, position: string) => void;
    onDragStart: (tileId: string) => void;
    onDragEnd: () => void;
    isSubmittedEquation?: boolean;
}

const squareColors: Record<SquareType, string> = {
    normal: "#f5e9d5",
    dt: "#a6d1fa",
    tt: "#4a9ced",
    de: "#f5b7b1",
    te: "#e74c3c",
    // dt: "#ffa726",
    // tt: "#42a5f5",
    // de: "#ffeb3b",
    // te: "#f44336",
    star: "#f5b7b1",
};

const squareLabels: Record<SquareType, string> = {
    normal: "",
    dt: "DT", // Double Tile
    tt: "TT", // Triple Tile
    de: "DE", // Double Equation
    te: "TE", // Triple Equation
    star: "",
};

const TILE_BASE_STYLES: React.CSSProperties = {
    position: "absolute",
    top: "2px",
    left: "2px",
    right: "2px",
    bottom: "2px",
    zIndex: 5,
}

function Cell({
    squareType, position, cellSize, tile, word, canDrop, onDrop, onDragStart, onDragEnd, isSubmittedEquation
}: Readonly<BoardCellProps>) {
    const handleDrop = useCallback(
        (item: LetterTile | MathTile) => {
            onDrop(item, position);
        },
        [onDrop, position]
    );

    const [{ isOver }, dropRef] = useDrop(
        () => ({
            accept: "MATH_TILE",
            drop: handleDrop,
            canDrop: () => canDrop,
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver({ shallow: true }),
            }),
        }),
        [handleDrop, canDrop]
    );

    const refCallback = useCallback(
        (el: ConnectableElement | null) => { if (el) dropRef(el); },
        [dropRef]
    );

    const isCenter = squareType === "star";

    return (
        <Box
            ref={refCallback}
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
                <DraggableTile
                    tile={tile}
                    styles={TILE_BASE_STYLES}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    isDraggable={!isSubmittedEquation}
                />
            )}
        </Box>
    );
}

export const BoardCell = React.memo(Cell);