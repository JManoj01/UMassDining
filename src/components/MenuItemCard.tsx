import { Star, Flame, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/data/diningData";

interface MenuItemCardProps {
  item: MenuItem;
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

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className="p-5 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-gold" fill="currentColor" />
              <span className="text-sm font-medium">{item.rating}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tagVariantMap[tag] || "secondary"}
                className="text-xs"
              >
                {tag === "vegetarian" && <Leaf className="w-3 h-3 mr-1" />}
                {tag === "vegan" && <Leaf className="w-3 h-3 mr-1" />}
                {tag === "high-protein" && <Flame className="w-3 h-3 mr-1" />}
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace("-", " ")}
              </Badge>
            ))}
          </div>

          {/* Nutrition Quick View */}
          {item.calories && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium">{item.calories} cal</span>
              {item.protein && <span>{item.protein}g protein</span>}
              {item.carbs && <span>{item.carbs}g carbs</span>}
            </div>
          )}
        </div>

        {/* Category Badge */}
        <Badge variant="secondary" className="shrink-0 text-xs">
          {item.category}
        </Badge>
      </div>
    </Card>
  );
}
