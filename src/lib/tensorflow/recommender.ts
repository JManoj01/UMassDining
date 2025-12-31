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

// Feature encoding maps
const TAGS = ["vegetarian", "vegan", "gluten-free", "halal", "dairy-free", "high-protein", "healthy"];
const HALLS = ["worcester", "franklin", "berkshire", "hampshire"];
const MEALS = ["breakfast", "lunch", "dinner"];
const CATEGORIES = ["Grill Station", "Pizza Station", "Pasta Station", "Vegetarian", "Salad Bar", "Deli", "Desserts", "International", "Main", "Hot Breakfast", "Other"];

export class TFRecommender {
  private model: tf.LayersModel | null = null;
  private isReady = false;

  // Create a simple neural network for scoring
  async initialize() {
    if (this.isReady) return;

    try {
      // Input: [tags(7), hall(4), meal(3), category(11), nutrition(4), preferences match scores(3)]
      // Total: 32 features
      const inputSize = TAGS.length + HALLS.length + MEALS.length + CATEGORIES.length + 4 + 3;

      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: "relu",
            inputShape: [inputSize],
            kernelInitializer: "glorotNormal",
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: "relu",
            kernelInitializer: "glorotNormal",
          }),
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
      console.log("TensorFlow.js recommender initialized");
    } catch (error) {
      console.error("Error initializing TF model:", error);
      throw error;
    }
  }

  // Encode a menu item into feature vector
  private encodeItem(item: MenuItem, preferences: UserPreferences | null): number[] {
    const features: number[] = [];

    // One-hot encode tags
    TAGS.forEach((tag) => {
      features.push(item.tags.includes(tag) ? 1 : 0);
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
      features.push(item.category === cat ? 1 : 0);
    });

    // Normalize nutrition values
    features.push((item.calories || 0) / 1000);
    features.push((item.protein || 0) / 50);
    features.push((item.carbs || 0) / 100);
    features.push((item.fat || 0) / 50);

    // Preference matching scores
    if (preferences) {
      // Diet match score
      const dietMatch = preferences.dietary_preferences.filter((d) =>
        item.tags.includes(d)
      ).length / Math.max(preferences.dietary_preferences.length, 1);
      features.push(dietMatch);

      // Hall preference score
      const hallMatch = preferences.favorite_halls.includes(item.dining_hall_id || "") ? 1 : 0;
      features.push(hallMatch);

      // Disliked ingredient penalty
      const hasDisliked = preferences.disliked_ingredients.some((ing) =>
        item.name.toLowerCase().includes(ing.toLowerCase()) ||
        (item.description?.toLowerCase().includes(ing.toLowerCase()) ?? false)
      );
      features.push(hasDisliked ? 0 : 1);
    } else {
      features.push(0.5, 0.5, 1);
    }

    return features;
  }

  // Score items using the model
  async scoreItems(
    items: MenuItem[],
    preferences: UserPreferences | null
  ): Promise<ScoredItem[]> {
    if (!this.isReady || !this.model) {
      await this.initialize();
    }

    if (!this.model) {
      // Fallback to rule-based scoring
      return this.ruleBasedScoring(items, preferences);
    }

    try {
      // Encode all items
      const features = items.map((item) => this.encodeItem(item, preferences));
      
      // Create tensor
      const inputTensor = tf.tensor2d(features);
      
      // Get predictions
      const predictions = this.model.predict(inputTensor) as tf.Tensor;
      const scores = await predictions.data();
      
      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();

      // Combine predictions with rule-based adjustments
      const scoredItems: ScoredItem[] = items.map((item, i) => {
        let score = scores[i] * 100;
        
        // Apply preference boosts/penalties
        if (preferences) {
          // Boost for matching dietary preferences
          preferences.dietary_preferences.forEach((diet) => {
            if (item.tags.includes(diet)) score += 10;
          });

          // Boost for favorite halls
          if (item.dining_hall_id && preferences.favorite_halls.includes(item.dining_hall_id)) {
            score += 8;
          }

          // Penalty for disliked ingredients
          preferences.disliked_ingredients.forEach((ing) => {
            const lower = ing.toLowerCase();
            if (
              item.name.toLowerCase().includes(lower) ||
              (item.description?.toLowerCase().includes(lower) ?? false)
            ) {
              score -= 40;
            }
          });
        }

        // Bonus for high protein
        if (item.protein && item.protein > 25) score += 3;

        return {
          ...item,
          score: Math.max(0, Math.min(100, score)),
          confidence: Math.abs(scores[i] - 0.5) * 2,
        };
      });

      return scoredItems.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("TF scoring error, falling back to rules:", error);
      return this.ruleBasedScoring(items, preferences);
    }
  }

  // Fallback rule-based scoring
  private ruleBasedScoring(
    items: MenuItem[],
    preferences: UserPreferences | null
  ): ScoredItem[] {
    return items
      .map((item) => {
        let score = 50;

        if (preferences) {
          preferences.dietary_preferences.forEach((diet) => {
            if (item.tags.includes(diet)) score += 20;
          });

          if (item.dining_hall_id && preferences.favorite_halls.includes(item.dining_hall_id)) {
            score += 15;
          }

          preferences.disliked_ingredients.forEach((ing) => {
            const lower = ing.toLowerCase();
            if (
              item.name.toLowerCase().includes(lower) ||
              (item.description?.toLowerCase().includes(lower) ?? false)
            ) {
              score -= 40;
            }
          });
        }

        if (item.protein && item.protein > 25) score += 5;

        return {
          ...item,
          score: Math.max(0, Math.min(100, score)),
          confidence: 0.7,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Clean up resources
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isReady = false;
    }
  }
}

// Singleton instance
export const recommender = new TFRecommender();
