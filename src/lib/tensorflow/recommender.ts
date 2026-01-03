import * as tf from "@tensorflow/tfjs";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  dining_hall_id: string | null;
  meal_type: "breakfast" | "lunch" | "dinner";
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  tags: string[];
}

export interface UserPreferences {
  dietary_preferences: string[];
  favorite_halls: string[];
  disliked_ingredients: string[];
}

export interface ScoredItem extends MenuItem {
  score: number;
  confidence: number;
}

// Feature encoding constants
const DIETARY_TAGS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "halal", "kosher"];
const HALLS = ["worcester", "franklin", "berkshire", "hampshire"];
const MEALS = ["breakfast", "lunch", "dinner"];
const CATEGORIES = [
  "Grill", "Pizza", "Pasta", "Plant-Based", "Salad Bar", "Deli",
  "Desserts", "Global", "Breakfast", "Soups", "Comfort", "Entrees"
];

// Scoring weights for personalization
const WEIGHTS = {
  dietaryMatch: 35,      // Strong boost for matching dietary preferences
  hallPreference: 15,    // Moderate boost for favorite halls
  dislikedPenalty: -100, // Hard penalty for disliked ingredients
  nutritionBonus: 5,     // Small bonus for good nutrition
  varietyBonus: 3,       // Small bonus for variety
};

export class TFRecommender {
  private model: tf.LayersModel | null = null;
  private isReady = false;

