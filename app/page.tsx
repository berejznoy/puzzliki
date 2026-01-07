'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import PuzzleBoard from './components/PuzzleBoard';
import OrientationOverlay from './components/OrientationOverlay';
import { PuzzlePiece, createPuzzlePieces, shufflePieces } from './utils/puzzleUtils';

type GameState = 'upload' | 'playing' | 'won';

const GRID_SIZE = 4;
const DEFAULT_PUZZLE_SIZE = 400;

function calculatePuzzleSize(): number {
  if (typeof window === 'undefined') return DEFAULT_PUZZLE_SIZE;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Desktop
  if (width >= 1024) return 400;

  // Tablet
  if (width >= 768) return Math.min(350, width - 80);

  // Mobile landscape - use available height minus space for UI
  const availableHeight = height - 120; // header + controls
  const availableWidth = width - 40; // padding

  return Math.min(availableHeight, availableWidth, 350);
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [puzzleSize, setPuzzleSize] = useState(DEFAULT_PUZZLE_SIZE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateSize = () => {
      setPuzzleSize(calculatePuzzleSize());
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, []);

  const pieceSize = puzzleSize / GRID_SIZE;

  const handleImageLoad = useCallback((url: string) => {
    setImageUrl(url);
    const newPieces = createPuzzlePieces(GRID_SIZE, GRID_SIZE);
    const shuffled = shufflePieces(newPieces);
    setPieces(shuffled);
    setMoveCount(0);
    setGameState('playing');
  }, []);

  const handlePiecesChange = useCallback((newPieces: PuzzlePiece[]) => {
    setPieces(newPieces);
    setMoveCount(prev => prev + 1);
  }, []);

  const handleWin = useCallback(() => {
    setGameState('won');
  }, []);

  const handleNewGame = useCallback(() => {
    setGameState('upload');
    setImageUrl('');
    setPieces([]);
    setMoveCount(0);
  }, []);

  const handleShuffle = useCallback(() => {
    const shuffled = shufflePieces(pieces);
    setPieces(shuffled);
    setMoveCount(0);
    setGameState('playing');
  }, [pieces]);

  return (
    <>
      <OrientationOverlay />
      <main className="main-container">
        <div className="game-wrapper">
          <h1 className="title">
            <span className="title-icon">🧩</span>
            Пазлики
          </h1>

          {gameState === 'upload' && (
            <ImageUploader onImageLoad={handleImageLoad} />
          )}

          {gameState === 'playing' && isMounted && (
            <div className="game-container">
              <div className="game-stats">
                <span className="stat">Ходов: {moveCount}</span>
              </div>
              <PuzzleBoard
                pieces={pieces}
                rows={GRID_SIZE}
                cols={GRID_SIZE}
                pieceWidth={pieceSize}
                pieceHeight={pieceSize}
                imageUrl={imageUrl}
                onPiecesChange={handlePiecesChange}
                onWin={handleWin}
              />
              <div className="game-controls">
                <button onClick={handleShuffle} className="btn btn-secondary">
                  🔀 Перемешать
                </button>
                <button onClick={handleNewGame} className="btn btn-secondary">
                  ✨ Новая игра
                </button>
              </div>
            </div>
          )}

          {gameState === 'won' && isMounted && (
            <div className="win-container">
              <div
                className="win-image"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  width: puzzleSize,
                  height: puzzleSize,
                }}
              />
              <div className="win-content">
                <h2 className="win-title">🎉 Поздравляем!</h2>
                <p className="win-text">Вы собрали пазл за {moveCount} ходов!</p>
                <div className="win-controls">
                  <button onClick={handleShuffle} className="btn btn-primary">
                    🔁 Ещё раз
                  </button>
                  <button onClick={handleNewGame} className="btn btn-secondary">
                    ✨ Новая игра
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
