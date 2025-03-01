// Configuration constants
export const GRID_CONFIG = {
  CELL_SIZE: 50, // px how big is each number cell -- a cell is a box where a number inside can bounce around freely
  NUMBER_MOVEMENT_BASE_SPEED: 0.2, // px/s how fast the number moves
  CELL_INNER_BOUND: 20, // px within how much pixels from the edge of the cell the number can move
  POINTER_INFLUENCE_RADIUS: 120, // px the radius within which the pointer can influence the number
  MAX_SCALE: 2, // The maximum scale of the number when it is at the center of the cell
};
