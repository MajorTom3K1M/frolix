import { LetterTile, MathTile } from "@/types/tiles";
import { SxProps } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { ConnectableElement, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import Tile from "@/components/tile/Tile";

interface DraggableTileProps {
    tile: LetterTile | MathTile;
    styles?: SxProps;
    width?: number;
    height?: number;
    onDragStart?: (tileId: string) => void;
    onDragEnd?: () => void;
    isDraggable?: boolean;
}

const DraggableTile = ({ tile, styles, width, height, onDragStart, onDragEnd, isDraggable = true }: DraggableTileProps) => {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: "MATH_TILE",
        item: () => {
            if (!isDraggable) return null;
            onDragStart?.(tile.id);
            return tile;
        },
        end: () => {
            onDragEnd?.();
        },
        canDrag: () => isDraggable,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [tile, onDragStart, onDragEnd, isDraggable]);

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
        cursor: isDraggable ? 'grab' : 'not-allowed',
        filter: isDraggable ? 'none' : 'brightness(0.9)',
    }), [styles, isDragging, isDraggable]);

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