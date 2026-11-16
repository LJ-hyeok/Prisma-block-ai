/**
 * 로컬 스토리지(최고 점수 저장/불러오기) 유틸리티
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});
  const { STORAGE_KEY } = PrismaBlock.Constants;

  function loadBest() {
    try {
      const val = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      return Number.isFinite(val) ? val : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(val) {
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch (e) {}
  }

  PrismaBlock.Storage = {
    loadBest,
    saveBest
  };
})(window);

