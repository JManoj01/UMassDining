import { cn } from "@/lib/utils";
import { mealTypes } from "@/data/diningData";

interface MealTypeSelectorProps {
  selected: string;
  onSelect: (mealType: string) => void;
}

export function MealTypeSelector({ selected, onSelect }: MealTypeSelectorProps) {
  // Determine current meal based on time
  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  };

  const currentMeal = getCurrentMealType();

  return (
    <div className="flex gap-2 p-1 bg-secondary rounded-xl">
      {mealTypes.map((meal) => (
        <button
          key={meal.id}
          onClick={() => onSelect(meal.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
            selected === meal.id
              ? "bg-primary text-primary-foreground shadow-maroon"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span className="text-lg">{meal.icon}</span>
          <span className="hidden sm:inline">{meal.label}</span>
          {meal.id === currentMeal && selected !== meal.id && (
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse-soft" />
          )}
        </button>
      ))}
    </div>
  );
}
