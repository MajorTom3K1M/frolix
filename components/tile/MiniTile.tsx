import { MathTile } from "@/types/tiles";
import { Box, Typography } from "@mui/material";
import React from "react";

interface MiniTileProps {
    tile: MathTile;
    size?: number;
}

const MiniTile = ({ tile, size = 20 }: MiniTileProps) => {
    const getTileColor = () => {
        switch (tile.type) {
            case 'number': return "#e8f5e8";
            case 'operator': return "#fff3e0";
            case 'equals': return "#e3f2fd";
            case 'blank': return "#f5f5f5";
            default: return "#f0e68c";
        }
    };

    return (
        <Box
            sx={{
                width: size,
                height: size,
                backgroundColor: getTileColor(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                position: "relative",
                minWidth: size,
                minHeight: size,
                border: "1px solid rgba(0,0,0,0.1)",
            }}
        >
            <Typography 
                variant="caption" 
                sx={{ 
                    fontWeight: "bold",
                    fontSize: size < 18 ? "0.5rem" : "0.6rem",
                    lineHeight: 1,
                }}
            >
                {tile.symbol}
            </Typography>
            {size >= 20 && (
                <Typography 
                    variant="caption" 
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 1,
                        fontSize: "0.4rem",
                        color: "rgba(0,0,0,0.6)",
                    }}
                >
                    {tile.value}
                </Typography>
            )}
        </Box>
    );
};

export default React.memo(MiniTile);