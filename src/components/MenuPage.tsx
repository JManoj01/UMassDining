import { useState, useMemo } from "react";
import { ArrowLeft, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MealTypeSelector } from "@/components/MealTypeSelector";
import { MenuItemCard } from "@/components/MenuItemCard";
import { diningHalls, menuItems, DiningHall } from "@/data/diningData";

interface MenuPageProps {
  hallId?: string;
  onBack: () => void;
}

export function MenuPage({ hallId, onBack }: MenuPageProps) {
  const [selectedHall, setSelectedHall] = useState<string>(hallId || "worcester");
  const [selectedMeal, setSelectedMeal] = useState<string>(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  });
  const [searchQuery, setSearchQuery] = useState("");

  const hall = diningHalls.find((h) => h.id === selectedHall) as DiningHall;

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesHall = item.diningHall === selectedHall;
      const matchesMeal = item.mealType === selectedMeal;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesHall && matchesMeal && matchesSearch;
    });
  }, [selectedHall, selectedMeal, searchQuery]);

  // Group items by category
  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-maroon text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dining Halls
          </Button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {hall.name}
              </h1>
              <div className="flex items-center gap-4 text-primary-foreground/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {hall.hours[selectedMeal as keyof typeof hall.hours]}
                </span>
              </div>
            </div>

            {/* Dining Hall Selector */}
            <div className="flex gap-2 flex-wrap">
              {diningHalls.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHall(h.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedHall === h.id
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                  }`}
                >
                  {h.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Meal Selector & Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <MealTypeSelector selected={selectedMeal} onSelect={setSelectedMeal} />
          </div>
          <div className="relative lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-8">
          {hall.features.map((feature) => (
            <Badge key={feature} variant="maroon">
              {feature}
            </Badge>
          ))}
        </div>

        {/* Menu Items */}
        {Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{items.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card variant="elevated" className="p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or selecting a different meal time.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
