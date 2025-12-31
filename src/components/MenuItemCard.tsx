import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { detectAllergens, inferDietaryTags } from "@/lib/menu/tagging";

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  dining_hall_id?: string | null;
  meal_type?: "breakfast" | "lunch" | "dinner";
  category?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  tags?: string[];
}

const hallNames: Record<string, string> = {
  worcester: "Worcester",
  franklin: "Franklin",
  berkshire: "Berkshire",
  hampshire: "Hampshire",
};

const tagVariantMap: Record<
  string,
  "vegetarian" | "vegan" | "glutenFree" | "dairyFree" | "halal" | "maroon" | "secondary"
> = {
  vegetarian: "vegetarian",
  vegan: "vegan",
  "gluten-free": "glutenFree",
  "dairy-free": "dairyFree",
  halal: "halal",
  "high-protein": "maroon",
  healthy: "maroon",
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const inferredTags = inferDietaryTags({ name: item.name, description: item.description, tags: item.tags });
  const allergens = detectAllergens({ name: item.name, description: item.description, tags: item.tags });

  const showNutrition =
    item.calories != null || item.protein != null || item.carbs != null || item.fat != null;

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <h4 className="font-medium text-sm leading-tight mb-1">{item.name}</h4>

      {item.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{item.description}</p>
      )}

      {item.dining_hall_id && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <MapPin className="w-2.5 h-2.5" />
          <span>{hallNames[item.dining_hall_id] || item.dining_hall_id}</span>
        </div>
      )}

      {/* Dietary tags */}
      {inferredTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {inferredTags
            .filter((t) => ["vegetarian", "vegan", "gluten-free", "dairy-free"].includes(t))
            .slice(0, 4)
            .map((tag) => (
              <Badge key={tag} variant={tagVariantMap[tag] || "secondary"} className="text-xs">
                {tag.replace("-", " ")}
              </Badge>
            ))}
        </div>
      )}

      {/* Allergen detection */}
      {allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {allergens.map((a) => (
            <Badge key={a} variant="destructive" className="text-xs">
              {a}
            </Badge>
          ))}
        </div>
      )}

      {/* Nutrition */}
      {showNutrition && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {item.calories != null && <span>{item.calories} cal</span>}
          {item.protein != null && <span>• P {item.protein}g</span>}
          {item.carbs != null && <span>• C {item.carbs}g</span>}
          {item.fat != null && <span>• F {item.fat}g</span>}
        </div>
      )}
    </Card>
  );
}

