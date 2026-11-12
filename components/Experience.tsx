"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { product } from "@/config/product";
import { SCENES, TIMELINE_LENGTH } from "@/lib/scenes";
import { buildMasterTimeline } from "@/lib/timeline";
import { pointer } from "@/lib/sceneState";
import type { QualityTier } from "@/lib/device";
import type { LabelFonts } from "./three/textures";
import { Icon } from "./ui/Icon";
import { Loader } from "./Loader";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// La scène 3D n'est chargée que côté client, en différé (code-splitting)
const Stage = dynamic(() => import("./three/Stage"), { ssr: false });

type Props = { tier: QualityTier; fonts: LabelFonts };

const VIEW_LABELS = ["Face avant", "Côté droit", "Arrière", "Côté gauche", "Face avant"];
const ZOOMS = [
  { title: "Logo D métallique", text: "Un monogramme chromé, taillé pour la vitesse." },
  { title: "DEVVERSE ENERGY", text: "Une signature futuriste, violet électrique sur noir profond." },
  { title: "Finitions", text: "Aluminium brossé, rebords polis, fond bombé." },
  { title: "Ouverture", text: "La languette se soulève. Le moment commence." },
  { title: "Condensation", text: "Servie fraîche. Chaque goutte capte la lumière." },
];

