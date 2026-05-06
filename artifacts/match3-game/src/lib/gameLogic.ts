export const ROWS = 8;
export const COLS = 8;
export const CANDY_TYPES = 6;

export function initGrid(): number[][] {
  const grid: number[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => -1)
  );
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let type: number;
      let attempts = 0;
      do {
        type = Math.floor(Math.random() * CANDY_TYPES);
        attempts++;
      } while (
        attempts < 20 &&
        ((c >= 2 && grid[r][c - 1] === type && grid[r][c - 2] === type) ||
          (r >= 2 && grid[r - 1][c] === type && grid[r - 2][c] === type))
      );
      grid[r][c] = type;
    }
  }
  return grid;
}

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function findMatches(grid: number[][]): Set<string> {
  const matches = new Set<string>();

  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && grid[r][c] === grid[r][c - 1] && grid[r][c] !== -1) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) matches.add(`${r},${k}`);
        }
        run = 1;
      }
    }
  }

  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && grid[r][c] === grid[r - 1][c] && grid[r][c] !== -1) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) matches.add(`${k},${c}`);
        }
        run = 1;
      }
    }
  }

  return matches;
}

export function swapCells(
  grid: number[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): number[][] {
  const next = cloneGrid(grid);
  const tmp = next[r1][c1];
  next[r1][c1] = next[r2][c2];
  next[r2][c2] = tmp;
  return next;
}

export function removeMatches(
  grid: number[][],
  matches: Set<string>
): number[][] {
  const next = cloneGrid(grid);
  for (const key of matches) {
    const [r, c] = key.split(",").map(Number);
    next[r][c] = -1;
  }
  return next;
}

export function dropTiles(grid: number[][]): number[][] {
  const next = cloneGrid(grid);
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r][c] !== -1) {
        if (r !== writeRow) {
          next[writeRow][c] = next[r][c];
          next[r][c] = -1;
        }
        writeRow--;
      }
    }
  }
  return next;
}

export function fillEmpty(grid: number[][]): number[][] {
  const next = cloneGrid(grid);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c] === -1) {
        next[r][c] = Math.floor(Math.random() * CANDY_TYPES);
      }
    }
  }
  return next;
}

export function isAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}
