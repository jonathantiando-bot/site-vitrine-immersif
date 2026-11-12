import { product } from "@/config/product";
import { Icon } from "./ui/Icon";

/** Section produit classique (affichée dans les deux modes). */
export function ProductSection() {
  return (
    <section id="produit" className="product" aria-labelledby="produit-title">
      <div className="container">
        <header className="product-head">
          <p className="eyebrow">Le produit</p>
          <h2 id="produit-title" className="display">
            DEVVERSE <span className="grad">ENERGY</span>
          </h2>
          <p className="lead">
            Boisson énergisante gazeuse aux fruits rouges, avec caféine, taurine et vitamines B3, B6 et B12. Canette
            aluminium recyclable de {product.volume}.
          </p>
          <ul className="claims" aria-label="Univers de la marque">
            <li><Icon name="bolt" size={20} /> Energy boost</li>
            <li><Icon name="brain" size={20} /> Mental focus</li>
            <li><Icon name="run" size={20} /> Endurance</li>
            <li><Icon name="leaf" size={20} /> Vegan</li>
            <li><Icon name="recycle" size={20} /> Recyclable</li>
          </ul>
          {product.shop.enabled && (
            <div className="shop">
              <span className="price">{product.shop.price}</span>
              <a className="btn btn-primary" href={product.shop.url}>
                {product.shop.label}
              </a>
            </div>
          )}
        </header>

        <div className="product-grid">
          <article className="glass card">
            <h3>Informations nutritionnelles</h3>
            <table className="nutri">
              <caption className="sr-only">Valeurs nutritionnelles moyennes</caption>
              <thead>
                <tr>
                  <th scope="col">Valeurs moyennes</th>
                  <th scope="col">Pour 100 ml</th>
                  <th scope="col">Pour {product.nutritionServing}</th>
                </tr>
              </thead>
              <tbody>
                {product.nutrition.map((r) => (
                  <tr key={r.label} className={r.indent ? "indent" : ""}>
                    <th scope="row">{r.label}</th>
                    <td>{r.per100}</td>
                    <td>{r.perServing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="glass card">
            <h3>Vitamines</h3>
            <table className="nutri">
              <caption className="sr-only">Teneur en vitamines pour une canette</caption>
              <tbody>
                {product.vitamins.map((v) => (
                  <tr key={v.label}>
                    <th scope="row">{v.label}</th>
                    <td>{v.amount}</td>
                    <td>{v.ar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small">*AR : Apports de Référence</p>
            <h3 className="mt">Ingrédients</h3>
            <p className="small">{product.ingredientsText}</p>
          </article>
        </div>

        {!product.formulaValidated && (
          <p className="disclaimer center">
            Les compositions et valeurs affichées sont des données indicatives reprises de la maquette packaging. Elles seront
            mises à jour après validation de la formule.
          </p>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="wordmark" aria-label="DEVVERSE ENERGY">
          <span className="wm-top">DEVVERSE</span>
          <span className="wm-bottom">ENERGY</span>
        </div>
        <p className="legal">{product.legalNotice}</p>
        <p className="small">© {new Date().getFullYear()} DEVVERSE ENERGY. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
