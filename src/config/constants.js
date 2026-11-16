/**
 * 게임 상수 및 블록/색상 설정
 * 블록 모양 추가나 색상 테마 변경 시 이 파일을 수정하세요.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});

  const GRID_SIZE = 8;
  const STORAGE_KEY = 'prisma_block_best_v1';

  const PALETTE = [
    { fill: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', glow: 'rgba(56, 189, 248, 0.45)' },
    { fill: '#818cf8', light: '#a5b4fc', dark: '#4f46e5', glow: 'rgba(129, 140, 248, 0.45)' },
    { fill: '#f472b6', light: '#f9a8d4', dark: '#db2777', glow: 'rgba(244, 114, 182, 0.45)' },
    { fill: '#34d399', light: '#6ee7b7', dark: '#059669', glow: 'rgba(52, 211, 153, 0.45)' },
    { fill: '#fbbf24', light: '#fde68a', dark: '#d97706', glow: 'rgba(251, 191, 36, 0.45)' },
    { fill: '#fb7185', light: '#fda4af', dark: '#e11d48', glow: 'rgba(251, 113, 133, 0.45)' },
    { fill: '#a78bfa', light: '#c4b5fd', dark: '#7c3aed', glow: 'rgba(167, 139, 250, 0.45)' }
  ];

  const SHAPES = [
    [[1]],
    [[1, 1]],
    [[1], [1]],
    [[1, 1, 1]],
    [[1], [1], [1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 1], [1, 1]],
    [[1, 0], [1, 1]],
    [[0, 1], [1, 1]],
    [[1, 1], [1, 0]],
    [[1, 1], [0, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
  ];

  PrismaBlock.Constants = {
    GRID_SIZE,
    STORAGE_KEY,
    PALETTE,
    SHAPES
  };
})(window);

