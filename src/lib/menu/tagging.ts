export type DietFilter = "vegetarian" | "vegan" | "gluten-free" | "dairy-free";
export type Allergen = "nuts" | "soy" | "shellfish" | "eggs" | "wheat" | "dairy";

type MinimalItem = {
  name: string;
  description?: string | null;
  tags?: string[] | null;
};

// Comprehensive keyword lists for accurate detection
const MEAT_KEYWORDS = [
  "beef", "chicken", "pork", "bacon", "ham", "sausage", "pepperoni",
  "turkey", "lamb", "steak", "meatball", "prosciutto", "salami",
  "hot dog", "ribs", "wing", "drumstick", "brisket", "corned beef",
  "pastrami", "chorizo", "bratwurst", "kielbasa", "ground beef",
  "pulled pork", "carnitas", "carne", "pollo", "roast beef"
];

const SEAFOOD_KEYWORDS = [
  "fish", "salmon", "tuna", "shrimp", "crab", "lobster", "clam",
  "mussel", "oyster", "scallop", "anchovy", "cod", "tilapia",
  "mahi", "halibut", "trout", "swordfish", "catfish", "calamari",
  "squid", "octopus", "crawfish", "prawn"
];

const DAIRY_KEYWORDS = [
  "milk", "cheese", "butter", "cream", "yogurt", "mozzarella",
  "cheddar", "parmesan", "feta", "gouda", "ricotta", "brie",
  "ice cream", "whipped", "sour cream", "cream cheese", "alfredo",
  "queso", "nacho cheese", "blue cheese", "provolone", "swiss"
];

const EGG_KEYWORDS = [
  "egg", "omelet", "omelette", "mayo", "mayonnaise", "aioli",
  "meringue", "custard", "quiche", "frittata", "scrambled",
  "poached egg", "fried egg", "egg salad", "hollandaise"
];

const GLUTEN_KEYWORDS = [
  "bread", "pasta", "flour", "wheat", "barley", "rye", "breaded",
  "battered", "crouton", "noodle", "tortilla", "pita", "wrap",
  "bun", "roll", "crust", "panko", "breadcrumb", "soy sauce"
];

// Explicit dietary signals
const VEGAN_SIGNALS = [/\bvegan\b/i, /\bvg\b/i, /\bplant[- ]?based\b/i, /\b100%\s*plant\b/i];
const VEGETARIAN_SIGNALS = [/\bvegetarian\b/i, /\bveg\b/i, /\bmeatless\b/i];
const GLUTEN_FREE_SIGNALS = [/\bgluten[- ]?free\b/i, /\bgf\b/i, /\bceliac[- ]?safe\b/i];
const DAIRY_FREE_SIGNALS = [/\bdairy[- ]?free\b/i, /\bdf\b/i, /\blactose[- ]?free\b/i, /\bnon[- ]?dairy\b/i];

// Allergen keywords
const NUT_KEYWORDS = [
  "nut", "nuts", "peanut", "almond", "cashew", "walnut", "pecan",
  "pistachio", "hazelnut", "macadamia", "pine nut", "praline"
];
const SOY_KEYWORDS = ["soy", "soya", "tofu", "edamame", "miso", "tempeh", "tamari"];
const SHELLFISH_KEYWORDS = ["shrimp", "crab", "lobster", "clam", "mussel", "oyster", "scallop", "crawfish", "prawn"];
const WHEAT_KEYWORDS = ["wheat", "flour", "bread", "pasta", "noodle", "cracker", "cereal"];

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function getTextBlob(item: MinimalItem): string {
  return normalize(`${item.name} ${item.description ?? ""}`);
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k.toLowerCase()));
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

function normalizeTag(tag: string): string {
  return normalize(tag).replace(/_/g, "-");
}

/**
 * Infer dietary tags with strict accuracy:
 * - Vegan: Only if explicitly marked AND no animal products detected
 * - Vegetarian: If no meat/seafood
 * - Gluten-free: If explicitly marked or no gluten ingredients
 * - Dairy-free: If explicitly marked or no dairy ingredients
 */
