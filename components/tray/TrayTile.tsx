import { Box, SxProps } from "@mui/material";
import { ConnectableElement, useDrop } from "react-dnd";
import { LetterTile, MathTile } from "@/types/tiles";
import { useCallback } from "react";
import DraggableTile from "@/components/tile/DraggableTile";

interface TrayTileProps {
    tile: LetterTile | MathTile;
    index: number;
    styles: SxProps;
    onDrop: (tile: (LetterTile | MathTile) & { position?: string }, index: number) => void;
    onDragStart: (tileId: string) => void;
    onDragEnd: () => void;
}

export default function TrayTile({ tile, index, styles, onDrop, onDragStart, onDragEnd }: TrayTileProps) {
    const [, dropRef] = useDrop({
        accept: "MATH_TILE",
        drop: (item: (LetterTile | MathTile) & { position?: string }) => {
            if (item.id !== tile.id) {
                onDrop(item, index);
            }
        },
    });

    const refCallback = useCallback(
        (el: ConnectableElement | null) => { if (el) dropRef(el); },
        [dropRef]
    );
    
    return (
        <Box ref={refCallback}>
            <DraggableTile 
                tile={tile} 
                width={40} 
                height={40} 
                styles={styles}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            />
        </Box>
    );
}