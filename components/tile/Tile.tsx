import { LetterTile } from "@/types/tiles";
import { Box, SxProps, Typography } from "@mui/material";
import React from "react";

interface TileProps {
    tile: LetterTile;
    width?: number;
    height?: number;
    styles?: React.CSSProperties | SxProps;
    bodyVariant?: "body1" | "body2";
}

const TILE_BASE_STYLES: React.CSSProperties = {
    backgroundColor: "#f0e68c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "2px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    position: "relative",
    fontWeight: "bold",
    fontSize: "1rem",
};

const BADGE_STYLES: React.CSSProperties = {
    position: "absolute",
    bottom: 2,
    right: 2,
    fontSize: "0.6rem",
};

const _Tile = React.forwardRef<HTMLDivElement, TileProps>(function Tile(
    { tile, width, height, styles = {}, bodyVariant = "body1" }: TileProps,
    ref
) {
    return (
        <Box
            ref={ref}
            sx={{
                width,
                height,
                ...TILE_BASE_STYLES,
                ...styles,
            }}
        >
            <Typography variant={bodyVariant} sx={{ fontWeight: "bold" }}>
                {tile.letter}
            </Typography>
            <Typography variant="caption" sx={BADGE_STYLES}>
                {tile.value}
            </Typography>
        </Box>
    );
});

const Tile = React.memo(_Tile);
Tile.displayName = "Tile";

export default Tile;