export interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  row: number;
  col: number;
}

export interface PuzzleConfig {
  rows: number;
  cols: number;
  pieceWidth: number;
  pieceHeight: number;
  imageUrl: string;
}

export function createPuzzlePieces(rows: number, cols: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const position = row * cols + col;
      pieces.push({
        id: position,
        correctPosition: position,
        currentPosition: position,
        row,
        col,
      });
    }
  }
  
  return pieces;
}

export function shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  const shuffled = [...pieces];
  const positions = shuffled.map(p => p.currentPosition);
  
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  return shuffled.map((piece, index) => ({
    ...piece,
    currentPosition: positions[index],
  }));
}

export function checkWinCondition(pieces: PuzzlePiece[]): boolean {
  return pieces.every(piece => piece.correctPosition === piece.currentPosition);
}

export function swapPieces(
  pieces: PuzzlePiece[],
  fromPosition: number,
  toPosition: number
): PuzzlePiece[] {
  return pieces.map(piece => {
    if (piece.currentPosition === fromPosition) {
      return { ...piece, currentPosition: toPosition };
    }
    if (piece.currentPosition === toPosition) {
      return { ...piece, currentPosition: fromPosition };
    }
    return piece;
  });
}

export function getPieceAtPosition(
  pieces: PuzzlePiece[],
  position: number
): PuzzlePiece | undefined {
  return pieces.find(piece => piece.currentPosition === position);
}
