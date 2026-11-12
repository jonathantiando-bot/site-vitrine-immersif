"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectTier, prefersReducedMotion, supportsWebGL, type QualityTier } from "@/lib/device";
import { StaticExperience } from "./StaticExperience";
import { ProductSection, Footer } from "./ProductSection";
import type { LabelFonts } from "./three/textures";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

type Mode = "pending" | "immersive" | "static";

export default function DevverseApp({ fonts }: { fonts: LabelFonts }) {
  const [mode, setMode] = useState<Mode>("pending");
  const [tier, setTier] = useState<QualityTier>("high");
  const [fontsReady, setFontsReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const gl = supportsWebGL();
    setWebgl(gl);
    setTier(detectTier());
    const saved = sessionStorage.getItem("devverse-mode") as Mode | null;
    if (!gl) setMode("static");
    else if (saved === "immersive" || saved === "static") setMode(saved);
    else setMode(prefersReducedMotion() ? "static" : "immersive");

    // Les polices doivent être prêtes avant de dessiner l'étiquette de la canette
    const loads = [
      document.fonts.load(`italic 900 64px ${fonts.display}`),
      document.fonts.load(`900 64px ${fonts.display}`),
      document.fonts.load(`700 32px ${fonts.body}`),
      document.fonts.load(`600 32px ${fonts.body}`),
      document.fonts.load(`500 32px ${fonts.body}`),
    ];
    Promise.allSettled(loads).then(() => setFontsReady(true));
  }, [fonts]);

  const toggle = () => {
    const next: Mode = mode === "immersive" ? "static" : "immersive";
    sessionStorage.setItem("devverse-mode", next);
    document.documentElement.classList.remove("is-loading");
    setMode(next);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <a className="skip-link" href="#produit">
        Aller au contenu produit
      </a>
      <header className="site-header">
        <a href="#" className="brand" aria-label="DEVVERSE ENERGY — accueil">
          <span className="brand-d" aria-hidden="true">D</span>
          <span className="brand-name">DEVVERSE <b>ENERGY</b></span>
        </a>
        {webgl && mode !== "pending" && (
          <button type="button" className="mode-toggle" onClick={toggle} aria-pressed={mode === "static"}>
            {mode === "immersive" ? "Mode simplifié" : "Mode immersif 3D"}
          </button>
        )}
      </header>

      <main>
        {mode === "immersive" && fontsReady && <Experience tier={tier} fonts={fonts} />}
        {mode === "immersive" && !fontsReady && <div className="experience-placeholder" />}
        {mode === "static" && <StaticExperience />}
        {mode === "pending" && <div className="experience-placeholder" />}
        <ProductSection />
      </main>
      <Footer />
    </>
  );
}
