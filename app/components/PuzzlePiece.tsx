'use client';

import { memo } from 'react';

interface PuzzlePieceProps {
    id: number;
    row: number;
    col: number;
    pieceWidth: number;
    pieceHeight: number;
    imageUrl: string;
    totalCols: number;
    totalRows: number;
    isCorrect: boolean;
}

function PuzzlePiece({
    id,
    row,
    col,
    pieceWidth,
    pieceHeight,
    imageUrl,
    totalCols,
    totalRows,
    isCorrect,
}: PuzzlePieceProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', id.toString());
        e.dataTransfer.effectAllowed = 'move';

        // Set drag image to be the piece itself
        const target = e.currentTarget as HTMLElement;
        e.dataTransfer.setDragImage(target, pieceWidth / 2, pieceHeight / 2);
    };

    // Calculate exact background size and position
    const totalWidth = pieceWidth * totalCols;
    const totalHeight = pieceHeight * totalRows;

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className={`puzzle-piece ${isCorrect ? 'correct' : ''}`}
            style={{
                width: pieceWidth,
                height: pieceHeight,
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `-${col * pieceWidth}px -${row * pieceHeight}px`,
                backgroundSize: `${totalWidth}px ${totalHeight}px`,
                backgroundRepeat: 'no-repeat',
            }}
        />
    );
}

export default memo(PuzzlePiece);
