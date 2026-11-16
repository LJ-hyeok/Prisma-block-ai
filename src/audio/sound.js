/**
 * Web Audio API 기반 효과음 모듈
 * 효과음 주파수, 음색, 볼륨 등을 수정하려면 이 파일을 편집하세요.
 */
(function (global) {
  const PrismaBlock = (global.PrismaBlock = global.PrismaBlock || {});

  let audioCtx = null;
  let muted = false;

  function ensureAudio() {
    if (muted) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', vol = 0.12, delay = 0) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const now = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function sfxPlace() {
    playTone(320, 0.09, 'triangle', 0.14);
    playTone(460, 0.08, 'sine', 0.08, 0.02);
  }

  function sfxClear(lines, currentCombo) {
    const base = 440 + Math.min(currentCombo, 6) * 45;
    for (let i = 0; i < Math.min(lines + 1, 5); i++) {
      playTone(base + i * 110, 0.18, 'triangle', 0.14, i * 0.045);
    }
  }

  function sfxInvalid() {
    playTone(170, 0.1, 'sawtooth', 0.06);
  }

  function sfxGameOver() {
    playTone(330, 0.18, 'triangle', 0.12, 0);
    playTone(260, 0.2, 'triangle', 0.12, 0.14);
    playTone(196, 0.32, 'triangle', 0.12, 0.28);
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    if (!muted) ensureAudio();
    return muted;
  }

  PrismaBlock.Sound = {
    ensureAudio,
    playTone,
    sfxPlace,
    sfxClear,
    sfxInvalid,
    sfxGameOver,
    isMuted,
    toggleMute
  };
})(window);

