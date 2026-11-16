/**
 * 보드 및 블록 배치 판정 순수 로직 모듈
 * 보드 생성, 배치 가능 여부 확인, 완성된 줄 탐색, AI용 가상 배치 시뮬레이션을 담당합니다.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { GRID_SIZE, SHAPES, PALETTE } = PrismaBlock.Constants;

  function createEmptyBoard() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  }

  function randomPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      shape: shape.map(r => r.slice()),
      color,
      used: false
    };
  }

  function canPlace(shape, row, col, targetBoard) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (!shape[r][c]) continue;
        const br = row + r;
        const bc = col + c;
        if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) return false;
        if (targetBoard[br][bc] !== null) return false;
      }
    }
    return true;
  }

  function canPlaceAnywhere(piece, targetBoard) {
    if (!piece || piece.used) return false;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlace(piece.shape, r, c, targetBoard)) return true;
      }
    }
    return false;
  }

  function checkGameOver(tray, targetBoard) {
    const remaining = tray.filter(p => !p.used);
    if (remaining.length === 0) return false;
    return !remaining.some(p => canPlaceAnywhere(p, targetBoard));
  }

  function findCompletedLines(targetBoard) {
    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (targetBoard[r].every(cell => cell !== null)) fullRows.push(r);
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (targetBoard[r][c] === null) {
          full = false;
          break;
        }
      }
      if (full) fullCols.push(c);
    }

    return { fullRows, fullCols };
  }

  function simulatePlacement(srcBoard, shape, row, col) {
    const next = srcBoard.map(r => r.slice());
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          next[row + r][col + c] = 1;
        }
      }
    }

    const { fullRows, fullCols } = findCompletedLines(next);

    fullRows.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) next[r][c] = null;
    });
    fullCols.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) next[r][c] = null;
    });

    return {
      board: next,
      linesCleared: fullRows.length + fullCols.length
    };
  }

  PrismaBlock.Board = {
    createEmptyBoard,
    randomPiece,
    canPlace,
    canPlaceAnywhere,
    checkGameOver,
    findCompletedLines,
    simulatePlacement
  };
})(window);

