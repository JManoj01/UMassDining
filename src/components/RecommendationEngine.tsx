import { useState, useEffect, useMemo } from "react";
import { Sparkles, TrendingUp, Star, RefreshCw } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MenuItemCard } from "@/components/MenuItemCard";
import { toast } from "sonner";

interface MenuItem {
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

interface UserPreferences {
  dietary_preferences: string[];
  favorite_halls: string[];
  disliked_ingredients: string[];
}

interface RecommendationEngineProps {
  user: User | null;
}

export function RecommendationEngine({ user }: RecommendationEngineProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentMeal = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const { data: items } = await supabase
      .from("menu_items")
      .select("*")
      .eq("menu_date", today);

    if (items) {
      setMenuItems(items as MenuItem[]);
    }

    if (user) {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefs) {
        setPreferences(prefs);
      }
    }

    setIsLoading(false);
  };

  // Score and rank items
  const recommendations = useMemo(() => {
    const mealItems = menuItems.filter((item) => item.meal_type === currentMeal);

    const scored = mealItems.map((item) => {
      let score = 50; // Base score

      if (preferences) {
        // Boost for matching dietary preferences
        preferences.dietary_preferences.forEach((diet) => {
          if (item.tags.includes(diet)) {
            score += 20;
          }
        });

        // Boost for favorite halls
        if (item.dining_hall_id && preferences.favorite_halls.includes(item.dining_hall_id)) {
          score += 15;
        }

        // Penalty for disliked ingredients
        preferences.disliked_ingredients.forEach((ingredient) => {
          const lowerIngredient = ingredient.toLowerCase();
          if (
            item.name.toLowerCase().includes(lowerIngredient) ||
            (item.description?.toLowerCase().includes(lowerIngredient) ?? false)
          ) {
            score -= 40;
          }
        });
      }

      // Bonus for high protein if user prefers it
      if (item.protein && item.protein > 25) {
        score += 5;
      }

      return { ...item, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [menuItems, preferences, currentMeal]);

  const hasPreferences = preferences && (
    preferences.dietary_preferences.length > 0 ||
    preferences.favorite_halls.length > 0 ||
    preferences.disliked_ingredients.length > 0
  );

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading recommendations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">For You</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Personalized recommendations for {currentMeal}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Card */}
      {!user ? (
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sign in to personalize</p>
                <p className="text-sm text-muted-foreground">
                  Save your dietary preferences for better recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : hasPreferences ? (
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering for:</span>
              {preferences?.dietary_preferences.map((pref) => (
                <Badge key={pref} variant="maroon">
                  {pref}
                </Badge>
              ))}
              {preferences?.favorite_halls.map((hall) => (
                <Badge key={hall} variant="secondary">
                  {hall}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Set your preferences in the Settings tab to get personalized recommendations
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Picks for {currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MenuItemCard
                  item={{
                    ...item,
                    description: item.description || "",
                    diningHall: item.dining_hall_id || "",
                    mealType: item.meal_type,
                    category: item.category || "",
                    rating: 4.0 + (item.score > 60 ? 0.5 : 0),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card variant="elevated" className="p-8 text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-lg font-bold mb-2">No menu data yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Menu items will appear once the daily scraper runs.
          </p>
          <Button variant="outline" onClick={() => toast.info("Menu scraper runs daily at midnight")}>
            Learn More
          </Button>
        </Card>
      )}
    </div>
  );
}
