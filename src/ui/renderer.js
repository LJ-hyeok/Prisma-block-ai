/**
 * 캔버스 렌더링 및 시각 효과(파티클, 플로팅 텍스트, AI 힌트 프리뷰) 모듈
 * 그래픽 표현이나 애니메이션 효과를 수정하려면 이 파일을 편집하세요.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { GRID_SIZE } = PrismaBlock.Constants;
  const { canPlace } = PrismaBlock.Board;
  const { state } = PrismaBlock.State;
  const { dom } = PrismaBlock.DOM;

  function getCellCenter(r, c) {
    const { pad, cell, gap } = state.boardMetrics;
    return {
      x: pad + c * (cell + gap) + cell / 2,
      y: pad + r * (cell + gap) + cell / 2
    };
  }

  function spawnParticles(r, c, colorObj, count = 7) {
    const center = getCellCenter(r, c);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.6;
      state.particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        color: i % 2 === 0 ? colorObj.light : colorObj.fill,
        alpha: 1,
        size: 3 + Math.random() * 4
      });
    }
  }

  function spawnFloatingText(x, y, text, color = '#fde68a') {
    state.floatingTexts.push({ x, y, text, color, alpha: 1, vy: -1.1 });
  }

  function drawRoundedRect(c, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + radius, y);
    c.arcTo(x + w, y, x + w, y + h, radius);
    c.arcTo(x + w, y + h, x, y + h, radius);
    c.arcTo(x, y + h, x, y, radius);
    c.arcTo(x, y, x + w, y, radius);
    c.closePath();
  }

  function drawTile(c, x, y, size, colorObj, alpha = 1) {
    c.save();
    c.globalAlpha = alpha;
    const r = Math.max(4, size * 0.2);

    const grad = c.createLinearGradient(x, y, x + size, y + size);
    grad.addColorStop(0, colorObj.light);
    grad.addColorStop(0.5, colorObj.fill);
    grad.addColorStop(1, colorObj.dark);

    c.fillStyle = grad;
    drawRoundedRect(c, x, y, size, size, r);
    c.fill();

    // Inner top highlight
    c.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    c.lineWidth = 1.2;
    drawRoundedRect(c, x + 1.2, y + 1.2, size - 2.4, size - 2.4, Math.max(3, r - 1));
    c.stroke();
    c.restore();
  }

  function renderTray() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dom.traySlots.forEach((slotEl, idx) => {
      const piece = state.tray[idx];
      const tc = dom.trayCanvases[idx];
      const tctx = tc.getContext('2d');
      const rect = slotEl.getBoundingClientRect();
      const w = Math.max(60, rect.width);
      const h = Math.max(60, rect.height);

      tc.width = w * dpr;
      tc.height = h * dpr;
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.clearRect(0, 0, w, h);

      slotEl.classList.toggle('used', !piece || piece.used);
      slotEl.classList.toggle('selected', state.selectedSlot === idx && piece && !piece.used);

      if (!piece || piece.used) return;
      if (state.dragState.active && state.dragState.slotIndex === idx && state.dragState.moved) {
        return;
      }

      const rows = piece.shape.length;
      const cols = piece.shape[0].length;
      const maxTile = Math.min((w - 22) / cols, (h - 22) / rows, 22);
      const gap = 3;
      const totalW = cols * maxTile + (cols - 1) * gap;
      const totalH = rows * maxTile + (rows - 1) * gap;
      const startX = (w - totalW) / 2;
      const startY = (h - totalH) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!piece.shape[r][c]) continue;
          drawTile(
            tctx,
            startX + c * (maxTile + gap),
            startY + r * (maxTile + gap),
            maxTile,
            piece.color
          );
        }
      }
    });
  }

  function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = dom.boardWrap.getBoundingClientRect();
    const size = Math.max(200, Math.floor(rect.width));

    dom.canvas.width = size * dpr;
    dom.canvas.height = size * dpr;
    dom.canvas.style.width = `${size}px`;
    dom.canvas.style.height = `${size}px`;
    dom.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = 10;
    const gap = 4;
    const cell = (size - pad * 2 - gap * (GRID_SIZE - 1)) / GRID_SIZE;
    state.boardMetrics = { size, pad, cell, gap, dpr };

    // Drag overlay canvas
    dom.dragCanvas.width = window.innerWidth * dpr;
    dom.dragCanvas.height = window.innerHeight * dpr;
    dom.dragCanvas.style.width = `${window.innerWidth}px`;
    dom.dragCanvas.style.height = `${window.innerHeight}px`;
    dom.dragCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderTray();
  }

  function renderBoard() {
    const { ctx } = dom;
    const { size, pad, cell, gap } = state.boardMetrics;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundedRect(ctx, 0, 0, size, size, 16);
    ctx.fill();

    // Empty & occupied cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = pad + c * (cell + gap);
        const y = pad + r * (cell + gap);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        drawRoundedRect(ctx, x, y, cell, cell, Math.max(4, cell * 0.18));
        ctx.fill();

        if (state.board[r][c]) {
          drawTile(ctx, x, y, cell, state.board[r][c]);
        }
      }
    }

    // Ghost preview (from drag or click-selected)
    let previewPieceIdx = -1;
    let previewR = -1;
    let previewC = -1;
    let previewValid = false;

    if (state.dragState.active && state.dragState.moved && state.dragState.gridR >= 0) {
      previewPieceIdx = state.dragState.slotIndex;
      previewR = state.dragState.gridR;
      previewC = state.dragState.gridC;
      previewValid = state.dragState.valid;
    } else if (state.selectedSlot !== null && state.hoverCell && !state.gameOver) {
      const piece = state.tray[state.selectedSlot];
      if (piece && !piece.used) {
        previewPieceIdx = state.selectedSlot;
        previewR = state.hoverCell.r - Math.floor(piece.shape.length / 2);
        previewC = state.hoverCell.c - Math.floor(piece.shape[0].length / 2);
        previewValid = canPlace(piece.shape, previewR, previewC, state.board);
      }
    }

    // Draw AI best move hint highlight only when '다음 위치 추천' checkbox is enabled
    const aiBestMove = state.ai.bestMove;
    if (
      state.ai.showHint &&
      aiBestMove &&
      state.tray[aiBestMove.slotIndex] &&
      !state.tray[aiBestMove.slotIndex].used &&
      !state.dragState.active
    ) {
      const aiPiece = state.tray[aiBestMove.slotIndex];
      const pulse = 0.28 + 0.14 * Math.sin(performance.now() * 0.008);
      for (let r = 0; r < aiPiece.shape.length; r++) {
        for (let c = 0; c < aiPiece.shape[0].length; c++) {
          if (!aiPiece.shape[r][c]) continue;
          const br = aiBestMove.r + r;
          const bc = aiBestMove.c + c;
          if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) continue;
          const x = pad + bc * (cell + gap);
          const y = pad + br * (cell + gap);
          drawTile(ctx, x, y, cell, aiPiece.color, pulse);
          ctx.save();
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          drawRoundedRect(ctx, x + 1, y + 1, cell - 2, cell - 2, Math.max(4, cell * 0.18));
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    if (previewPieceIdx >= 0 && state.tray[previewPieceIdx]) {
      const piece = state.tray[previewPieceIdx];
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[0].length; c++) {
          if (!piece.shape[r][c]) continue;
          const br = previewR + r;
          const bc = previewC + c;
          if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) continue;
          const x = pad + bc * (cell + gap);
          const y = pad + br * (cell + gap);
          if (previewValid) {
            drawTile(ctx, x, y, cell, piece.color, 0.42);
          } else {
            ctx.save();
            ctx.fillStyle = 'rgba(244, 63, 94, 0.32)';
            ctx.strokeStyle = 'rgba(251, 113, 133, 0.7)';
            ctx.lineWidth = 1.5;
            drawRoundedRect(ctx, x, y, cell, cell, Math.max(4, cell * 0.18));
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.alpha -= 0.028;
      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.018;
      if (ft.alpha <= 0) {
        state.floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = '800 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  function renderDragLayer() {
    const { dragCtx } = dom;
    dragCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!state.dragState.active || !state.dragState.moved) return;
    const piece = state.tray[state.dragState.slotIndex];
    if (!piece || piece.used) return;

    const { cell, gap } = state.boardMetrics;
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const totalW = cols * cell + (cols - 1) * gap;
    const totalH = rows * cell + (rows - 1) * gap;

    // Offset slightly upward on touch/drag so finger doesn't cover the piece
    const offsetY = 48;
    const startX = state.dragState.pointerX - totalW / 2;
    const startY = state.dragState.pointerY - offsetY - totalH / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!piece.shape[r][c]) continue;
        drawTile(
          dragCtx,
          startX + c * (cell + gap),
          startY + r * (cell + gap),
          cell,
          piece.color,
          0.92
        );
      }
    }
  }

  function loop() {
    renderBoard();
    renderDragLayer();
    state.animId = requestAnimationFrame(loop);
  }

  function startRenderLoop() {
    if (state.animId) cancelAnimationFrame(state.animId);
    state.animId = requestAnimationFrame(loop);
  }

  PrismaBlock.Renderer = {
    getCellCenter,
    spawnParticles,
    spawnFloatingText,
    drawRoundedRect,
    drawTile,
    renderTray,
    resizeCanvases,
    renderBoard,
    renderDragLayer,
    startRenderLoop
  };
})(window);

