/**
 * 사용자 입력(드래그 앤 드롭, 클릭 배치, 상단 버튼 및 도움말 모달) 이벤트 처리 모듈
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { GRID_SIZE } = PrismaBlock.Constants;
  const { ensureAudio, toggleMute } = PrismaBlock.Sound;
  const { canPlace } = PrismaBlock.Board;
  const { state } = PrismaBlock.State;
  const { dom } = PrismaBlock.DOM;
  const { renderTray, resizeCanvases } = PrismaBlock.Renderer;
  const { placePiece, undoLastMove, startNewGame } = PrismaBlock.Game;

  function computeDragGridPosition() {
    const piece = state.tray[state.dragState.slotIndex];
    if (!piece) return;
    const rect = dom.canvas.getBoundingClientRect();
    const { pad, cell, gap } = state.boardMetrics;
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const totalW = cols * cell + (cols - 1) * gap;
    const totalH = rows * cell + (rows - 1) * gap;
    const offsetY = 48;

    const pieceLeft = state.dragState.pointerX - totalW / 2 - rect.left;
    const pieceTop = state.dragState.pointerY - offsetY - totalH / 2 - rect.top;

    const c = Math.round((pieceLeft - pad) / (cell + gap));
    const r = Math.round((pieceTop - pad) / (cell + gap));

    if (r >= -1 && r < GRID_SIZE && c >= -1 && c < GRID_SIZE) {
      state.dragState.gridR = r;
      state.dragState.gridC = c;
      state.dragState.valid = canPlace(piece.shape, r, c, state.board);
    } else {
      state.dragState.gridR = -1;
      state.dragState.gridC = -1;
      state.dragState.valid = false;
    }
  }

  function getBoardCellFromPointer(e) {
    const rect = dom.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { pad, cell, gap } = state.boardMetrics;
    const c = Math.floor((x - pad) / (cell + gap));
    const r = Math.floor((y - pad) / (cell + gap));
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      return { r, c };
    }
    return null;
  }

  function bindInputEvents() {
    // Pointer Events for Tray Drag & Tap
    dom.traySlots.forEach((slotEl, idx) => {
      slotEl.addEventListener('pointerdown', e => {
        if (state.gameOver) return;
        const piece = state.tray[idx];
        if (!piece || piece.used) return;
        ensureAudio();

        state.dragState.active = true;
        state.dragState.slotIndex = idx;
        state.dragState.startX = e.clientX;
        state.dragState.startY = e.clientY;
        state.dragState.pointerX = e.clientX;
        state.dragState.pointerY = e.clientY;
        state.dragState.moved = false;
        state.dragState.gridR = -1;
        state.dragState.gridC = -1;
        state.dragState.valid = false;
      });
    });

    window.addEventListener('pointermove', e => {
      if (!state.dragState.active) return;
      state.dragState.pointerX = e.clientX;
      state.dragState.pointerY = e.clientY;
      const dist = Math.hypot(
        e.clientX - state.dragState.startX,
        e.clientY - state.dragState.startY
      );
      if (dist > 6 && !state.dragState.moved) {
        state.dragState.moved = true;
        state.selectedSlot = null;
        renderTray();
      }
      if (state.dragState.moved) {
        computeDragGridPosition();
      }
    });

    window.addEventListener('pointerup', () => {
      if (!state.dragState.active) return;
      const idx = state.dragState.slotIndex;
      const wasMoved = state.dragState.moved;
      const r = state.dragState.gridR;
      const c = state.dragState.gridC;
      const valid = state.dragState.valid;

      state.dragState.active = false;
      state.dragState.slotIndex = -1;
      state.dragState.moved = false;

      if (wasMoved) {
        if (valid && r >= 0 && c >= 0) {
          placePiece(idx, r, c);
        } else {
          renderTray();
        }
      } else {
        // Treat as tap-to-select
        state.selectedSlot = state.selectedSlot === idx ? null : idx;
        renderTray();
      }
    });

    window.addEventListener('pointercancel', () => {
      state.dragState.active = false;
      state.dragState.moved = false;
      renderTray();
    });

    // Click-to-place on Board
    dom.canvas.addEventListener('pointermove', e => {
      if (state.dragState.active) return;
      state.hoverCell = getBoardCellFromPointer(e);
    });

    dom.canvas.addEventListener('pointerleave', () => {
      state.hoverCell = null;
    });

    dom.canvas.addEventListener('click', e => {
      if (state.gameOver || state.selectedSlot === null) return;
      const piece = state.tray[state.selectedSlot];
      if (!piece || piece.used) return;
      const cellPos = getBoardCellFromPointer(e);
      if (!cellPos) return;
      const targetR = cellPos.r - Math.floor(piece.shape.length / 2);
      const targetC = cellPos.c - Math.floor(piece.shape[0].length / 2);
      placePiece(state.selectedSlot, targetR, targetC);
    });

    // Buttons & Modals
    dom.btnUndo.addEventListener('click', () => {
      ensureAudio();
      undoLastMove();
    });

    dom.btnSound.addEventListener('click', () => {
      const isMuted = toggleMute();
      dom.iconSoundOn.classList.toggle('hidden', isMuted);
      dom.iconSoundOff.classList.toggle('hidden', !isMuted);
    });

    dom.btnHelp.addEventListener('click', () => {
      dom.helpModal.classList.remove('hidden');
    });

    dom.btnCloseHelp.addEventListener('click', () => {
      dom.helpModal.classList.add('hidden');
    });

    dom.helpModal.addEventListener('click', e => {
      if (e.target === dom.helpModal) dom.helpModal.classList.add('hidden');
    });

    dom.btnNewGame.addEventListener('click', () => {
      ensureAudio();
      startNewGame();
    });

    dom.btnRestartOverlay.addEventListener('click', () => {
      ensureAudio();
      startNewGame();
    });

    window.addEventListener('resize', resizeCanvases);
  }

  PrismaBlock.Input = {
    computeDragGridPosition,
    getBoardCellFromPointer,
    bindInputEvents
  };
})(window);

