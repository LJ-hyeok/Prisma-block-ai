/**
 * AI 휴리스틱 평가 및 최적 수 탐색 엔진 모듈
 * AI의 판단 기준(가중치, 전략 모드, 선행 탐색 깊이)을 개선하려면 이 파일을 수정하세요.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { GRID_SIZE } = PrismaBlock.Constants;
  const { canPlace, simulatePlacement } = PrismaBlock.Board;
  const { state } = PrismaBlock.State;
  const { dom } = PrismaBlock.DOM;

  function evaluateBoardState(b, linesCleared, strategy) {
    let filledCount = 0;
    let transitions = 0;
    let isolatedHoles = 0;
    let centerWeight = 0;

    // Row transitions & filled count
    for (let r = 0; r < GRID_SIZE; r++) {
      let prev = true; // border counts as filled
      for (let c = 0; c < GRID_SIZE; c++) {
        const occupied = b[r][c] !== null;
        if (occupied) {
          filledCount++;
          const distCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
          centerWeight += distCenter; // prefer keeping center empty
        } else {
          // Check if surrounded on all 4 sides (isolated hole)
          const up = r === 0 || b[r - 1][c] !== null;
          const down = r === GRID_SIZE - 1 || b[r + 1][c] !== null;
          const left = c === 0 || b[r][c - 1] !== null;
          const right = c === GRID_SIZE - 1 || b[r][c + 1] !== null;
          const neighbors = (up ? 1 : 0) + (down ? 1 : 0) + (left ? 1 : 0) + (right ? 1 : 0);
          if (neighbors === 4) isolatedHoles += 2.2;
          else if (neighbors === 3) isolatedHoles += 0.7;
        }
        if (occupied !== prev) transitions++;
        prev = occupied;
      }
      if (!prev) transitions++;
    }

    // Col transitions
    for (let c = 0; c < GRID_SIZE; c++) {
      let prev = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        const occupied = b[r][c] !== null;
        if (occupied !== prev) transitions++;
        prev = occupied;
      }
      if (!prev) transitions++;
    }

    // Count how many 3x3 regions are completely free (crucial for surviving big 3x3 blocks)
    let free3x3 = 0;
    for (let r = 0; r <= GRID_SIZE - 3; r++) {
      for (let c = 0; c <= GRID_SIZE - 3; c++) {
        let clear = true;
        for (let dr = 0; dr < 3 && clear; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            if (b[r + dr][c + dc] !== null) {
              clear = false;
              break;
            }
          }
        }
        if (clear) free3x3++;
      }
    }

    // Near-complete lines bonus for aggressive mode
    let almostFullLines = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      let cnt = 0;
      for (let c = 0; c < GRID_SIZE; c++) if (b[r][c] !== null) cnt++;
      if (cnt === 6 || cnt === 7) almostFullLines += cnt - 5;
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let cnt = 0;
      for (let r = 0; r < GRID_SIZE; r++) if (b[r][c] !== null) cnt++;
      if (cnt === 6 || cnt === 7) almostFullLines += cnt - 5;
    }

    const has3x3Safety = free3x3 > 0 ? 35 : -65;

    if (strategy === 'aggressive') {
      return (
        linesCleared * linesCleared * 165 +
        almostFullLines * 14 -
        filledCount * 2.2 -
        transitions * 4.5 -
        isolatedHoles * 16 +
        centerWeight * 1.1 +
        has3x3Safety * 0.6
      );
    } else if (strategy === 'survival') {
      return (
        linesCleared * 115 +
        free3x3 * 9.5 +
        has3x3Safety * 1.5 -
        filledCount * 4.2 -
        transitions * 8.2 -
        isolatedHoles * 28 +
        centerWeight * 2.2
      );
    } else {
      // balanced
      return (
        linesCleared * linesCleared * 130 +
        free3x3 * 6.0 +
        has3x3Safety -
        filledCount * 3.2 -
        transitions * 6.4 -
        isolatedHoles * 22 +
        centerWeight * 1.6 +
        almostFullLines * 5
      );
    }
  }

  function findBestMove() {
    if (state.gameOver) return null;
    const strategy = dom.aiStrategyEl ? dom.aiStrategyEl.value : 'balanced';
    const available = [];
    for (let i = 0; i < state.tray.length; i++) {
      if (state.tray[i] && !state.tray[i].used) {
        available.push({ slotIndex: i, piece: state.tray[i] });
      }
    }
    if (available.length === 0) return null;

    let bestCandidate = null;
    let bestScoreVal = -Infinity;

    for (const item of available) {
      const { slotIndex, piece } = item;
      const shape = piece.shape;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!canPlace(shape, r, c, state.board)) continue;

          const sim1 = simulatePlacement(state.board, shape, r, c);
          let score1 = evaluateBoardState(sim1.board, sim1.linesCleared, strategy);

          // 1-step lookahead across remaining pieces in tray
          const others = available.filter(o => o.slotIndex !== slotIndex);
          if (others.length > 0) {
            let bestNext = -Infinity;
            let anyNextPlaceable = false;
            for (const nextItem of others) {
              const nShape = nextItem.piece.shape;
              for (let nr = 0; nr < GRID_SIZE; nr++) {
                for (let nc = 0; nc < GRID_SIZE; nc++) {
                  if (!canPlace(nShape, nr, nc, sim1.board)) continue;
                  anyNextPlaceable = true;
                  const sim2 = simulatePlacement(sim1.board, nShape, nr, nc);
                  const s2 = evaluateBoardState(sim2.board, sim2.linesCleared, strategy);
                  if (s2 > bestNext) bestNext = s2;
                }
              }
            }
            if (anyNextPlaceable) {
              score1 = score1 * 0.55 + bestNext * 0.45;
            } else {
              // Dead end for remaining tray pieces! Heavy penalty
              score1 -= 500;
            }
          }

          if (score1 > bestScoreVal) {
            bestScoreVal = score1;
            bestCandidate = {
              slotIndex,
              r,
              c,
              linesCleared: sim1.linesCleared,
              evalScore: Math.round(score1)
            };
          }
        }
      }
    }

    return bestCandidate;
  }

  function describeAiMove(move) {
    if (!move) return '놓을 수 있는 위치가 없습니다.';
    const slotNum = move.slotIndex + 1;
    const posStr = `(${move.r + 1}행, ${move.c + 1}열)`;
    if (move.linesCleared >= 2) {
      return `${slotNum}번 블록 → ${posStr} 배치 (${move.linesCleared}줄 동시 클리어!)`;
    } else if (move.linesCleared === 1) {
      return `${slotNum}번 블록 → ${posStr} 배치 (1줄 클리어 & 공간 정리)`;
    }
    return `${slotNum}번 블록 → ${posStr} 배치 (평가점수 ${move.evalScore >= 0 ? '+' : ''}${move.evalScore})`;
  }

  PrismaBlock.AIEngine = {
    evaluateBoardState,
    findBestMove,
    describeAiMove
  };
})(window);

