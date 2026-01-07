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
    isDragging?: boolean;
    onTouchStart?: (e: React.TouchEvent) => void;
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
    isDragging = false,
    onTouchStart,
}: PuzzlePieceProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', id.toString());
        e.dataTransfer.effectAllowed = 'move';

        const target = e.currentTarget as HTMLElement;
        e.dataTransfer.setDragImage(target, pieceWidth / 2, pieceHeight / 2);
    };

    const totalWidth = pieceWidth * totalCols;
    const totalHeight = pieceHeight * totalRows;

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onTouchStart={onTouchStart}
            className={`puzzle-piece ${isCorrect ? 'correct' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                width: pieceWidth,
                height: pieceHeight,
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `-${col * pieceWidth}px -${row * pieceHeight}px`,
                backgroundSize: `${totalWidth}px ${totalHeight}px`,
                backgroundRepeat: 'no-repeat',
                opacity: isDragging ? 0.3 : 1,
                touchAction: 'none',
            }}
        />
    );
}

export default memo(PuzzlePiece);
