import { Box, Paper, Typography, Avatar, Chip, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { Crown, User, History, Package, ChevronDown } from "lucide-react"
import { MathTile } from "@/types/tiles"
import MiniTile from "@/components/tile/MiniTile"

interface TurnHistoryEntry {
    turn: number
    player: string
    equation: string
    score: number
    timestamp: Date
    tiles?: MathTile[]
}

interface ScoreboardProps {
    players: Player[]
    currentTurn: number
    turnHistory?: TurnHistoryEntry[]
    tilesInBag?: number
}

export default function Scoreboard({
    players,
    currentTurn,
    turnHistory = [],
    tilesInBag = 0
}: ScoreboardProps) {
    const winner = players.reduce((prev, current) => (prev.score > current.score ? prev : current));
    const isGameActive = players.some((player) => player.isActive)

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                minWidth: 300,
                backgroundColor: "#f8f9fa",
                borderRadius: 3,
            }}
        >
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold", mb: 3 }}>
                Scoreboard
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {players.map((player) => (
                    <Box
                        key={player.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: player.id === currentTurn ? "#e3f2fd" : "#ffffff",
                            border: player.id === currentTurn ? "2px solid #2196f3" : "1px solid #e0e0e0",
                            transition: "all 0.3s ease",
                            boxShadow: player.id === currentTurn ? "0 2px 8px rgba(33, 150, 243, 0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                sx={{
                                    backgroundColor: player.id === currentTurn ? "#2196f3" : "#757575",
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <User size={20} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    {player.name}
                                </Typography>
                                {player.id === currentTurn && isGameActive && (
                                    <Chip label="Current Turn" size="small" color="primary" sx={{ fontSize: "0.7rem" }} />
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {player.score === winner.score && player.score > 0 && <Crown size={20} color="#ffd700" />}
                            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                                {player.score}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Tiles in Bag */}
            <Divider sx={{ my: 3 }} />
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    backgroundColor: "#fff3e0",
                    borderRadius: 2,
                    border: "1px solid #ffb74d"
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Package size={20} color="#ff8f00" />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Tiles in Bag
                    </Typography>
                </Box>
                <Chip
                    label={tilesInBag}
                    sx={{
                        backgroundColor: "#ff8f00",
                        color: "white",
                        fontWeight: "bold"
                    }}
                />
            </Box>

            {/* Turn History */}
            <Divider sx={{ my: 3 }} />
            <Accordion defaultExpanded={false}>
                <AccordionSummary
                    expandIcon={<ChevronDown size={20} />}
                    sx={{
                        backgroundColor: "#f3e5f5",
                        borderRadius: 1,
                        "&:hover": { backgroundColor: "#e1bee7" }
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <History size={20} color="#7b1fa2" />
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            Turn History ({turnHistory.length} turns)
                        </Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                        {turnHistory.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ p: 2 }}
                            >
                                No turns played yet
                            </Typography>
                        ) : (
                            turnHistory.slice().reverse().map((entry, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 2,
                                        borderBottom: index < turnHistory.length - 1 ? "1px solid #e0e0e0" : "none",
                                        "&:hover": { backgroundColor: "#f5f5f5" }
                                    }}
                                >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                            Turn {entry.turn} - {entry.player}
                                        </Typography>
                                        <Chip
                                            label={`+${entry.score}`}
                                            size="small"
                                            color={entry.score > 0 ? "success" : "default"}
                                            sx={{ fontSize: "0.7rem" }}
                                        />
                                    </Box>
                                    {entry.tiles && entry.tiles.length > 0 ? (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                                            {entry.tiles.map((tile, tileIndex) => (
                                                <MiniTile key={`${entry.turn}-${tileIndex}`} tile={tile} size={18} />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                                            {entry.equation}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        {entry.timestamp.toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Paper>
    )
};