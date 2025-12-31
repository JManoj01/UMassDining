import { useState, useEffect, useMemo } from "react";
import { Sparkles, RefreshCw, Cpu } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MenuItemCard } from "@/components/MenuItemCard";
import { recommender, MenuItem, UserPreferences, ScoredItem } from "@/lib/tensorflow/recommender";

interface RecommendationEngineProps {
  user: User | null;
}

export function RecommendationEngine({ user }: RecommendationEngineProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [recommendations, setRecommendations] = useState<ScoredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tfReady, setTfReady] = useState(false);

  const currentMeal = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 7 && h < 11) return "breakfast";
    if (h >= 11 && h < 15) return "lunch";
    return "dinner";
  }, []);

  useEffect(() => {
    initTF();
    fetchData();
    return () => recommender.dispose();
  }, [user]);

  const initTF = async () => {
    try {
      await recommender.initialize();
      setTfReady(true);
    } catch (e) {
      console.error("TF init error:", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    
    const { data: menuData } = await supabase
      .from("menu_items")
      .select("*")
      .eq("menu_date", today);

    if (menuData) setItems(menuData as MenuItem[]);

    if (user) {
      const { data: prefData } = await supabase
        .from("user_preferences")
        .select("dietary_preferences, favorite_halls, disliked_ingredients")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prefData) setPrefs(prefData);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!loading && items.length > 0) {
      generateRecommendations();
    }
  }, [items, prefs, loading, currentMeal]);

  const generateRecommendations = async () => {
    const mealItems = items.filter((i) => i.meal_type === currentMeal);
    if (mealItems.length === 0) {
      setRecommendations([]);
      return;
    }

    try {
      const scored = await recommender.scoreItems(mealItems, prefs);
      setRecommendations(scored.slice(0, 8));
    } catch (e) {
      console.error("Scoring error:", e);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground text-sm">Loading recommendations...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h1 className="text-lg font-bold">For You</h1>
          {tfReady && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Cpu className="w-2.5 h-2.5" />
              TensorFlow.js
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData} className="h-7 text-xs">
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Status */}
      {!user && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          Sign in to save preferences and get personalized recommendations.
        </div>
      )}

      {user && prefs && (prefs.dietary_preferences.length > 0 || prefs.favorite_halls.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Filtering:</span>
          {prefs.dietary_preferences.map((d) => (
            <Badge key={d} variant="maroon" className="text-xs">{d}</Badge>
          ))}
          {prefs.favorite_halls.map((h) => (
            <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">
            Top picks for {currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item, i) => (
              <div key={item.id} className="relative">
                <MenuItemCard item={item} />
                <Badge
                  variant="maroon"
                  className="absolute top-2 right-2 text-xs opacity-80"
                >
                  {Math.round(item.score)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-sm text-muted-foreground">No recommendations available</p>
          <p className="text-xs text-muted-foreground mt-1">Refresh menus to generate recommendations</p>
        </div>
      )}
    </div>
  );
}
