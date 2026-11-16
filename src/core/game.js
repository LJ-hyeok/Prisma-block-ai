/**
 * 핵심 게임 진행(블록 배치, 점수 계산, 되돌리기, 새 게임) 컨트롤러 모듈
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { GRID_SIZE } = PrismaBlock.Constants;
  const { saveBest } = PrismaBlock.Storage;
  const { sfxPlace, sfxClear, sfxInvalid, sfxGameOver } = PrismaBlock.Sound;
  const { canPlace, checkGameOver, findCompletedLines } = PrismaBlock.Board;
  const { state, refillTray, cloneState, restoreSnapshot, resetGameState } = PrismaBlock.State;
  const { dom, updateHUD, showGameOverOverlay, hideGameOverOverlay } = PrismaBlock.DOM;
  const { getCellCenter, spawnParticles, spawnFloatingText, renderTray } = PrismaBlock.Renderer;
  const { findBestMove, describeAiMove } = PrismaBlock.AIEngine;

  function syncAiRecommendation() {
    if (state.ai.showHint) {
      state.ai.bestMove = findBestMove();
      if (!state.ai.running && dom.aiReasonText) {
        dom.aiReasonText.textContent = '추천 수: ' + describeAiMove(state.ai.bestMove);
      }
    } else {
      state.ai.bestMove = null;
      if (!state.ai.running && dom.aiReasonText) {
        dom.aiReasonText.textContent =
          "추천 위치 표시 꺼짐 — '다음 위치 추천'을 체크하면 최적의 수를 안내합니다.";
      }
    }
  }

  function placePiece(slotIndex, row, col) {
    if (state.gameOver) return false;
    const piece = state.tray[slotIndex];
    if (!piece || piece.used) return false;
    if (!canPlace(piece.shape, row, col, state.board)) {
      sfxInvalid();
      return false;
    }

    // Save undo snapshot
    state.history = cloneState();

    let placedCells = 0;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[0].length; c++) {
        if (piece.shape[r][c]) {
          state.board[row + r][col + c] = piece.color;
          placedCells++;
        }
      }
    }
    piece.used = true;
    state.selectedSlot = null;

    // Check completed rows and columns
    const { fullRows, fullCols } = findCompletedLines(state.board);
    const totalLines = fullRows.length + fullCols.length;
    let gained = placedCells * 10;

    if (totalLines > 0) {
      state.combo += 1;
      const lineBonus = totalLines * 100 * totalLines;
      const comboBonus = state.combo > 1 ? (state.combo - 1) * 50 : 0;
      gained += lineBonus + comboBonus;

      const clearedSet = new Set();
      fullRows.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) clearedSet.add(`${r},${c}`);
      });
      fullCols.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) clearedSet.add(`${r},${c}`);
      });

      clearedSet.forEach(key => {
        const [rr, cc] = key.split(',').map(Number);
        const colObj = state.board[rr][cc];
        if (colObj) spawnParticles(rr, cc, colObj, 6);
        state.board[rr][cc] = null;
      });

      const center = getCellCenter(
        Math.min(GRID_SIZE - 1, row + Math.floor(piece.shape.length / 2)),
        Math.min(GRID_SIZE - 1, col + Math.floor(piece.shape[0].length / 2))
      );
      const label = state.combo > 1 ? `+${gained} (COMBO x${state.combo})` : `+${gained}`;
      spawnFloatingText(center.x, center.y, label, state.combo > 1 ? '#38bdf8' : '#fde68a');
      sfxClear(totalLines, state.combo);
    } else {
      state.combo = 0;
      sfxPlace();
    }

    state.score += gained;
    let isNewBest = false;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBest(state.bestScore);
      isNewBest = true;
    }

    if (state.tray.every(p => p.used)) {
      refillTray();
    }

    if (checkGameOver(state.tray, state.board)) {
      state.gameOver = true;
      showGameOverOverlay(isNewBest);
      sfxGameOver();
    }

    updateHUD();
    renderTray();
    syncAiRecommendation();
    return true;
  }

  function undoLastMove() {
    if (!state.history || state.gameOver) return;
    restoreSnapshot(state.history);
    updateHUD();
    renderTray();
    syncAiRecommendation();
  }

  function startNewGame() {
    resetGameState();
    hideGameOverOverlay();
    updateHUD();
    renderTray();
    syncAiRecommendation();
  }

  PrismaBlock.Game = {
    placePiece,
    undoLastMove,
    startNewGame,
    syncAiRecommendation
  };
})(window);

