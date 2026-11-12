/**
 * DEVVERSE ENERGY — configuration produit centralisée.
 *
 * ⚠️ IMPORTANT : les valeurs ci-dessous sont reprises telles quelles du visuel
 * de référence (maquette packaging). Elles NE SONT PAS une formule validée.
 * Tant que `formulaValidated` vaut `false`, le site affiche une mention
 * « Données indicatives — formule en cours de validation ».
 * Aucun bénéfice médical n'est revendiqué : seuls des libellés marketing
 * neutres sont affichés.
 */

export type NutritionRow = {
  label: string;
  per100: string;
  perServing: string;
  indent?: boolean;
};

export type Ingredient = {
  id: string;
  name: string;
  detail: string;
  /** Couleur du halo (hex) */
  color: string;
  /** Pictogramme simple (voir components/ui/Icon.tsx) */
  icon: "bolt" | "molecule" | "pill" | "leaf" | "drop" | "fruit" | "citrus" | "shield";
};

export const product = {
  name: "DEVVERSE ENERGY",
  tagline: "UNLEASH YOUR ENERGY",
  volume: "330 ml",
  formulaValidated: false,

  /** Boutique : passer à true + renseigner l'URL pour afficher le bouton d'achat. */
  shop: {
    enabled: false,
    url: "#",
    price: "2,49 €",
    label: "ACHETER MAINTENANT",
  },

  /**
   * Modèle 3D : laisser `null` pour utiliser la canette procédurale.
   * Pour remplacer par un vrai modèle, déposer un fichier dans /public/models
   * puis renseigner par ex. "/models/devverse-can.glb".
   * Le modèle doit être centré, axe Y vertical, hauteur ≈ 2.6 unités.
   */
  modelUrl: null as string | null,

  nutritionServing: "330 ml",
  nutrition: [
    { label: "Énergie", per100: "46 kJ / 11 kcal", perServing: "152 kJ / 36 kcal" },
    { label: "Matières grasses", per100: "0 g", perServing: "0 g" },
    { label: "dont acides gras saturés", per100: "0 g", perServing: "0 g", indent: true },
    { label: "Glucides", per100: "2,6 g", perServing: "8,6 g" },
    { label: "dont sucres", per100: "2,4 g", perServing: "7,9 g", indent: true },
    { label: "Protéines", per100: "0 g", perServing: "0 g" },
    { label: "Sel", per100: "0,12 g", perServing: "0,40 g" },
  ] as NutritionRow[],

  /** Indicateurs circulaires (pour 330 ml). `ratio` = remplissage visuel 0..1 */
  highlights: [
    { label: "Énergie", value: "36", unit: "kcal", ratio: 0.36 },
    { label: "Sucres", value: "7,9", unit: "g", ratio: 0.55 },
    { label: "Lipides", value: "0", unit: "g", ratio: 0.02 },
    { label: "Sel", value: "0,40", unit: "g", ratio: 0.25 },
  ],

  vitamins: [
    { label: "Niacine (B3)", amount: "16 mg", ar: "100 % AR*" },
    { label: "Vitamine B6", amount: "1,4 mg", ar: "100 % AR*" },
    { label: "Vitamine B12", amount: "2,5 µg", ar: "100 % AR*" },
  ],

  ingredientsText:
    "Eau gazéifiée, sucre, jus de fruit concentré (fruits rouges), taurine (0,4 %), caféine (0,03 %), vitamines (B3, B6, B12), arômes naturels, acidifiant (acide citrique), conservateur (sorbate de potassium).",

  ingredients: [
    { id: "caffeine", name: "Caféine", detail: "0,03 %", color: "#8B2CFF", icon: "bolt" },
    { id: "taurine", name: "Taurine", detail: "0,4 %", color: "#087BFF", icon: "molecule" },
    { id: "vitamins", name: "Vitamines", detail: "B3 · B6 · B12", color: "#B66BFF", icon: "pill" },
    { id: "aromas", name: "Arômes naturels", detail: "Fruits rouges", color: "#3FA2FF", icon: "leaf" },
    { id: "juice", name: "Jus de fruit", detail: "Concentré", color: "#C04BFF", icon: "fruit" },
    { id: "water", name: "Eau gazéifiée", detail: "Base", color: "#5AB8FF", icon: "drop" },
    { id: "citric", name: "Acide citrique", detail: "Acidifiant", color: "#9D5CFF", icon: "citrus" },
    { id: "sorbate", name: "Sorbate de K", detail: "Conservateur", color: "#2F8BFF", icon: "shield" },
  ] as Ingredient[],

  /**
   * Note : la maquette mentionnait aussi « Sans conservateur artificiel », ce qui
   * contredit la présence de sorbate de potassium dans la liste d'ingrédients.
   * Ce badge est volontairement retiré en attendant la validation.
   */
  badges: ["Sans colorant artificiel", "Vegan", "Recyclable"],
  barcode: "3760328491027",

  /**
   * Mention réglementaire (UE, boissons > 150 mg/L de caféine).
   * À ajuster selon la teneur réelle validée (0,03 % ≈ 30 mg / 100 ml).
   */
  legalNotice:
    "Teneur élevée en caféine. Déconseillé aux enfants et aux femmes enceintes ou allaitantes (30 mg / 100 ml). À consommer dans le cadre d'une alimentation variée et équilibrée et d'un mode de vie sain.",
};

export type Product = typeof product;
