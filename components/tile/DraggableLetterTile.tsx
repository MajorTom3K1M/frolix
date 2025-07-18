import { LetterTile } from "@/types/tiles";
import { SxProps } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { ConnectableElement, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import Tile from "@/components/tile/Tile";

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

const DraggableLetterTile = ({ tile }: { tile: LetterTile }) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: "LETTER",
        item: tile,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [tile]);

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [preview])

    const dragRef = useCallback(
        (node: ConnectableElement | null) => {
            if (node) drag(node);
        },
        [drag]
    );

    return (
        <Tile
            width={40}
            height={40}
            ref={dragRef}
            tile={tile}
            styles={TILE_DRAG_STYLES}
        />
    );
};

export default React.memo(DraggableLetterTile);