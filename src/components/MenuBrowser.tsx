import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MealTypeSelector } from "@/components/MealTypeSelector";
import { MenuItemCard } from "@/components/MenuItemCard";

interface DiningHall {
  id: string;
  name: string;
  short_name: string;
  location: string;
  features: string[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  dining_hall_id: string | null;
  meal_type: "breakfast" | "lunch" | "dinner";
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  tags: string[];
}

export function MenuBrowser() {
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [selectedMeal, setSelectedMeal] = useState<string>(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 15) return "lunch";
    return "dinner";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [hallsResponse, itemsResponse] = await Promise.all([
      supabase.from("dining_halls").select("*"),
      supabase.from("menu_items").select("*").eq("menu_date", new Date().toISOString().split("T")[0]),
    ]);

    if (hallsResponse.data) {
      setDiningHalls(hallsResponse.data);
    }
    if (itemsResponse.data) {
      setMenuItems(itemsResponse.data as MenuItem[]);
    }
    
    setIsLoading(false);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesHall = selectedHall === "all" || item.dining_hall_id === selectedHall;
      const matchesMeal = item.meal_type === selectedMeal;
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesHall && matchesMeal && matchesSearch;
    });
  }, [menuItems, selectedHall, selectedMeal, searchQuery]);

  // Group by category
  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Browse Menus</h1>
        <p className="text-muted-foreground">
          View today's menu items across all dining halls
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <MealTypeSelector selected={selectedMeal} onSelect={setSelectedMeal} />
        </div>
        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Dining Hall Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedHall("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedHall === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All Halls
        </button>
        {diningHalls.map((hall) => (
          <button
            key={hall.id}
            onClick={() => setSelectedHall(hall.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedHall === hall.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {hall.short_name}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading menus...
        </div>
      ) : Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                {category}
                <Badge variant="secondary">{items.length}</Badge>
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={{
                      ...item,
                      description: item.description || "",
                      diningHall: item.dining_hall_id || "",
                      mealType: item.meal_type,
                      category: item.category || "",
                      rating: 4.0,
                    }} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card variant="elevated" className="p-8 text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <h3 className="text-lg font-bold mb-2">No menu items yet</h3>
          <p className="text-muted-foreground text-sm">
            Menu data will be loaded once the scraper fetches today's meals.
          </p>
        </Card>
      )}
    </div>
  );
}
