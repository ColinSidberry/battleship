"use client";

import { useBattleship } from "@/hooks/useBattleship";
import GameBoard from "@/components/GameBoard";

export default function GameWrapper() {
  const { grid, gameStatus, shipHealth, makeGuess } = useBattleship();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Battleship</h1>
        <GameBoard
          grid={grid}
          makeGuess={makeGuess}
          gameStatus={gameStatus}
          shipHealth={shipHealth}
        />
      </div>
    </div>
  );
}
