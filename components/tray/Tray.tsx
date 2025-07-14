"use client"

import { Box, Paper, Typography } from "@mui/material"
import { ConnectableElement, useDrag, useDragLayer } from "react-dnd"
import { useEffect, useState } from "react"
import { getEmptyImage } from "react-dnd-html5-backend"

interface LetterTile {
    id: string
    letter: string
    value: number
}

interface LetterTrayProps {
    tiles: LetterTile[]
}

export function CustomDragLayer() {
    const { item, itemType, currentOffset, isDragging } = useDragLayer((monitor) => ({
        item: monitor.getItem<LetterTile>(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }))


    // useEffect(() => {
    //     document.body.classList.toggle("dragging", isDragging);
    //     return () => {
    //         document.body.classList.remove("dragging");
    //     };
    // }, [isDragging]);


    if (!isDragging || itemType !== "LETTER" || !currentOffset) return null

    const { x, y } = currentOffset
    const layerStyles: React.CSSProperties = {
        position: "fixed",
        pointerEvents: "none",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        WebkitTransform: `translate(${x}px, ${y}px)`,
        zIndex: 9999,
    }

    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                backgroundColor: "#f0e68c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                ...layerStyles
            }}
        >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {item.letter}
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
                {item.value}
            </Typography>
        </Box>
    )
}

const DraggableLetterTile = ({ tile }: { tile: LetterTile }) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: "LETTER",
        item: tile,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [preview])

    return (
        <Box
            ref={(node) => { if (node) drag(node as ConnectableElement); }}
            sx={{
                width: 40,
                height: 40,
                backgroundColor: "#f0e68c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                cursor: "grab",
                // opacity: 1,
                // opacity: isDragging ? 0.5 : 1,
                position: "relative",
                margin: "0 4px",
                transition: "transform 0.2s",
                "&:hover": {
                    transform: "translateY(-5px)",
                },
            }}
        >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
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
    )
}

export default function LetterTray({ tiles }: LetterTrayProps) {
    const [trayWidth, setTrayWidth] = useState(350)

    // Adjust tray width based on screen size
    useEffect(() => {
        const handleResize = () => {
            const viewportWidth = window.innerWidth
            setTrayWidth(Math.min(viewportWidth - 40, 350))
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
                    <DraggableLetterTile key={tile.id} tile={tile} />
                ))}
            </Box>
        </Paper>
    )
}
