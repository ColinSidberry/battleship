import { CellState } from '../types/game';
import type { Cell } from '../types/game';

interface CellProps {
  cell: Cell;
  onClick: (row: number, col: number) => void;
  row: number;
  col: number;
}

export default function Cell({ cell, onClick, row, col }: CellProps) {
  const cellClasses = {
    [CellState.UNKNOWN]: 'bg-white hover:bg-gray-100',
    [CellState.MISS]: 'bg-gray-300',
    [CellState.HIT]: 'bg-red-500'
  };

  const handleClick = () => {
    onClick(row, col);
  };

  return (
    <div
      className={`w-10 h-10 border border-gray-300 flex items-center justify-center cursor-pointer transition-colors ${cellClasses[cell.state]} text-black`}
      onClick={handleClick}
    >
      {cell.state === CellState.HIT && 'X'}
      {cell.state === CellState.MISS && 'O'}
    </div>
  );
}