'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import PuzzleBoard from './components/PuzzleBoard';
import { PuzzlePiece, createPuzzlePieces, shufflePieces } from './utils/puzzleUtils';

type GameState = 'upload' | 'playing' | 'won';

const PIECES_PER_SIDE = 4; // Base number of pieces
const DEFAULT_PUZZLE_WIDTH = 400;

function calculatePuzzleDimensions(aspectRatio: number): { width: number; height: number; cols: number; rows: number } {
  if (typeof window === 'undefined') {
    return { width: DEFAULT_PUZZLE_WIDTH, height: DEFAULT_PUZZLE_WIDTH, cols: 4, rows: 4 };
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate base size based on screen
  let maxWidth: number;
  let maxHeight: number;

  if (screenWidth >= 1024) {
    // Desktop
    maxWidth = 400;
    maxHeight = 400;
  } else if (screenWidth >= 768) {
    // Tablet
    maxWidth = Math.min(350, screenWidth - 80);
    maxHeight = Math.min(350, screenHeight - 200);
  } else {
    // Mobile landscape
    maxWidth = screenWidth - 40;
    maxHeight = screenHeight - 120;
  }

  let puzzleWidth: number;
  let puzzleHeight: number;

  if (aspectRatio >= 1) {
    // Landscape or square image
    puzzleWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    puzzleHeight = puzzleWidth / aspectRatio;
  } else {
    // Portrait image
    puzzleHeight = Math.min(maxHeight, maxWidth / aspectRatio);
    puzzleWidth = puzzleHeight * aspectRatio;
  }

  // Ensure minimum size
  puzzleWidth = Math.max(puzzleWidth, 200);
  puzzleHeight = Math.max(puzzleHeight, 200);

  // Calculate grid size based on aspect ratio
  let cols: number;
  let rows: number;

  if (aspectRatio >= 1.5) {
    // Very wide - 5x3 or 6x4
    cols = 5;
    rows = 3;
  } else if (aspectRatio >= 1.2) {
    // Wide - 5x4
    cols = 5;
    rows = 4;
  } else if (aspectRatio >= 0.8) {
    // Square-ish - 4x4
    cols = 4;
    rows = 4;
  } else if (aspectRatio >= 0.67) {
    // Tall - 4x5
    cols = 4;
    rows = 5;
  } else {
    // Very tall - 3x5
    cols = 3;
    rows = 5;
  }

  return { width: puzzleWidth, height: puzzleHeight, cols, rows };
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [puzzleDimensions, setPuzzleDimensions] = useState({ width: 400, height: 400, cols: 4, rows: 4 });
  const [isMounted, setIsMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const updateSize = () => {
      setPuzzleDimensions(calculatePuzzleDimensions(aspectRatio));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [isMounted, aspectRatio]);

  const pieceWidth = puzzleDimensions.width / puzzleDimensions.cols;
  const pieceHeight = puzzleDimensions.height / puzzleDimensions.rows;

  const handleImageLoad = useCallback((url: string, ratio: number) => {
    setImageUrl(url);
    setAspectRatio(ratio);

    const dims = calculatePuzzleDimensions(ratio);
    setPuzzleDimensions(dims);

    const newPieces = createPuzzlePieces(dims.rows, dims.cols);
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
    setAspectRatio(1);
    setPieces([]);
    setMoveCount(0);
  }, []);

  const handleShuffle = useCallback(() => {
    const shuffled = shufflePieces(pieces);
    setPieces(shuffled);
    setMoveCount(0);
    setGameState('playing');
  }, [pieces]);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  return (
    <>
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
                <button
                  onClick={togglePreview}
                  className="btn btn-hint"
                  title="Показать оригинал"
                >
                  👁️
                </button>
              </div>
              <PuzzleBoard
                pieces={pieces}
                rows={puzzleDimensions.rows}
                cols={puzzleDimensions.cols}
                pieceWidth={pieceWidth}
                pieceHeight={pieceHeight}
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
                  width: puzzleDimensions.width,
                  height: puzzleDimensions.height,
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

      {/* Image Preview Modal */}
      {showPreview && (
        <div className="preview-overlay" onClick={togglePreview}>
          <div className="preview-content">
            <div
              className="preview-image"
              style={{
                backgroundImage: `url(${imageUrl})`,
                width: Math.min(puzzleDimensions.width * 1.2, window.innerWidth - 40),
                height: Math.min(puzzleDimensions.height * 1.2, window.innerHeight - 100),
              }}
            />
            <p className="preview-hint">Нажмите, чтобы закрыть</p>
          </div>
        </div>
      )}
    </>
  );
}
