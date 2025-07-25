import { Box, SxProps } from "@mui/material";
import { ConnectableElement, useDrop } from "react-dnd";
import { LetterTile } from "@/types/tiles";
import { useCallback } from "react";
import DraggableTile from "@/components/tile/DraggableTile";

interface TrayTileProps {
    tile: LetterTile;
    index: number;
    styles: SxProps;
    onDrop: (tile: LetterTile & { position?: string }, index: number) => void;
    onDragStart: (tileId: string) => void;
    onDragEnd: () => void;
}

export default function TrayTile({ tile, index, styles, onDrop, onDragStart, onDragEnd }: TrayTileProps) {
    const [, dropRef] = useDrop({
        accept: "LETTER",
        drop: (item: LetterTile & { position?: string }) => {
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