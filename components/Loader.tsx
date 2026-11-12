"use client";

export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const pct = Math.round(progress * 100);
  return (
    <div className={`loader ${done ? "is-done" : ""}`} role="status" aria-live="polite" aria-hidden={done}>
      <div className="loader-inner">
        <div className="loader-logo" aria-hidden="true">
          <span className="wm-top">DEVVERSE</span>
          <span className="wm-bottom">ENERGY</span>
        </div>
        <div className="loader-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="loader-text">
          {pct < 100 ? "Chargement de l'expérience" : "Prêt"} · {pct}%
        </p>
      </div>
    </div>
  );
}
