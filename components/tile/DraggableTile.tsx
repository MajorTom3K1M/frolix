import { LetterTile } from "@/types/tiles";
import { SxProps } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { ConnectableElement, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import Tile from "@/components/tile/Tile";

interface DraggableTileProps {
    tile: LetterTile;
    styles?: SxProps;
    width?: number;
    height?: number;
}

const DraggableTile = ({ tile, styles, width, height }: DraggableTileProps) => {
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

    const mergedStyles: SxProps = useMemo(() => ({
        ...styles,
        opacity: isDragging ? 0 : 1,
    }), [styles, isDragging]);

    return (
        <Tile
            width={width}
            height={height}
            ref={dragRef}
            tile={tile}
            styles={mergedStyles}
        />
    );
};

export default React.memo(DraggableTile);