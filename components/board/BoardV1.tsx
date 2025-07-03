import { cn } from "@/lib/utils";
import type { ChipColor } from "@/types/global";
import { useDroppable } from "@dnd-kit/core";

interface PlacedChip {
  id: string
  color: ChipColor
  position: number
}

interface MathBoardProps {
  gridSize?: number
  placedChips: PlacedChip[]
  className?: string
}

function Cell({
  index,
  gridSize,
  chip,
}: Readonly<{
  index: number
  gridSize: number
  chip?: PlacedChip
}>) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${index}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border border-gray-200 rounded-md flex items-center justify-center relative",
        isOver && !chip ? "bg-primary/20" : !chip && "hover:bg-primary/10",
      )}
    >
      {chip ? (
        <div className="absolute inset-0 flex items-center justify-center p-1">
          {/* <BoardChip id={chip.id} color={chip.color} /> */}
        </div>
      ) : (
        <span className="text-xs text-gray-400">
          {Math.floor(index / gridSize)},{index % gridSize}
        </span>
      )}
    </div>
  )
}

export function MathBoard({ gridSize = 10, placedChips, className }: MathBoardProps) {
  const cells = Array.from({ length: gridSize * gridSize }, (_, index) => index)

  return (
    <div className={cn("w-full max-w-[54rem] mx-auto", className)}>
      <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
        <div
          className="grid gap-1 absolute inset-0"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {cells.map((cell) => {
            const chipInCell = placedChips.find((chip) => chip.position === cell)

            return <Cell key={cell} index={cell} gridSize={gridSize} chip={chipInCell} />
          })}
        </div>
      </div>
    </div>
  );
}