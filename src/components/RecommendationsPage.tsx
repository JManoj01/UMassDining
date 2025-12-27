import { useMemo } from "react";
import { Sparkles, ArrowRight, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItemCard } from "@/components/MenuItemCard";
import { menuItems, diningHalls } from "@/data/diningData";
import { UserPreferences } from "@/components/PreferencesPage";

interface RecommendationsPageProps {
  preferences?: UserPreferences;
  onNavigate: (page: string) => void;
}

export function RecommendationsPage({ preferences, onNavigate }: RecommendationsPageProps) {
  // Get current meal type
  const currentMeal = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  }, []);

  // Filter and score items based on preferences
  const recommendations = useMemo(() => {
    let items = menuItems.filter((item) => item.mealType === currentMeal);

    // Score items based on preferences
    const scoredItems = items.map((item) => {
      let score = item.rating * 10; // Base score from rating

      if (preferences) {
        // Boost for matching dietary preferences
        preferences.dietary.forEach((diet) => {
          if (item.tags.includes(diet)) {
            score += 15;
          }
        });

        // Boost for favorite dining halls
        if (preferences.favoriteHalls.includes(item.diningHall)) {
          score += 10;
        }

        // Penalty for disliked ingredients
        preferences.dislikedIngredients.forEach((ingredient) => {
          if (
            item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
            item.description.toLowerCase().includes(ingredient.toLowerCase())
          ) {
            score -= 50;
          }
        });
      }

      return { ...item, score };
    });

    // Sort by score and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [currentMeal, preferences]);

  // Get top rated items across all meals
  const topRated = useMemo(() => {
    return [...menuItems]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, []);

  const hasPreferences =
    preferences &&
    (preferences.dietary.length > 0 ||
      preferences.favoriteHalls.length > 0 ||
      preferences.dislikedIngredients.length > 0);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Personalized For You</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Recommendations
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {hasPreferences
              ? "Based on your dietary preferences and favorite dining halls."
              : "Set your preferences to get personalized meal recommendations."}
          </p>
        </div>

        {/* Preferences Summary */}
        {hasPreferences && (
          <Card variant="glass" className="mb-8 max-w-2xl mx-auto">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtering for:</span>
                {preferences?.dietary.map((diet) => (
                  <Badge key={diet} variant="maroon">
                    {diet}
                  </Badge>
                ))}
                {preferences?.favoriteHalls.map((hallId) => {
                  const hall = diningHalls.find((h) => h.id === hallId);
                  return hall ? (
                    <Badge key={hallId} variant="secondary">
                      {hall.shortName}
                    </Badge>
                  ) : null;
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("preferences")}
                  className="ml-auto"
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Preferences CTA */}
        {!hasPreferences && (
          <Card variant="elevated" className="mb-12 max-w-2xl mx-auto overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold mb-2">
                  Get Personalized Recommendations
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tell us your dietary preferences and favorite dining halls to see
                  meals tailored just for you.
                </p>
                <Button onClick={() => onNavigate("preferences")}>
                  Set Preferences
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-maroon flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-primary-foreground/50" />
              </div>
            </div>
          </Card>
        )}

        {/* Current Meal Recommendations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Best for {currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Top picks available right now
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("menus")}>
              View All Menus
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MenuItemCard item={item} />
              </div>
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-gold" fill="currentColor" />
            <h2 className="text-2xl font-bold">Student Favorites</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topRated.map((item) => (
              <Card key={item.id} variant="interactive" className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-gold" fill="currentColor" />
                  <span className="font-bold">{item.rating}</span>
                </div>
                <h4 className="font-semibold mb-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <Badge variant="secondary" className="mt-3">
                  {diningHalls.find((h) => h.id === item.diningHall)?.shortName}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
