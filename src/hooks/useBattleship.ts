"use client";
import { useState, useCallback, useEffect } from 'react';
import { ShipType, SHIP_SIZES, CellState, Cell, GameStatus } from '../types/game';

const GRID_SIZE = 10;

export function useBattleship() {
  const [grid, setGrid] = useState<Cell[][]>(
    Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({ state: CellState.UNKNOWN, ship: null }))
    )
  );

  const [gameStatus, setGameStatus] = useState<GameStatus>({
    isStarted: false,
    isGameOver: false,
    guessesRemaining: 50,
    shipsRemaining: Object.keys(SHIP_SIZES).length
  });

  const [shipHealth, setShipHealth] = useState<Record<ShipType, number>>(() => ({
    [ShipType.AIRCRAFT_CARRIER]: SHIP_SIZES[ShipType.AIRCRAFT_CARRIER],
    [ShipType.BATTLESHIP]: SHIP_SIZES[ShipType.BATTLESHIP],
    [ShipType.SUBMARINE]: SHIP_SIZES[ShipType.SUBMARINE],
    [ShipType.DESTROYER]: SHIP_SIZES[ShipType.DESTROYER],
    [ShipType.PATROL_BOAT]: SHIP_SIZES[ShipType.PATROL_BOAT]
  }));

  const startGame = useCallback(() => {
    console.log('starting game');
    const newGrid = placeShips();

    const locations = getShipLocations(newGrid);
    console.log('Ship locations:', locations);
    setGrid(newGrid);
    setGameStatus(prev => ({ ...prev, isStarted: true }));
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const getShipLocations = (grid: Cell[][]) => {
    const locations: Record<ShipType, { start: string; end: string; length: number }[]> = {
      [ShipType.AIRCRAFT_CARRIER]: [],
      [ShipType.BATTLESHIP]: [],
      [ShipType.SUBMARINE]: [],
      [ShipType.DESTROYER]: [],
      [ShipType.PATROL_BOAT]: []
    };

    // Track which cells have been counted
    const countedCells = new Set<string>();
    const shipLengths: Record<ShipType, number> = {
      [ShipType.AIRCRAFT_CARRIER]: 0,
      [ShipType.BATTLESHIP]: 0,
      [ShipType.SUBMARINE]: 0,
      [ShipType.DESTROYER]: 0,
      [ShipType.PATROL_BOAT]: 0
    };

    // Check each cell for ships
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = grid[row][col];
        if (cell.ship && !countedCells.has(`${row}-${col}`)) {
          const ship = cell.ship;
          const shipSize = SHIP_SIZES[ship];
          
          // Check if this is the start of a new ship
          if (
            (row === 0 || grid[row-1][col].ship !== ship) &&
            (col === 0 || grid[row][col-1].ship !== ship)
          ) {
            let endRow = row;
            let endCol = col;
            let length = 1;
            
            // Check horizontal placement
            if (col + shipSize - 1 < GRID_SIZE && 
                grid[row][col + shipSize - 1].ship === ship) {
              endCol = col + shipSize - 1;
              length = endCol - col + 1;
            }
            // Check vertical placement
            else if (row + shipSize - 1 < GRID_SIZE && 
                     grid[row + shipSize - 1][col].ship === ship) {
              endRow = row + shipSize - 1;
              length = endRow - row + 1;
            }

            const start = `${String.fromCharCode(65 + row)}${col + 1}`;
            const end = `${String.fromCharCode(65 + endRow)}${endCol + 1}`;
            locations[ship].push({ start, end, length });
            shipLengths[ship] += length;

            // Mark all cells in this ship as counted
            if (endRow === row) { // horizontal
              for (let c = col; c <= endCol; c++) {
                countedCells.add(`${row}-${c}`);
              }
            } else { // vertical
              for (let r = row; r <= endRow; r++) {
                countedCells.add(`${r}-${col}`);
              }
            }
          }
        }
      }
    }

    // Validation check
    Object.entries(SHIP_SIZES).forEach(([shipType, size]) => {
      const ship = shipType as ShipType;
      if (shipLengths[ship] !== size) {
        console.warn(`Ship length validation failed for ${ship}: Expected ${size}, got ${shipLengths[ship]}`);
      }
    });

    return locations;
  };

  const placeShips = useCallback(() => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell }))) as Cell[][];
    
    // Place ships in order of size (largest to smallest)
    const ships = Object.entries(SHIP_SIZES).sort((a, b) => b[1] - a[1]);
    
    ships.forEach(([shipType, size]) => {
      const ship = shipType as ShipType;
      let placed = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Prevent infinite loop

      while (!placed && attempts < MAX_ATTEMPTS) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceShip(row, col, size, horizontal)) {
          placeShip(row, col, ship, size, horizontal, newGrid);
          placed = true;
        }
        attempts++;
      }

      if (!placed) {
        console.warn(`Failed to place ${ship} after ${MAX_ATTEMPTS} attempts`);
      }
    });

    return newGrid;
  }, [grid]);

  const canPlaceShip = useCallback((row: number, col: number, size: number, horizontal: boolean) => {
    // Check if ship would go off the grid
    if (horizontal && col + size > GRID_SIZE) return false;
    if (!horizontal && row + size > GRID_SIZE) return false;

    // Check for overlapping ships
    for (let i = 0; i < size; i++) {
      const checkRow = horizontal ? row : row + i;
      const checkCol = horizontal ? col + i : col;
      
      // Check current cell
      if (grid[checkRow][checkCol].ship !== null) return false;
      
      // Check adjacent cells
      if (checkRow > 0 && grid[checkRow - 1][checkCol].ship !== null) return false;
      if (checkRow < GRID_SIZE - 1 && grid[checkRow + 1][checkCol].ship !== null) return false;
      if (checkCol > 0 && grid[checkRow][checkCol - 1].ship !== null) return false;
      if (checkCol < GRID_SIZE - 1 && grid[checkRow][checkCol + 1].ship !== null) return false;
    }

    // Check if this placement would cause any adjacent ship segments
    for (let i = 0; i < size; i++) {
      const checkRow = horizontal ? row : row + i;
      const checkCol = horizontal ? col + i : col;
      
      // Check adjacent cells for any ship segments
      for (let r = Math.max(0, checkRow - 1); r <= Math.min(GRID_SIZE - 1, checkRow + 1); r++) {
        for (let c = Math.max(0, checkCol - 1); c <= Math.min(GRID_SIZE - 1, checkCol + 1); c++) {
          if (grid[r][c].ship !== null) {
            // Get the ship's size
            const ship = grid[r][c].ship;
            if (!ship) return false;
            const shipSize = SHIP_SIZES[ship];
            
            // Check if this ship segment is part of a ship that would overlap
            if (horizontal) {
              // Check if this is a horizontal ship
              if (c + shipSize - 1 < GRID_SIZE && grid[r][c + shipSize - 1].ship === grid[r][c].ship) {
                return false;
              }
              // Check if this is a vertical ship
              if (r + shipSize - 1 < GRID_SIZE && grid[r + shipSize - 1][c].ship === grid[r][c].ship) {
                return false;
              }
            } else {
              // Check if this is a vertical ship
              if (r + shipSize - 1 < GRID_SIZE && grid[r + shipSize - 1][c].ship === grid[r][c].ship) {
                return false;
              }
              // Check if this is a horizontal ship
              if (c + shipSize - 1 < GRID_SIZE && grid[r][c + shipSize - 1].ship === grid[r][c].ship) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  }, [grid]);

  const placeShip = useCallback((row: number, col: number, ship: ShipType, size: number, horizontal: boolean, grid: Cell[][]) => {
    // Place the ship segments
    if (horizontal) {
      for (let i = 0; i < size; i++) {
        if (col + i >= GRID_SIZE) break; // Prevent going off grid
        grid[row][col + i].ship = ship;
      }
    } else {
      for (let i = 0; i < size; i++) {
        if (row + i >= GRID_SIZE) break; // Prevent going off grid
        grid[row + i][col].ship = ship;
      }
    }

    // Debug logging
    console.log(`Placing ${ship} of size ${size} at ${horizontal ? 'horizontal' : 'vertical'}`);
    console.log(`Start: ${String.fromCharCode(65 + row)}${col + 1}`);
    console.log(`End: ${String.fromCharCode(65 + (horizontal ? row : row + size - 1))}${horizontal ? col + size : col + 1}`);
  }, []);

  const makeGuess = useCallback((row: number, col: number) => {
    // console.log(row, col, 'clicked');
    console.log('game is started', gameStatus.isStarted);
    console.log('game is over', gameStatus.isGameOver);
    if (gameStatus.isGameOver) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell }))) as Cell[][];
    const cell = newGrid[row][col];

    console.log('cell state', cell.state);
    if (cell.state !== CellState.UNKNOWN) return;

    if (cell.ship) {
      newGrid[row][col].state = CellState.HIT;
      setGrid(newGrid);
      setShipHealth(prev => {
        const newHealth = { ...prev };
        if (cell.ship) {
          newHealth[cell.ship] = prev[cell.ship] - 1;
        }
        return newHealth;
      });

      // Check if ship is sunk
      if (shipHealth[cell.ship] === 1) {
        setGameStatus(prev => ({
          ...prev,
          shipsRemaining: prev.shipsRemaining - 1
        }));
      }
    } else {
      newGrid[row][col].state = CellState.MISS;
      setGrid(newGrid);
    }

    setGameStatus(prev => ({
      ...prev,
      guessesRemaining: prev.guessesRemaining - 1,
      isGameOver: prev.shipsRemaining === 0 || prev.guessesRemaining === 0
    }));
  }, [gameStatus, grid, shipHealth]);

  return {
    grid,
    gameStatus,
    shipHealth,
    startGame,
    makeGuess
  };
}