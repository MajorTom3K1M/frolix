"use client"

import { Box, Paper, SxProps } from "@mui/material"
import { useEffect, useState } from "react"
import { LetterTile } from "@/types/tiles"
import DraggableTile from "@/components/tile/DraggableTile"

interface LetterTrayProps {
    tiles: LetterTile[]
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

export default function LetterTray({ tiles }: LetterTrayProps) {
    const [trayWidth, setTrayWidth] = useState(450)

    // Adjust tray width based on screen size
    useEffect(() => {
        const handleResize = () => {
            const viewportWidth = window.innerWidth
            setTrayWidth(Math.min(viewportWidth - 40, 450))
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

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
                {tiles.map((tile) => (
                    <DraggableTile
                        width={40}
                        height={40}
                        styles={TILE_DRAG_STYLES}
                        key={tile.id}
                        tile={tile}
                    />
                ))}
            </Box>
        </Paper>
    )
}
