import { useState, useEffect } from "react";
import { Check, Save, Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "dairy-free", label: "Dairy-Free", icon: "🥛" },
  { id: "high-protein", label: "High Protein", icon: "💪" },
];

const diningHallOptions = [
  { id: "worcester", label: "Worcester" },
  { id: "franklin", label: "Franklin" },
  { id: "berkshire", label: "Berkshire" },
  { id: "hampshire", label: "Hampshire" },
];

interface PreferencesPanelProps {
  user: User;
}

export function PreferencesPanel({ user }: PreferencesPanelProps) {
  const [dietary, setDietary] = useState<string[]>([]);
  const [favoriteHalls, setFavoriteHalls] = useState<string[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, [user.id]);

  const fetchPreferences = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setDietary(data.dietary_preferences || []);
      setFavoriteHalls(data.favorite_halls || []);
      setDislikedIngredients((data.disliked_ingredients || []).join(", "));
    }
    setIsLoading(false);
  };

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

  const handleSave = async () => {
    setIsSaving(true);

    const preferences = {
      user_id: user.id,
      dietary_preferences: dietary,
      favorite_halls: favoriteHalls,
      disliked_ingredients: dislikedIngredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
    };

    const { error } = await supabase
      .from("user_preferences")
      .upsert(preferences, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved!");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading preferences...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Your Preferences</h1>
        <p className="text-muted-foreground">
          Customize your dining recommendations
        </p>
      </div>

      {/* Dietary Preferences */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Dietary Preferences</CardTitle>
          <CardDescription>Select all that apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dietaryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleDietary(option.id)}
                className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  dietary.includes(option.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {dietary.includes(option.id) && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <span className="text-xl">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Halls */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Favorite Dining Halls</CardTitle>
          <CardDescription>
            Prioritize recommendations from these locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {diningHallOptions.map((hall) => (
              <button
                key={hall.id}
                onClick={() => toggleHall(hall.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  favoriteHalls.includes(hall.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {hall.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disliked Ingredients */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg">Ingredients to Avoid</CardTitle>
          <CardDescription>
            Comma-separated list of ingredients you don't like
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={dislikedIngredients}
            onChange={(e) => setDislikedIngredients(e.target.value)}
            placeholder="e.g., mushrooms, olives, cilantro"
            className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
          />
          {dislikedIngredients && (
            <div className="flex flex-wrap gap-1.5 mt-3">
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
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Preferences
      </Button>
    </div>
  );
}
