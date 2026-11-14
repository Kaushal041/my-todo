import confetti from 'canvas-confetti';

export function fireTaskConfetti() {
  if (typeof window === 'undefined') return;
  
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#8b5cf6', '#10b981', '#38bdf8', '#f59e0b'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });
  } catch {
    // Graceful fallback
  }
}

export function fireBigCelebration() {
  if (typeof window === 'undefined') return;

  try {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#06b6d4', '#f59e0b'],
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Fallback
  }
}
