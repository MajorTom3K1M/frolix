export interface MathTile {
    id: string
    symbol: string  // Can be a number (0-20) or operator (+, -, ±, ×, ÷, ×/÷, =) or blank
    value: number   // Point value for scoring
    type: 'number' | 'operator' | 'equals' | 'blank' | 'dual'
    isBlank?: boolean
    chosenValue?: string  // For blank tiles and dual operators (±, ×/÷)
}

export interface LetterTile {
    id: string
    letter: string
    value: number
}