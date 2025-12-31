import { Leaf, Flame, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const tagStyles: Record<string, string> = {
  vegetarian: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  vegan: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "gluten-free": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  halal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "high-protein": "bg-primary/10 text-primary",
  healthy: "bg-primary/10 text-primary",
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const tags = item.tags || [];

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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                tagStyles[tag] || "bg-muted text-muted-foreground"
              }`}
            >
              {tag === "vegetarian" && <Leaf className="w-2 h-2" />}
              {tag === "vegan" && <Leaf className="w-2 h-2" />}
              {tag === "high-protein" && <Flame className="w-2 h-2" />}
              {tag.replace("-", " ")}
            </span>
          ))}
        </div>
      )}

      {item.calories && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.calories} cal</span>
          {item.protein && <span>• {item.protein}g protein</span>}
        </div>
      )}
    </Card>
  );
}
