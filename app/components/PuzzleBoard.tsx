'use client';

import { useCallback, useRef } from 'react';
import PuzzlePiece from './PuzzlePiece';
import { PuzzlePiece as PuzzlePieceType, swapPieces, getPieceAtPosition, checkWinCondition } from '../utils/puzzleUtils';

interface PuzzleBoardProps {
    pieces: PuzzlePieceType[];
    rows: number;
    cols: number;
    pieceWidth: number;
    pieceHeight: number;
    imageUrl: string;
    onPiecesChange: (pieces: PuzzlePieceType[]) => void;
    onWin: () => void;
}

export default function PuzzleBoard({
    pieces,
    rows,
    cols,
    pieceWidth,
    pieceHeight,
    imageUrl,
    onPiecesChange,
    onWin,
}: PuzzleBoardProps) {
    const isDraggingRef = useRef(false);

    const handleDragStart = useCallback(() => {
        isDraggingRef.current = true;
    }, []);

    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetPosition: number) => {
        e.preventDefault();
        e.stopPropagation();

        // Only process if we're actually dragging
        if (!isDraggingRef.current) return;

        // Get dragged piece ID from dataTransfer
        const draggedIdStr = e.dataTransfer.getData('text/plain');
        if (!draggedIdStr) return;

        const draggedId = parseInt(draggedIdStr, 10);
        if (isNaN(draggedId)) return;

        const draggedPiece = pieces.find(p => p.id === draggedId);
        if (!draggedPiece) return;

        const fromPosition = draggedPiece.currentPosition;

        // Don't swap if dropping on the same position
        if (fromPosition === targetPosition) {
            isDraggingRef.current = false;
            return;
        }

        const newPieces = swapPieces(pieces, fromPosition, targetPosition);
        onPiecesChange(newPieces);
        isDraggingRef.current = false;

        if (checkWinCondition(newPieces)) {
            setTimeout(() => onWin(), 300);
        }
    }, [pieces, onPiecesChange, onWin]);

    return (
        <div
            className="puzzle-board"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${pieceWidth}px)`,
                gridTemplateRows: `repeat(${rows}, ${pieceHeight}px)`,
            }}
        >
            {Array.from({ length: rows * cols }, (_, position) => {
                const piece = getPieceAtPosition(pieces, position);

                return (
                    <div
                        key={position}
                        className="puzzle-cell"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, position)}
                        style={{
                            width: pieceWidth,
                            height: pieceHeight,
                        }}
                    >
                        {piece && (
                            <PuzzlePiece
                                id={piece.id}
                                row={piece.row}
                                col={piece.col}
                                pieceWidth={pieceWidth}
                                pieceHeight={pieceHeight}
                                imageUrl={imageUrl}
                                totalCols={cols}
                                totalRows={rows}
                                isCorrect={piece.correctPosition === piece.currentPosition}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
