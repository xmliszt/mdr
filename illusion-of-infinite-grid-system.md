# The Illusion of an Infinite Grid System

## Key Concepts

The system uses two coordinate systems:
1. **Absolute positions**: The actual position in the infinite grid (the entire data space)
2. **Relative positions**: The position relative to the current viewport (what's visible on screen)

## How It Works

### Viewport and Grid Structure

The `NumberManager` maintains:
- A **viewport** that defines which portion of the infinite grid is currently visible
- A **cache** of generated numbers to maintain consistency when revisiting positions
- A **store** that contains the currently visible numbers in relative coordinates

```typescript
readonly store = create<{
  numbers: MdrNumber[];
  viewport: ViewportPosition;
}>(() => ({
  numbers: [],
  viewport: { startRow: 0, startCol: 0 },
}));
```

### Position Conversion

The system converts between absolute and relative positions:

1. **Absolute → Relative**: Subtract the viewport's starting position
   ```typescript
   // In generateNumbers method
   const relativeRow = row - viewport.startRow;
   const relativeCol = col - viewport.startCol;
   ```

2. **Relative → Absolute**: Add the viewport's starting position
   ```typescript
   // In getAbsolutePosition method
   return {
     row: relativeRow + viewport.startRow,
     col: relativeCol + viewport.startCol,
   };
   ```

### Number Generation and Retrieval

When generating numbers for the visible area:

1. The system calculates which absolute positions are visible based on the viewport
2. For each position, it either retrieves an existing number from the cache or creates a new one
3. It then converts these absolute positions to relative positions for rendering

```typescript:app/lumon/mdr/[file_id]/number-manager/number-manager.ts
generateNumbers(gridSize: { w: number; h: number }) {
  const { viewport } = this.store.getState();
  const colSize = Math.ceil(gridSize.w / GRID_CONFIG.CELL_SIZE);
  const rowSize = Math.ceil(gridSize.h / GRID_CONFIG.CELL_SIZE);

  // Calculate the visible range based on viewport position
  const visibleRowStart = viewport.startRow;
  const visibleRowEnd = viewport.startRow + rowSize - 1;
  const visibleColStart = viewport.startCol;
  const visibleColEnd = viewport.startCol + colSize - 1;

  // Create a new array of numbers for the visible area
  const newNumbers: MdrNumber[] = [];

  // Generate numbers for the visible area
  for (let row = visibleRowStart; row <= visibleRowEnd; row++) {
    for (let col = visibleColStart; col <= visibleColEnd; col++) {
      // Calculate the relative position for rendering
      const relativeRow = row - viewport.startRow;
      const relativeCol = col - viewport.startCol;

      // Generate or retrieve the number for this position
      const number = this.getOrCreateNumberForPosition(row, col);

      // Update the relative position for rendering
      newNumbers.push({
        ...number,
        row: relativeRow,
        col: relativeCol,
      });
    }
  }

  this.store.setState({ numbers: newNumbers });
}
```

### Navigation

When the user navigates (using arrow keys):

1. The viewport's position is updated
2. New numbers are generated for the new visible area
3. The numbers are rendered at their relative positions

```typescript
moveViewport(direction: "up" | "down" | "left" | "right") {
  const { viewport } = this.store.getState();

  let newViewport: ViewportPosition;

  switch (direction) {
    case "up":
      newViewport = {
        ...viewport,
        startRow: viewport.startRow - GRID_CONFIG.NAVIGATION_SPEED,
      };
      break;
    // ... other directions
  }

  this.store.setState({ viewport: newViewport });

  // Regenerate the numbers for the new viewport
  const numberGrid = document.getElementById("number_grid");
  if (numberGrid) {
    const { width, height } = numberGrid.getBoundingClientRect();
    this.generateNumbers({ w: width, h: height });
  }
}
```

### Cell Identification

Each cell has a unique ID based on its absolute position:

```typescript
private generateCellId(row: number, col: number): string {
  return `r${row}c${col}`;
}
```

This ID is used to retrieve numbers from the cache and maintain consistency.

## Practical Example

1. If the viewport is at position `{startRow: 10, startCol: 5}`:
   - The cell at absolute position `(12, 7)` would have a relative position of `(2, 2)`
   - The cell with ID `r12c7` would be rendered at position `(2, 2)` in the grid

2. When the user navigates right:
   - The viewport updates to `{startRow: 10, startCol: 6}`
   - The same cell (absolute `(12, 7)`) now has a relative position of `(2, 1)`
   - The cell's appearance and properties remain consistent because it's retrieved from the cache

This system creates the illusion of an infinite canvas while only rendering the visible portion, efficiently managing memory and performance.
