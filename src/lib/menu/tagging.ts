export type DietFilter = "vegetarian" | "vegan" | "gluten-free" | "dairy-free";
export type Allergen = "nuts" | "soy" | "shellfish";

type MinimalItem = {
  name: string;
  description?: string | null;
  tags?: string[] | null;
};

const MEAT_KEYWORDS = [
  "beef",
  "chicken",
  "pork",
  "bacon",
  "ham",
  "sausage",
  "pepperoni",
  "turkey",
  "lamb",
  "steak",
  "meatball",
  "prosciutto",
  "salami",
];

const SEAFOOD_KEYWORDS = [
  "fish",
  "salmon",
  "tuna",
  "shrimp",
  "crab",
  "lobster",
  "clam",
  "mussel",
  "oyster",
  "scallop",
  "anchovy",
];

const DAIRY_KEYWORDS = [
  "milk",
  "cheese",
  "butter",
  "cream",
  "yogurt",
  "whey",
  "casein",
  "mozzarella",
  "cheddar",
  "parmesan",
  "feta",
  "gouda",
  "ricotta",
  "ice cream",
];

const EGG_KEYWORDS = ["egg", "omelet", "omelette", "mayo", "aioli"];

const VEGAN_SIGNAL = ["vegan", "plant-based", "plant based"];
const VEGETARIAN_SIGNAL = ["vegetarian"];
const GLUTEN_FREE_SIGNAL = ["gluten-free", "gluten free", "(gf)", "gf "];
const DAIRY_FREE_SIGNAL = ["dairy-free", "dairy free", "(df)", "df "];

const NUT_KEYWORDS = [
  "nut",
  "nuts",
  "peanut",
  "almond",
  "cashew",
  "walnut",
  "pecan",
  "pistachio",
  "hazelnut",
  "macadamia",
];
const SOY_KEYWORDS = ["soy", "soya", "tofu", "edamame", "miso", "tempeh", "tamari"];
const SHELLFISH_KEYWORDS = ["shrimp", "crab", "lobster", "clam", "mussel", "oyster", "scallop"];

function normalize(str: string) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function textBlob(item: MinimalItem) {
  return normalize(`${item.name} ${item.description ?? ""}`);
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function normalizeTag(tag: string) {
  return normalize(tag).replace(/_/g, "-");
}

/**
 * Conservative diet tagging:
 * - Vegan is ONLY applied when explicitly indicated (tag/text), and NEVER when meat/seafood/dairy/egg is detected.
 * - Vegetarian can be inferred if there's no meat/seafood (still guarded).
 */
export function inferDietaryTags(item: MinimalItem): string[] {
  const text = textBlob(item);
  const tags = new Set((item.tags ?? []).map(normalizeTag));

  const hasMeat = hasAny(text, MEAT_KEYWORDS);
  const hasSeafood = hasAny(text, SEAFOOD_KEYWORDS);
  const hasDairy = hasAny(text, DAIRY_KEYWORDS);
  const hasEgg = hasAny(text, EGG_KEYWORDS);

  const vegetarianOk = !hasMeat && !hasSeafood;
  const veganOk = vegetarianOk && !hasDairy && !hasEgg && !text.includes("honey");

  // Explicit signals
  const hasVeganSignal = hasAny(text, VEGAN_SIGNAL) || /\bvg\b/.test(text);
  const hasVegetarianSignal = hasAny(text, VEGETARIAN_SIGNAL) || /\bveg\b/.test(text);
  const hasGlutenFreeSignal = hasAny(text, GLUTEN_FREE_SIGNAL);
  const hasDairyFreeSignal = hasAny(text, DAIRY_FREE_SIGNAL);

  // Guardrails: never keep vegan/vegetarian when meat/seafood is detected
  if (!vegetarianOk) {
    tags.delete("vegetarian");
    tags.delete("vegan");
  }

  // Vegan: ONLY if explicitly signaled AND veganOk
  if ((tags.has("vegan") || hasVeganSignal) && veganOk) {
    tags.add("vegan");
    tags.add("vegetarian");
    tags.add("dairy-free");
  } else {
    tags.delete("vegan");
  }

  // Vegetarian: infer if no meat/seafood OR explicit signal
  if (vegetarianOk && (tags.has("vegetarian") || hasVegetarianSignal || true)) {
    tags.add("vegetarian");
  } else {
    tags.delete("vegetarian");
  }

  if (tags.has("gluten-free") || hasGlutenFreeSignal) tags.add("gluten-free");
  if (tags.has("dairy-free") || hasDairyFreeSignal) tags.add("dairy-free");

  // If dairy/egg detected, ensure we don't imply dairy-free/vegan
  if (hasDairy && !hasDairyFreeSignal) tags.delete("dairy-free");
  if (!veganOk) tags.delete("vegan");

  return Array.from(tags);
}

export function detectAllergens(item: MinimalItem): Allergen[] {
  const text = textBlob(item);
  const allergens: Allergen[] = [];

  if (hasAny(text, NUT_KEYWORDS)) allergens.push("nuts");
  if (hasAny(text, SOY_KEYWORDS)) allergens.push("soy");
  if (hasAny(text, SHELLFISH_KEYWORDS)) allergens.push("shellfish");

  return allergens;
}

export function matchesDietFilters(item: MinimalItem, required: DietFilter[]): boolean {
  if (!required.length) return true;

  const inferred = inferDietaryTags(item);
  const has = (t: DietFilter) => inferred.includes(t);

  return required.every((r) => {
    if (r === "vegetarian") return has("vegetarian") || has("vegan");
    if (r === "dairy-free") return has("dairy-free") || has("vegan");
    return has(r);
  });
}
