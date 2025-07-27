"use client"

import { Box, Paper, SxProps } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { LetterTile, MathTile } from "@/types/tiles"
import { ConnectableElement, useDrop } from "react-dnd"
import TrayTile from "@/components/tray/TrayTile"

interface EmptyTraySlotProps {
    index: number
    onDrop: (tile: (LetterTile | MathTile) & { position?: string }, index: number) => void
}

function EmptyTraySlot({ index, onDrop }: EmptyTraySlotProps) {
    const [{ isOver }, dropRef] = useDrop({
        accept: "MATH_TILE",
        drop: (item: (LetterTile | MathTile) & { position?: string }) => {
            onDrop(item, index)
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    const refCallback = useCallback(
        (el: ConnectableElement | null) => { if (el) dropRef(el); },
        [dropRef]
    );

    return (
        <Box
            ref={refCallback}
            sx={{
                width: 40,
                height: 40,
                border: "2px dashed #999",
                borderRadius: "4px",
                backgroundColor: isOver ? "rgba(0, 0, 0, 0.1)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
                margin: "0 4px",
            }}
        />
    )
}

interface MathTrayProps {
    tiles: (LetterTile | MathTile | null)[]
    onTileDrop: (tile: (LetterTile | MathTile) & { position?: string }, index: number) => void
    onDragStart: (tileId: string) => void
    onDragEnd: () => void
}

const TILE_DRAG_STYLES: SxProps = {
    cursor: "grab",
    // opacity: 1,
    // opacity: isDragging ? 0.5 : 1,
    margin: "0 4px",
    transition: "transform 0.2s",
    "&:hover": {
        transform: "translateY(-5px)",
    },
}

export default function MathTray({ tiles, onTileDrop, onDragStart, onDragEnd }: MathTrayProps) {
    const [trayWidth, setTrayWidth] = useState(360)

    // Fixed tray width sized for maximum 8 tiles
    useEffect(() => {
        const handleResize = () => {
            const viewportWidth = window.innerWidth
            
            // Calculate width for max 8 tiles: 8 * 40px (tiles) + 7 * 8px (gaps) + 20px (padding) = 376px
            const maxTrayWidth = (8 * 40) + (9 * 8) + (9 * 4) + 20;
            
            setTrayWidth(Math.min(viewportWidth - 40, maxTrayWidth))
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, []) // Only depends on screen resize, not tile count

    const [, dropRef] = useDrop({
        accept: "MATH_TILE",
        drop: (item: (LetterTile | MathTile) & { position?: string }) => {
            // Find the first empty slot for general tray drops
            const firstEmptyIndex = tiles.findIndex(tile => tile === null)
            if (firstEmptyIndex !== -1) {
                onTileDrop(item, firstEmptyIndex)
            }
        },
    })

    const refCallback = useCallback(
        (el: ConnectableElement | null) => { if (el) dropRef(el); },
        [dropRef]
    );
    
    return (
        <Paper
            elevation={3}
            sx={{
                width: trayWidth,
                height: 60,
                backgroundColor: "#8d6e63", // wooden tray color
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px",
                borderRadius: "5px",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage:
                        "linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)",
                    backgroundSize: "10px 10px",
                    opacity: 0.3,
                    borderRadius: "5px",
                    pointerEvents: "none",
                },
            }}
            ref={refCallback}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    width: "100%",
                    height: "100%",
                }}
            >
                {Array.from({ length: 8 }, (_, index) => {
                    const tile = tiles[index]
                    if (tile) {
                        return (
                            <TrayTile
                                key={tile.id}
                                tile={tile}
                                index={index}
                                styles={TILE_DRAG_STYLES}
                                onDrop={onTileDrop}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                            />
                        )
                    } else {
                        return (
                            <EmptyTraySlot
                                key={`empty-${index}`}
                                index={index}
                                onDrop={onTileDrop}
                            />
                        )
                    }
                })}
            </Box>
        </Paper>
    )
}
