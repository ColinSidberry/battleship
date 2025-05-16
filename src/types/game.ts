export enum ShipType {
  AIRCRAFT_CARRIER = 'Aircraft Carrier',
  BATTLESHIP = 'Battleship',
  SUBMARINE = 'Submarine',
  DESTROYER = 'Destroyer',
  PATROL_BOAT = 'Patrol Boat'
}

export const SHIP_SIZES: Record<ShipType, number> = {
  [ShipType.AIRCRAFT_CARRIER]: 5,
  [ShipType.BATTLESHIP]: 4,
  [ShipType.SUBMARINE]: 3,
  [ShipType.DESTROYER]: 3,
  [ShipType.PATROL_BOAT]: 2
};

export enum CellState {
  UNKNOWN = '_',
  HIT = 'H',
  MISS = 'M'
}

export type Cell = {
  state: CellState;
  ship: ShipType | null;
}

export type GameStatus = {
  isStarted: boolean;
  isGameOver: boolean;
  guessesRemaining: number;
  shipsRemaining: number;
}