/**
 * 게임 전역 상태(State) 관리 모듈
 * 현재 보드, 트레이, 점수, 콤보, 드래그 상태, 파티클, AI 상태 등을 중앙에서 관리합니다.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { createEmptyBoard, randomPiece } = PrismaBlock.Board;

  const state = {
    board: createEmptyBoard(),
    tray: [],
    score: 0,
    bestScore: 0,
    combo: 0,
    history: null,
    gameOver: false,
    selectedSlot: null,
    hoverCell: null,

    dragState: {
      active: false,
      slotIndex: -1,
      pointerX: 0,
      pointerY: 0,
      startX: 0,
      startY: 0,
      moved: false,
      gridR: -1,
      gridC: -1,
      valid: false
    },

    particles: [],
    floatingTexts: [],
    animId: null,

    boardMetrics: {
      size: 320,
      pad: 10,
      cell: 36,
      gap: 4,
      dpr: 1
    },

    ai: {
      running: false,
      showHint: false,
      timer: null,
      bestMove: null,
      movesCount: 0
    }
  };

  function refillTray() {
    state.tray = [randomPiece(), randomPiece(), randomPiece()];
  }

  function cloneState() {
    return {
      board: state.board.map(row => row.slice()),
      tray: state.tray.map(p => ({
        shape: p.shape.map(r => r.slice()),
        color: p.color,
        used: p.used
      })),
      score: state.score,
      combo: state.combo
    };
  }

  function restoreSnapshot(snapshot) {
    if (!snapshot) return;
    state.board = snapshot.board;
    state.tray = snapshot.tray;
    state.score = snapshot.score;
    state.combo = snapshot.combo;
    state.history = null;
    state.selectedSlot = null;
  }

  function resetGameState() {
    state.board = createEmptyBoard();
    refillTray();
    state.score = 0;
    state.combo = 0;
    state.history = null;
    state.gameOver = false;
    state.selectedSlot = null;
    state.hoverCell = null;
    state.particles = [];
    state.floatingTexts = [];
  }

  PrismaBlock.State = {
    state,
    refillTray,
    cloneState,
    restoreSnapshot,
    resetGameState
  };
})(window);

