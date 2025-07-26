import { Box, Paper, Typography, Avatar, Chip } from "@mui/material"
import { Crown, User } from "lucide-react"

interface ScoreboardProps {
    players: Player[]
    currentTurn: number
}

export default function Scoreboard({
    players,
    currentTurn
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
        </Paper>
    )
};