import Image from "next/image";
import { product } from "@/config/product";
import { Icon } from "./ui/Icon";

/**
 * Version accessible sans 3D ni animation de scroll :
 * utilisée si prefers-reduced-motion, si WebGL est indisponible,
 * ou si l'utilisateur choisit le « mode simplifié ».
 */
export function StaticExperience() {
  return (
    <div className="static">
      <section className="static-hero container" aria-labelledby="static-title">
        <div>
          <p className="eyebrow">DEVVERSE ENERGY · {product.volume}</p>
          <h1 id="static-title" className="display">
            L&apos;énergie a un <span className="grad">nouveau nom.</span>
          </h1>
          <p className="lead">{product.tagline}</p>
          <a className="btn btn-primary" href="#produit">
            Découvrir DEVVERSE ENERGY
          </a>
        </div>
        <figure className="static-visual">
          <Image
            src="/images/devverse-reference.jpg"
            alt="Canette DEVVERSE ENERGY vue de face, de droite, de dos, de gauche, de dessus et de dessous"
            width={1024}
            height={682}
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
          />
        </figure>
      </section>

      <section className="container static-block" aria-labelledby="static-ing">
        <h2 id="static-ing" className="display small-display">
          Au cœur de <span className="grad">la formule</span>
        </h2>
        <ul className="ing-grid static-grid">
          {product.ingredients.map((ing) => (
            <li key={ing.id} className="ing is-static" style={{ "--c": ing.color } as React.CSSProperties}>
              <span className="ing-icon"><Icon name={ing.icon} size={24} /></span>
              <span className="ing-name">{ing.name}</span>
              <span className="ing-detail">{ing.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container static-block center" aria-label="Signature">
        <h2 className="display">
          Libère ton <span className="grad">potentiel.</span>
        </h2>
      </section>
    </div>
  );
}
