"use client";
import { Box, Container, Typography } from "@mui/material"
import Game from "@/components/board/Game";

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top header */}
      <Box component="header" sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="h3" component="h1">
          A-Math Game
        </Typography>
      </Box>
      {/* Main content centered vertically */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Game />
      </Box>
    </Container >
  );
}