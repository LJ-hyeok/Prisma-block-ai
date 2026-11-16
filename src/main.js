/**
 * 애플리케이션 진입점(Entry Point)
 * 모든 모듈의 이벤트 바인딩과 초기 게임 상태를 구동합니다.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { loadBest } = PrismaBlock.Storage;
  const { state } = PrismaBlock.State;
  const { dom } = PrismaBlock.DOM;
  const { resizeCanvases, startRenderLoop } = PrismaBlock.Renderer;
  const { startNewGame } = PrismaBlock.Game;
  const { bindInputEvents } = PrismaBlock.Input;
  const { bindAiEvents } = PrismaBlock.AIController;

  function bootstrap() {
    state.ai.showHint = Boolean(dom.aiShowHintEl && dom.aiShowHintEl.checked);
    bindInputEvents();
    bindAiEvents();

    state.bestScore = loadBest();
    startNewGame();
    resizeCanvases();
    startRenderLoop();
  }

  if (document.readyState === 'complete') {
    bootstrap();
  } else {
    window.addEventListener('load', bootstrap);
  }
})(window);

