/**
 * AI 오토파일럿 제어 및 UI 이벤트 바인딩 모듈
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { ensureAudio } = PrismaBlock.Sound;
  const { state } = PrismaBlock.State;
  const { dom } = PrismaBlock.DOM;
  const { renderTray } = PrismaBlock.Renderer;
  const { findBestMove, describeAiMove } = PrismaBlock.AIEngine;
  const { placePiece, startNewGame, syncAiRecommendation } = PrismaBlock.Game;

  function stopAi() {
    state.ai.running = false;
    clearTimeout(state.ai.timer);
    dom.btnAiToggle.textContent = 'AI 자동 시작';
    dom.btnAiToggle.className =
      'px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white text-xs font-bold shadow-md active:scale-95 transition';
    dom.aiStatusDot.className =
      'w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 transition-colors';
    dom.aiBadge.textContent = '대기 중';
    dom.aiBadge.className =
      'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700';
    syncAiRecommendation();
  }

  function executeAiStep() {
    if (state.gameOver) {
      if (state.ai.running && dom.aiAutoRestartEl && dom.aiAutoRestartEl.checked) {
        startNewGame();
        state.ai.movesCount = 0;
        dom.aiMovesCountEl.textContent = '0';
      } else {
        stopAi();
        return;
      }
    }

    const move = findBestMove();

    if (!move) {
      dom.aiReasonText.textContent = '더 이상 둘 수 있는 수가 없습니다.';
      stopAi();
      return;
    }

    state.selectedSlot = move.slotIndex;
    renderTray();

    const placed = placePiece(move.slotIndex, move.r, move.c);
    if (placed) {
      state.ai.movesCount++;
      dom.aiMovesCountEl.textContent = String(state.ai.movesCount);
      dom.aiReasonText.textContent = describeAiMove(move);
    }
  }

  function scheduleNextAiStep() {
    if (!state.ai.running) return;
    clearTimeout(state.ai.timer);
    const delay = parseInt(dom.aiSpeedEl.value || '260', 10);
    state.ai.timer = setTimeout(() => {
      if (!state.ai.running) return;
      executeAiStep();
      if (state.ai.running) scheduleNextAiStep();
    }, delay);
  }

  function startAi() {
    ensureAudio();
    state.ai.running = true;
    dom.btnAiToggle.textContent = 'AI 일시정지';
    dom.btnAiToggle.className =
      'px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md active:scale-95 transition';
    dom.aiStatusDot.className =
      'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 transition-colors';
    dom.aiBadge.textContent = '자동 플레이 중';
    dom.aiBadge.className =
      'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
    syncAiRecommendation();
    scheduleNextAiStep();
  }

  function bindAiEvents() {
    dom.btnAiToggle.addEventListener('click', () => {
      if (state.ai.running) {
        stopAi();
      } else {
        startAi();
      }
    });

    dom.btnAiHint.addEventListener('click', () => {
      ensureAudio();
      if (state.ai.running) stopAi();
      executeAiStep();
    });

    if (dom.aiShowHintEl) {
      dom.aiShowHintEl.addEventListener('change', () => {
        state.ai.showHint = dom.aiShowHintEl.checked;
        syncAiRecommendation();
      });
    }

    dom.aiStrategyEl.addEventListener('change', () => {
      syncAiRecommendation();
    });

    dom.aiSpeedEl.addEventListener('change', () => {
      if (state.ai.running) {
        scheduleNextAiStep();
      }
    });
  }

  PrismaBlock.AIController = {
    startAi,
    stopAi,
    executeAiStep,
    scheduleNextAiStep,
    bindAiEvents
  };
})(window);

