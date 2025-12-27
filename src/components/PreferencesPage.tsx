import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { dietaryPreferences, diningHalls } from "@/data/diningData";

interface PreferencesPageProps {
  onSave: (preferences: UserPreferences) => void;
  initialPreferences?: UserPreferences;
}

export interface UserPreferences {
  dietary: string[];
  favoriteHalls: string[];
  dislikedIngredients: string[];
}

export function PreferencesPage({ onSave, initialPreferences }: PreferencesPageProps) {
  const [dietary, setDietary] = useState<string[]>(initialPreferences?.dietary || []);
  const [favoriteHalls, setFavoriteHalls] = useState<string[]>(
    initialPreferences?.favoriteHalls || []
  );
  const [dislikedIngredients, setDislikedIngredients] = useState<string>(
    initialPreferences?.dislikedIngredients?.join(", ") || ""
  );

  const toggleDietary = (id: string) => {
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleHall = (id: string) => {
    setFavoriteHalls((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const preferences: UserPreferences = {
      dietary,
      favoriteHalls,
      dislikedIngredients: dislikedIngredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
    };
    onSave(preferences);
    toast.success("Preferences saved!", {
      description: "Your recommendations will now be personalized.",
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Dining Preferences
          </h1>
          <p className="text-muted-foreground text-lg">
            Customize your experience to get personalized meal recommendations.
          </p>
        </div>

        <div className="space-y-8">
          {/* Dietary Preferences */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>
                Select all that apply to filter your recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {dietaryPreferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => toggleDietary(pref.id)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      dietary.includes(pref.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {dietary.includes(pref.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-2xl">{pref.icon}</span>
                    <span className="text-sm font-medium">{pref.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Dining Halls */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Favorite Dining Halls</CardTitle>
              <CardDescription>
                We'll prioritize recommendations from these locations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {diningHalls.map((hall) => (
                  <button
                    key={hall.id}
                    onClick={() => toggleHall(hall.id)}
                    className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      favoriteHalls.includes(hall.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary"
                    }`}
                  >
                    {favoriteHalls.includes(hall.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={hall.imageUrl}
                        alt={hall.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{hall.shortName}</div>
                      <div className="text-xs text-muted-foreground">
                        {hall.location}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disliked Ingredients */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Ingredients to Avoid</CardTitle>
              <CardDescription>
                List any ingredients you don't like (comma-separated).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={dislikedIngredients}
                onChange={(e) => setDislikedIngredients(e.target.value)}
                placeholder="e.g., mushrooms, olives, cilantro"
                className="w-full min-h-[100px] p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {dislikedIngredients && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {dislikedIngredients
                    .split(",")
                    .map((i) => i.trim())
                    .filter((i) => i)
                    .map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            variant="hero"
            size="xl"
            onClick={handleSave}
            className="w-full"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
