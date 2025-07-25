"use client"

import { Box, Paper, SxProps } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { LetterTile } from "@/types/tiles"
import { ConnectableElement, useDrop } from "react-dnd"
import TrayTile from "@/components/tray/TrayTile"

interface LetterTrayProps {
    tiles: LetterTile[]
    onTileDrop: (tile: LetterTile & { position?: string }, index: number) => void
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

export default function LetterTray({ tiles, onTileDrop, onDragStart, onDragEnd }: LetterTrayProps) {
    const [trayWidth, setTrayWidth] = useState(400)

    // Adjust tray width based on screen size
    useEffect(() => {
        const handleResize = () => {
            const viewportWidth = window.innerWidth
            setTrayWidth(Math.min(viewportWidth - 40, 400))
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const [, dropRef] = useDrop({
        accept: "LETTER",
        drop: (item: LetterTile & { position?: string }) => {
            if (!tiles.find((t) => t.id === item.id)) {
                onTileDrop(item, tiles.length)
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
                {tiles.map((tile, index) => (
                    <TrayTile
                        key={tile.id}
                        tile={tile}
                        index={index}
                        styles={TILE_DRAG_STYLES}
                        onDrop={onTileDrop}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    />
                ))}
            </Box>
        </Paper>
    )
}
