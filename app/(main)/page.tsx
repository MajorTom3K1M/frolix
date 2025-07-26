"use client";
import { Box, Container, Typography } from "@mui/material"
import Game from "@/components/board/Game";

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        A-Math Game
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Game />
      </Box>
    </Container>
  );
}