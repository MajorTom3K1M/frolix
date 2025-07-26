export type ChipColor = "red" | "blue" | "green" | "yellow" | "purple" | "orange" | "teal" | "pink";

export const colorMap: Record<ChipColor, string> = {
    red: "bg-red-500 border-red-600",
    blue: "bg-blue-500 border-blue-600",
    green: "bg-green-500 border-green-600",
    yellow: "bg-yellow-500 border-yellow-600",
    purple: "bg-purple-500 border-purple-600",
    orange: "bg-orange-500 border-orange-600",
    teal: "bg-teal-500 border-teal-600",
    pink: "bg-pink-500 border-pink-600",
}

export type SquareType =
    | "normal"
    | "dt" // double tile (orange) - tile scores 2× its face value
    | "tt" // triple tile (blue) - tile scores 3× its face value
    | "de" // double equation (yellow) - equation scores 2× its total
    | "te" // triple equation (red) - equation scores 3× its total
    | "star";