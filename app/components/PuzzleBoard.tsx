'use client';

import { useCallback, useRef, useState } from 'react';
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
    const boardRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    // Get position from touch or mouse coordinates
    const getPositionFromCoords = useCallback((clientX: number, clientY: number): number | null => {
        if (!boardRef.current) return null;

        const rect = boardRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor(x / pieceWidth);
        const row = Math.floor(y / pieceHeight);

        if (col < 0 || col >= cols || row < 0 || row >= rows) return null;

        return row * cols + col;
    }, [pieceWidth, pieceHeight, cols, rows]);

    // Touch handlers
    const handleTouchStart = useCallback((e: React.TouchEvent, pieceId: number) => {
        e.preventDefault();
        const touch = e.touches[0];
        setDraggedPieceId(pieceId);
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        isDraggingRef.current = true;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current || draggedPieceId === null) return;
        e.preventDefault();
        const touch = e.touches[0];
        setDragPosition({ x: touch.clientX, y: touch.clientY });
    }, [draggedPieceId]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current || draggedPieceId === null) {
            setDraggedPieceId(null);
            isDraggingRef.current = false;
            return;
        }

        e.preventDefault();

        const touch = e.changedTouches[0];
        const targetPosition = getPositionFromCoords(touch.clientX, touch.clientY);

        if (targetPosition !== null) {
            const draggedPiece = pieces.find(p => p.id === draggedPieceId);
            if (draggedPiece && draggedPiece.currentPosition !== targetPosition) {
                const newPieces = swapPieces(pieces, draggedPiece.currentPosition, targetPosition);
                onPiecesChange(newPieces);

                if (checkWinCondition(newPieces)) {
                    setTimeout(() => onWin(), 300);
                }
            }
        }

        setDraggedPieceId(null);
        isDraggingRef.current = false;
    }, [draggedPieceId, pieces, getPositionFromCoords, onPiecesChange, onWin]);

    // Desktop drag handlers
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

        if (!isDraggingRef.current) return;

        const draggedIdStr = e.dataTransfer.getData('text/plain');
        if (!draggedIdStr) return;

        const draggedId = parseInt(draggedIdStr, 10);
        if (isNaN(draggedId)) return;

        const draggedPiece = pieces.find(p => p.id === draggedId);
        if (!draggedPiece) return;

        const fromPosition = draggedPiece.currentPosition;

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
            ref={boardRef}
            className="puzzle-board"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${pieceWidth}px)`,
                gridTemplateRows: `repeat(${rows}, ${pieceHeight}px)`,
                touchAction: 'none',
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
                                isDragging={draggedPieceId === piece.id}
                                onTouchStart={(e) => handleTouchStart(e, piece.id)}
                            />
                        )}
                    </div>
                );
            })}

            {/* Touch drag ghost */}
            {draggedPieceId !== null && (
                <div
                    className="puzzle-piece-ghost"
                    style={{
                        position: 'fixed',
                        left: dragPosition.x - pieceWidth / 2,
                        top: dragPosition.y - pieceHeight / 2,
                        width: pieceWidth,
                        height: pieceHeight,
                        pointerEvents: 'none',
                        zIndex: 1000,
                        opacity: 0.8,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: `-${(pieces.find(p => p.id === draggedPieceId)?.col || 0) * pieceWidth}px -${(pieces.find(p => p.id === draggedPieceId)?.row || 0) * pieceHeight}px`,
                        backgroundSize: `${pieceWidth * cols}px ${pieceHeight * rows}px`,
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '4px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    }}
                />
            )}
        </div>
    );
}
