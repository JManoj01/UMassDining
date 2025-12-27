import { Star, Flame, Leaf, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    diningHall: string;
    mealType: "breakfast" | "lunch" | "dinner";
    category: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    tags: string[];
    rating: number;
  };
  onClick?: () => void;
}

const tagVariantMap: Record<string, "vegetarian" | "vegan" | "glutenFree" | "halal" | "dairyFree" | "maroon"> = {
  vegetarian: "vegetarian",
  vegan: "vegan",
  "gluten-free": "glutenFree",
  halal: "halal",
  "dairy-free": "dairyFree",
  "high-protein": "maroon",
  healthy: "maroon",
};

const hallNames: Record<string, string> = {
  worcester: "Worcester",
  franklin: "Franklin",
  berkshire: "Berkshire",
  hampshire: "Hampshire",
};

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className="p-4"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <h4 className="font-semibold text-foreground leading-tight">
          {item.name}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
          <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Location */}
      {item.diningHall && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3" />
          <span>{hallNames[item.diningHall] || item.diningHall}</span>
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant={tagVariantMap[tag] || "secondary"}
              className="text-xs px-2 py-0"
            >
              {tag === "vegetarian" && <Leaf className="w-2.5 h-2.5 mr-0.5" />}
              {tag === "vegan" && <Leaf className="w-2.5 h-2.5 mr-0.5" />}
              {tag === "high-protein" && <Flame className="w-2.5 h-2.5 mr-0.5" />}
              {tag.replace("-", " ")}
            </Badge>
          ))}
        </div>
      )}

      {/* Nutrition */}
      {item.calories && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{item.calories} cal</span>
          {item.protein && <span>{item.protein}g protein</span>}
        </div>
      )}
    </Card>
  );
}
