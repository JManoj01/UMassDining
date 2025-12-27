import { cn } from "@/lib/utils";

const mealTypes = [
  { id: "breakfast", label: "Breakfast", icon: "🌅" },
  { id: "lunch", label: "Lunch", icon: "☀️" },
  { id: "dinner", label: "Dinner", icon: "🌙" },
];

interface MealTypeSelectorProps {
  selected: string;
  onSelect: (mealType: string) => void;
}

export function MealTypeSelector({ selected, onSelect }: MealTypeSelectorProps) {
  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  };

  const currentMeal = getCurrentMealType();

  return (
    <div className="flex gap-1 p-1 bg-secondary rounded-lg">
      {mealTypes.map((meal) => (
        <button
          key={meal.id}
          onClick={() => onSelect(meal.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-all",
            selected === meal.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{meal.icon}</span>
          <span className="hidden sm:inline">{meal.label}</span>
          {meal.id === currentMeal && selected !== meal.id && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
          )}
        </button>
      ))}
    </div>
  );
}
