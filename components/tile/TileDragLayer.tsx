import { LetterTile, MathTile } from "@/types/tiles";
import React, { useMemo } from "react";
import { useDragLayer } from "react-dnd";
import Tile from "./Tile";

const LAYER_BASE_STYLES: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    left: 0,
    top: 0,
    zIndex: 9999,
};

const TileDragLayer = React.memo(() => {
    const { item, itemType, currentOffset, isDragging } = useDragLayer((monitor) => ({
        item: monitor.getItem<LetterTile | MathTile>(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    // useEffect(() => {
    //     document.body.classList.toggle("dragging", isDragging);
    //     return () => {
    //         document.body.classList.remove("dragging");
    //     };
    // }, [isDragging]);


    const layerStyles = useMemo<React.CSSProperties>(() => {
        if (!currentOffset) {
            return LAYER_BASE_STYLES;
        }
        const { x, y } = currentOffset;
        return {
            ...LAYER_BASE_STYLES,
            transform: `translate(${x}px, ${y}px)`,
            WebkitTransform: `translate(${x}px, ${y}px)`,
        };
    }, [currentOffset]);

    if (!isDragging || itemType !== "MATH_TILE" || !currentOffset) return null

    return <Tile width={40} height={40} tile={item} styles={layerStyles} />
});

export default TileDragLayer;