export default function Experience({ tier, fonts }: Props) {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0.08);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [current, setCurrent] = useState(0);
  const navFill = useRef<HTMLSpanElement>(null);

  // Verrouille le scroll pendant le chargement, démarre toujours au début
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");
    setProgress(0.45);
    const t = setTimeout(() => setProgress(0.7), 200);
    return () => clearTimeout(t);
  }, []);

  const onReady = useCallback(() => {
    setProgress(1);
    setTimeout(() => {
      setReady(true);
      document.documentElement.classList.remove("is-loading");
      ScrollTrigger.refresh();
    }, 450);
  }, []);

  // Timeline maître pilotée par le scroll
  useGSAP(
    () => {
      const el = root.current!;
      ScrollTrigger.config({ ignoreMobileResize: true });
      const tl = buildMasterTimeline(el);
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        animation: tl,
        invalidateOnRefresh: false,
        onUpdate: (self) => {
          const t = self.progress * TIMELINE_LENGTH;
          let idx = 0;
          SCENES.forEach((s, i) => {
            if (t >= s.start) idx = i;
          });
          setCurrent((c) => (c === idx ? c : idx));
          navFill.current?.style.setProperty("--p", String(self.progress));
        },
      });
    },
    { scope: root },
  );

  // Met la 3D en pause quand la séquence est hors écran (économie GPU/batterie)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const onVis = () => setActive(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Parallaxe souris (desktop uniquement)
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const goToScene = (i: number) => {
    const el = root.current;
    if (!el) return;
    const scene = SCENES[i];
    const total = el.offsetHeight - window.innerHeight;
    // on vise le milieu « lisible » de la scène
    const t = (scene.start + (scene.end - scene.start) * 0.55) / TIMELINE_LENGTH;
    window.scrollTo({ top: el.offsetTop + total * t, behavior: "smooth" });
  };

  const scrollToProduct = () => document.getElementById("produit")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Loader progress={progress} done={ready} />

      <section ref={root} id="experience" className="experience" aria-label="Présentation interactive DEVVERSE ENERGY">
        <div className="stage">
          <Stage tier={tier} fonts={fonts} active={active} onReady={onReady} />

          <div className="overlay">
            {/* Indice de scroll */}
            <div className="scroll-hint" data-a="hint" aria-hidden="true">
              <span>Faites défiler</span>
              <Icon name="arrow" size={18} />
            </div>

            {/* Scène 1 */}
            <h2 className="s1-title" data-a="s1">
              L&apos;énergie a un <br />
              <span className="grad">nouveau nom.</span>
            </h2>

            {/* Scène 2 */}
            <div className="s2" data-a="s2">
              <p className="eyebrow">DEVVERSE ENERGY · {product.volume}</p>
              <h2 className="display">
                Unleash <br />
                <span className="grad">your energy</span>
              </h2>
              <p className="lead">Noir profond, violet électrique, bleu lumineux. Un D métallique qui capte chaque reflet.</p>
            </div>

            {/* Scène 3 */}
            <div className="s3" data-a="s3" aria-hidden="true">
              <svg className="s3-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" className="track" />
                <circle cx="60" cy="60" r="54" className="bar" strokeDasharray={339.29} data-a="s3-ring" />
              </svg>
              <div className="s3-center">
                <span className="deg">360°</span>
                <div className="s3-views">
                  {VIEW_LABELS.map((v, i) => (
                    <span key={i} data-a={`v${i}`} className="s3-view">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scène 4 */}
            <div className="s4">
              <h2 className="s4-title" data-a="s4h">
                Au cœur de <span className="grad">la formule</span>
              </h2>
              <ul className="ing-grid" aria-label="Ingrédients">
                {product.ingredients.map((ing) => (
                  <li key={ing.id} className="ing" data-a="ing" style={{ "--c": ing.color } as React.CSSProperties}>
                    <span className="ing-halo" aria-hidden="true" />
                    <span className="ing-icon">
                      <Icon name={ing.icon} size={24} />
                    </span>
                    <span className="ing-name">{ing.name}</span>
                    <span className="ing-detail">{ing.detail}</span>
                  </li>
                ))}
              </ul>
              <div className="s4-panel glass" data-a="s4p">
                <p className="panel-title">Valeurs nutritionnelles · pour {product.nutritionServing}</p>
                <div className="rings">
                  {product.highlights.map((h) => (
                    <div key={h.label} className="ring-item">
                      <svg viewBox="0 0 64 64" aria-hidden="true">
                        <circle cx="32" cy="32" r="27" className="track" />
                        <circle cx="32" cy="32" r="27" className="bar" strokeDasharray={169.65} data-a="ring" data-ratio={h.ratio} />
                      </svg>
                      <span className="ring-value">
                        {h.value}
                        <small>{h.unit}</small>
                      </span>
                      <span className="ring-label">{h.label}</span>
                    </div>
                  ))}
                </div>
                {!product.formulaValidated && (
                  <p className="disclaimer">Données indicatives issues de la maquette — formule en cours de validation.</p>
                )}
              </div>
            </div>

            {/* Scène 5 */}
            <div className="s5">
              {ZOOMS.map((z, i) => (
                <div key={i} className="zoom-caption" data-a={`z${i}`}>
                  <span className="zoom-index">
                    0{i + 1} <i>/ 05</i>
                  </span>
                  <h3>{z.title}</h3>
                  <p>{z.text}</p>
                </div>
              ))}
            </div>

            {/* Scène 6 */}
            <h2 className="s6-title" data-a="s6">
              Libère ton <span className="grad">potentiel.</span>
            </h2>

            {/* Scène 7 */}
            <div className="s7-logo" data-a="s7-logo">
              <span className="wm-top">DEVVERSE</span>
              <span className="wm-bottom">ENERGY</span>
            </div>
            <div className="s7-cta" data-a="s7-cta">
              <button type="button" className="btn btn-primary" onClick={scrollToProduct}>
                Découvrir DEVVERSE ENERGY
              </button>
              {product.shop.enabled && (
                <a className="btn btn-ghost" href={product.shop.url}>
                  {product.shop.label} · {product.shop.price}
                </a>
              )}
            </div>
          </div>

          {/* Navigation par scènes (accessible au clavier) */}
          <nav className="scene-nav" aria-label="Scènes de la présentation">
            <span className="scene-nav-track" aria-hidden="true">
              <span ref={navFill} className="scene-nav-fill" />
            </span>
            <ol>
              {SCENES.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={i === current ? "is-active" : ""}
                    aria-current={i === current ? "step" : undefined}
                    onClick={() => goToScene(i)}
                  >
                    <span className="dot" aria-hidden="true" />
                    <span className="nav-label">{s.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>
    </>
  );
}
