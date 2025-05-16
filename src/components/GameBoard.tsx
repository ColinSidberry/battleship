import { Cell as GameCell } from '../types/game';
import Cell from './Cell';

interface GameBoardProps {
  grid: GameCell[][];
  makeGuess: (row: number, col: number) => void;
  gameStatus: {
    isStarted: boolean;
    isGameOver: boolean;
    guessesRemaining: number;
    shipsRemaining: number;
  };
  shipHealth: Record<string, number>;
}

export default function GameBoard({
  grid,
  makeGuess,
  gameStatus,
  shipHealth
}: GameBoardProps) {
  const renderCell = (cell: GameCell, row: number, col: number) => (
    <Cell
      key={`${row}-${col}`}
      cell={cell}
      row={row}
      col={col}
      onClick={makeGuess}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">Score:</h2>
        <div className="flex gap-4">
          <p className="text-black">Guesses Remaining: {gameStatus.guessesRemaining}</p>
          <p className="text-black">Ships Remaining: {gameStatus.shipsRemaining}</p>
        </div>
      </div>
      <div className="grid grid-cols-11 gap-1 mb-4">
        <div className="hidden md:block"></div>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <div key={num} className="w-10 h-10 bg-gray-100 flex items-center justify-center text-black">
            {num}
          </div>
        ))}
      </div>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-11 gap-1">
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-black">
            {String.fromCharCode(65 + rowIndex)}
          </div>
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </div>
      ))}
      <div className="mt-4">
        {Object.entries(shipHealth).map(([ship, health]) => (
          <div key={ship} className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-black">{ship}:</span>
            <span className="text-black">{health}</span>
          </div>
        ))}
      </div>
    </div>
  );
}