  async initialize(): Promise<void> {
    if (this.isReady) return;

    try {
      // Feature vector size:
      // Dietary tags (6) + Halls (4) + Meals (3) + Categories (12) + Nutrition (4) + Preference scores (4)
      const inputSize = DIETARY_TAGS.length + HALLS.length + MEALS.length + CATEGORIES.length + 4 + 4;

      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: "relu",
            inputShape: [inputSize],
            kernelInitializer: "glorotNormal",
          }),
          tf.layers.batchNormalization(),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: "relu",
            kernelInitializer: "glorotNormal",
          }),
          tf.layers.dropout({ rate: 0.1 }),
          tf.layers.dense({
            units: 16,
            activation: "relu",
            kernelInitializer: "glorotNormal",
          }),
          tf.layers.dense({
            units: 1,
            activation: "sigmoid",
            kernelInitializer: "glorotNormal",
          }),
        ],
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      this.isReady = true;
      console.log("Recommendation engine initialized");
    } catch (error) {
      console.error("Error initializing model:", error);
      // Continue without the model - will use rule-based scoring
    }
  }

  private normalizeTag(tag: string): string {
    return tag.toLowerCase().replace(/_/g, "-").trim();
  }

  private encodeItem(item: MenuItem, preferences: UserPreferences | null): number[] {
    const features: number[] = [];
    const itemTags = item.tags.map(t => this.normalizeTag(t));

    // One-hot encode dietary tags
    DIETARY_TAGS.forEach((tag) => {
      features.push(itemTags.includes(tag) ? 1 : 0);
    });

    // One-hot encode hall
    HALLS.forEach((hall) => {
      features.push(item.dining_hall_id === hall ? 1 : 0);
    });

    // One-hot encode meal
    MEALS.forEach((meal) => {
      features.push(item.meal_type === meal ? 1 : 0);
    });

    // One-hot encode category
    CATEGORIES.forEach((cat) => {
      features.push((item.category || "").toLowerCase().includes(cat.toLowerCase()) ? 1 : 0);
    });

    // Normalized nutrition values (0-1 scale)
    features.push(Math.min((item.calories || 0) / 800, 1));
    features.push(Math.min((item.protein || 0) / 50, 1));
    features.push(Math.min((item.carbs || 0) / 100, 1));
    features.push(Math.min((item.fat || 0) / 40, 1));

    // Preference matching scores
    if (preferences) {
      const prefTags = preferences.dietary_preferences.map(t => this.normalizeTag(t));
      
      // Dietary match score
      const dietMatch = prefTags.length > 0
        ? prefTags.filter(d => itemTags.includes(d)).length / prefTags.length
        : 0.5;
      features.push(dietMatch);

      // Hall preference score
      const hallMatch = preferences.favorite_halls.includes(item.dining_hall_id || "") ? 1 : 0;
      features.push(hallMatch);

      // Disliked ingredient penalty (inverted: 1 = no disliked, 0 = has disliked)
      const itemText = `${item.name} ${item.description || ""}`.toLowerCase();
      const hasDisliked = preferences.disliked_ingredients.some(
        ing => itemText.includes(ing.toLowerCase())
      );
      features.push(hasDisliked ? 0 : 1);

      // Preference intensity (how strong preferences are)
      const prefIntensity = Math.min(
        (prefTags.length + preferences.favorite_halls.length) / 6,
        1
      );
      features.push(prefIntensity);
    } else {
      features.push(0.5, 0.5, 1, 0);
    }

    return features;
  }

  async scoreItems(
    items: MenuItem[],
    preferences: UserPreferences | null
  ): Promise<ScoredItem[]> {
    if (!this.isReady) {
      await this.initialize();
    }

    // Use hybrid scoring: ML model + rule-based adjustments
    try {
      const features = items.map(item => this.encodeItem(item, preferences));
      
      let mlScores: Float32Array | null = null;
      
      if (this.model) {
        const inputTensor = tf.tensor2d(features);
        const predictions = this.model.predict(inputTensor) as tf.Tensor;
        mlScores = await predictions.data() as Float32Array;
        inputTensor.dispose();
        predictions.dispose();
      }

      const scoredItems: ScoredItem[] = items.map((item, i) => {
        // Start with ML score or baseline
        let score = mlScores ? mlScores[i] * 60 : 50;
        let confidence = mlScores ? Math.abs(mlScores[i] - 0.5) * 2 : 0.5;

        // Apply rule-based adjustments for personalization
        if (preferences) {
          const prefTags = preferences.dietary_preferences.map(t => this.normalizeTag(t));
          const itemTags = item.tags.map(t => this.normalizeTag(t));

          // Dietary preference matching (strong signal)
          let dietaryMatches = 0;
          prefTags.forEach(diet => {
            if (itemTags.includes(diet)) {
              dietaryMatches++;
            }
            // Vegan items also satisfy vegetarian preference
            if (diet === "vegetarian" && itemTags.includes("vegan")) {
              dietaryMatches++;
            }
            // Vegan items also satisfy dairy-free preference
            if (diet === "dairy-free" && itemTags.includes("vegan")) {
              dietaryMatches++;
            }
          });
          
          if (prefTags.length > 0 && dietaryMatches > 0) {
            score += WEIGHTS.dietaryMatch * (dietaryMatches / prefTags.length);
          }

          // Favorite hall boost
          if (item.dining_hall_id && preferences.favorite_halls.includes(item.dining_hall_id)) {
            score += WEIGHTS.hallPreference;
          }

          // Disliked ingredient penalty (hard filter in practice)
          const itemText = `${item.name} ${item.description || ""}`.toLowerCase();
          const hasDisliked = preferences.disliked_ingredients.some(
            ing => ing.trim() && itemText.includes(ing.toLowerCase())
          );
          if (hasDisliked) {
            score += WEIGHTS.dislikedPenalty;
          }
        }

        // Nutrition bonus for high protein, reasonable calories
        if (item.protein && item.protein > 20) {
          score += WEIGHTS.nutritionBonus;
        }
        if (item.calories && item.calories > 100 && item.calories < 600) {
          score += WEIGHTS.nutritionBonus;
        }

        return {
          ...item,
          score: Math.max(0, Math.min(100, score)),
          confidence,
        };
      });

      // Sort by score descending
      return scoredItems.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Scoring error, using rule-based fallback:", error);
      return this.ruleBasedScoring(items, preferences);
    }
  }

  private ruleBasedScoring(
    items: MenuItem[],
    preferences: UserPreferences | null
  ): ScoredItem[] {
    return items
      .map((item) => {
        let score = 50;
        const itemTags = item.tags.map(t => this.normalizeTag(t));

        if (preferences) {
          const prefTags = preferences.dietary_preferences.map(t => this.normalizeTag(t));

          // Dietary matching
          prefTags.forEach(diet => {
            if (itemTags.includes(diet)) score += 25;
            if (diet === "vegetarian" && itemTags.includes("vegan")) score += 25;
            if (diet === "dairy-free" && itemTags.includes("vegan")) score += 15;
          });

          // Hall preference
          if (item.dining_hall_id && preferences.favorite_halls.includes(item.dining_hall_id)) {
            score += 15;
          }

          // Disliked ingredients
          const itemText = `${item.name} ${item.description || ""}`.toLowerCase();
          preferences.disliked_ingredients.forEach(ing => {
            if (ing.trim() && itemText.includes(ing.toLowerCase())) {
              score -= 80;
            }
          });
        }

        // Nutrition bonus
        if (item.protein && item.protein > 20) score += 5;

        return {
          ...item,
          score: Math.max(0, Math.min(100, score)),
          confidence: 0.7,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isReady = false;
    }
  }
}

// Singleton instance
export const recommender = new TFRecommender();
