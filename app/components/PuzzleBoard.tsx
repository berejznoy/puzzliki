'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
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
    const ghostRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const draggedPieceIdRef = useRef<number | null>(null);
    const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);

    // Get position from touch coordinates
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

    // Touch handlers - optimized with refs
    const handleTouchStart = useCallback((e: React.TouchEvent, pieceId: number) => {
        e.preventDefault();
        const touch = e.touches[0];

        draggedPieceIdRef.current = pieceId;
        setDraggedPieceId(pieceId);
        isDraggingRef.current = true;

        // Position ghost directly via DOM
        if (ghostRef.current) {
            ghostRef.current.style.display = 'block';
            ghostRef.current.style.left = `${touch.clientX - pieceWidth / 2}px`;
            ghostRef.current.style.top = `${touch.clientY - pieceHeight / 2}px`;
        }
    }, [pieceWidth, pieceHeight]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();

        const touch = e.touches[0];

        // Update ghost position directly via DOM (no React re-render)
        if (ghostRef.current) {
            ghostRef.current.style.left = `${touch.clientX - pieceWidth / 2}px`;
            ghostRef.current.style.top = `${touch.clientY - pieceHeight / 2}px`;
        }
    }, [pieceWidth, pieceHeight]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current || draggedPieceIdRef.current === null) {
            setDraggedPieceId(null);
            draggedPieceIdRef.current = null;
            isDraggingRef.current = false;
            if (ghostRef.current) ghostRef.current.style.display = 'none';
            return;
        }

        e.preventDefault();

        const touch = e.changedTouches[0];
        const targetPosition = getPositionFromCoords(touch.clientX, touch.clientY);

        if (targetPosition !== null) {
            const draggedPiece = pieces.find(p => p.id === draggedPieceIdRef.current);
            if (draggedPiece && draggedPiece.currentPosition !== targetPosition) {
                const newPieces = swapPieces(pieces, draggedPiece.currentPosition, targetPosition);
                onPiecesChange(newPieces);

                if (checkWinCondition(newPieces)) {
                    setTimeout(() => onWin(), 300);
                }
            }
        }

        // Hide ghost
        if (ghostRef.current) ghostRef.current.style.display = 'none';

        setDraggedPieceId(null);
        draggedPieceIdRef.current = null;
        isDraggingRef.current = false;
    }, [pieces, getPositionFromCoords, onPiecesChange, onWin]);

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

    // Get dragged piece for ghost
    const draggedPiece = draggedPieceId !== null ? pieces.find(p => p.id === draggedPieceId) : null;

    return (
        <>
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
            </div>

            {/* Touch drag ghost - positioned via ref, not state */}
            <div
                ref={ghostRef}
                className="puzzle-piece-ghost"
                style={{
                    display: 'none',
                    position: 'fixed',
                    width: pieceWidth,
                    height: pieceHeight,
                    pointerEvents: 'none',
                    zIndex: 1000,
                    opacity: 0.85,
                    backgroundImage: draggedPiece ? `url(${imageUrl})` : 'none',
                    backgroundPosition: draggedPiece
                        ? `-${draggedPiece.col * pieceWidth}px -${draggedPiece.row * pieceHeight}px`
                        : '0 0',
                    backgroundSize: `${pieceWidth * cols}px ${pieceHeight * rows}px`,
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    willChange: 'transform',
                }}
            />
        </>
    );
}