export function inferDietaryTags(item: MinimalItem): string[] {
  const text = getTextBlob(item);
  const existingTags = new Set((item.tags ?? []).map(normalizeTag));
  const result = new Set<string>();

  // Detect animal products
  const hasMeat = containsAny(text, MEAT_KEYWORDS);
  const hasSeafood = containsAny(text, SEAFOOD_KEYWORDS);
  const hasDairy = containsAny(text, DAIRY_KEYWORDS);
  const hasEgg = containsAny(text, EGG_KEYWORDS);
  const hasGluten = containsAny(text, GLUTEN_KEYWORDS);

  // Safety checks
  const vegetarianSafe = !hasMeat && !hasSeafood;
  const veganSafe = vegetarianSafe && !hasDairy && !hasEgg && !text.includes("honey");
  const glutenFreeSafe = !hasGluten;
  const dairyFreeSafe = !hasDairy;

  // Check explicit signals
  const hasVeganSignal = matchesAny(text, VEGAN_SIGNALS) || existingTags.has("vegan");
  const hasVegetarianSignal = matchesAny(text, VEGETARIAN_SIGNALS) || existingTags.has("vegetarian");
  const hasGlutenFreeSignal = matchesAny(text, GLUTEN_FREE_SIGNALS) || existingTags.has("gluten-free");
  const hasDairyFreeSignal = matchesAny(text, DAIRY_FREE_SIGNALS) || existingTags.has("dairy-free");

  // Apply tags with strict validation
  
  // Vegan: Only if explicitly signaled AND truly vegan-safe
  if (hasVeganSignal && veganSafe) {
    result.add("vegan");
    result.add("vegetarian"); // Vegan implies vegetarian
    result.add("dairy-free"); // Vegan implies dairy-free
  }

  // Vegetarian: If no meat/seafood (either explicit signal or inferred)
  if (vegetarianSafe) {
    if (hasVegetarianSignal || hasVeganSignal) {
      result.add("vegetarian");
    }
    // Infer vegetarian for items without meat/seafood and with vegetarian-friendly names
    if (!hasMeat && !hasSeafood && !text.includes("chicken") && !text.includes("beef")) {
      result.add("vegetarian");
    }
  }

  // Gluten-free: If explicitly marked
  if (hasGlutenFreeSignal) {
    result.add("gluten-free");
  }

  // Dairy-free: If explicitly marked OR if item is vegan
  if (hasDairyFreeSignal || (hasVeganSignal && veganSafe)) {
    if (dairyFreeSafe || hasVeganSignal) {
      result.add("dairy-free");
    }
  }

  // Final validation: remove contradictory tags
  if (hasMeat || hasSeafood) {
    result.delete("vegan");
    result.delete("vegetarian");
  }
  if (hasDairy && !hasDairyFreeSignal) {
    result.delete("vegan");
    result.delete("dairy-free");
  }
  if (hasEgg) {
    result.delete("vegan");
  }

  return Array.from(result);
}

/**
 * Detect allergens in a menu item
 */
export function detectAllergens(item: MinimalItem): Allergen[] {
  const text = getTextBlob(item);
  const allergens: Allergen[] = [];

  if (containsAny(text, NUT_KEYWORDS)) allergens.push("nuts");
  if (containsAny(text, SOY_KEYWORDS)) allergens.push("soy");
  if (containsAny(text, SHELLFISH_KEYWORDS)) allergens.push("shellfish");
  if (containsAny(text, EGG_KEYWORDS)) allergens.push("eggs");
  if (containsAny(text, WHEAT_KEYWORDS)) allergens.push("wheat");
  if (containsAny(text, DAIRY_KEYWORDS)) allergens.push("dairy");

  return allergens;
}

/**
 * Check if an item matches all required dietary filters
 * Uses strict matching with inferred tags for maximum accuracy
 */
export function matchesDietFilters(item: MinimalItem, required: DietFilter[]): boolean {
  if (!required.length) return true;

  const inferred = inferDietaryTags(item);
  
  return required.every(filter => {
    switch (filter) {
      case "vegetarian":
        return inferred.includes("vegetarian") || inferred.includes("vegan");
      case "vegan":
        return inferred.includes("vegan");
      case "gluten-free":
        return inferred.includes("gluten-free");
      case "dairy-free":
        return inferred.includes("dairy-free") || inferred.includes("vegan");
      default:
        return true;
    }
  });
}

/**
 * Get a human-readable description of dietary restrictions
 */
export function getDietaryDescription(tags: string[]): string {
  const normalized = tags.map(normalizeTag);
  const parts: string[] = [];

  if (normalized.includes("vegan")) parts.push("Vegan");
  else if (normalized.includes("vegetarian")) parts.push("Vegetarian");
  if (normalized.includes("gluten-free")) parts.push("Gluten-Free");
  if (normalized.includes("dairy-free") && !normalized.includes("vegan")) parts.push("Dairy-Free");

  return parts.join(" • ");
}
