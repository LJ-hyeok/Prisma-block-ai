/**
 * DOM 요소 참조 및 상단 HUD(점수/콤보/오버레이) UI 업데이트 모듈
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { state } = PrismaBlock.State;

  const dom = {
    boardWrap: document.getElementById('boardWrap'),
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    dragCanvas: document.getElementById('dragCanvas'),
    dragCtx: document.getElementById('dragCanvas').getContext('2d'),
    traySlots: Array.from(document.querySelectorAll('.tray-slot')),
    trayCanvases: Array.from(document.querySelectorAll('.tray-slot')).map(s =>
      s.querySelector('.tray-canvas')
    ),

    scoreEl: document.getElementById('scoreVal'),
    bestEl: document.getElementById('bestVal'),
    comboEl: document.getElementById('comboVal'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScoreEl: document.getElementById('finalScore'),
    newBestBadge: document.getElementById('newBestBadge'),

    btnUndo: document.getElementById('btnUndo'),
    btnSound: document.getElementById('btnSound'),
    iconSoundOn: document.getElementById('iconSoundOn'),
    iconSoundOff: document.getElementById('iconSoundOff'),
    btnHelp: document.getElementById('btnHelp'),
    helpModal: document.getElementById('helpModal'),
    btnCloseHelp: document.getElementById('btnCloseHelp'),
    btnNewGame: document.getElementById('btnNewGame'),
    btnRestartOverlay: document.getElementById('btnRestartOverlay'),

    // AI Panel Elements
    btnAiToggle: document.getElementById('btnAiToggle'),
    btnAiHint: document.getElementById('btnAiHint'),
    aiStrategyEl: document.getElementById('aiStrategy'),
    aiSpeedEl: document.getElementById('aiSpeed'),
    aiShowHintEl: document.getElementById('aiShowHint'),
    aiAutoRestartEl: document.getElementById('aiAutoRestart'),
    aiStatusDot: document.getElementById('aiStatusDot'),
    aiBadge: document.getElementById('aiBadge'),
    aiReasonText: document.getElementById('aiReasonText'),
    aiMovesCountEl: document.getElementById('aiMovesCount')
  };

  function updateHUD() {
    dom.scoreEl.textContent = String(state.score);
    dom.bestEl.textContent = String(state.bestScore);
    dom.comboEl.textContent = `x${Math.max(1, state.combo)}`;
    dom.btnUndo.disabled = !state.history || state.gameOver;
  }

  function showGameOverOverlay(isNewBest) {
    dom.finalScoreEl.textContent = String(state.score);
    if (isNewBest && state.score > 0) {
      dom.newBestBadge.classList.remove('hidden');
    } else {
      dom.newBestBadge.classList.add('hidden');
    }
    dom.gameOverOverlay.classList.remove('hidden');
  }

  function hideGameOverOverlay() {
    dom.gameOverOverlay.classList.add('hidden');
  }

  PrismaBlock.DOM = {
    dom,
    updateHUD,
    showGameOverOverlay,
    hideGameOverOverlay
  };
})(window);

