import { useState, useEffect, useMemo } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MenuItemCard } from "@/components/MenuItemCard";
import { toast } from "sonner";
import { matchesDietFilters, type DietFilter } from "@/lib/menu/tagging";

interface DiningHall {
  id: string;
  name: string;
  short_name: string;
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

const DIET_FILTERS: Array<{ id: DietFilter; label: string }> = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
];

export function MenuBrowser() {
  const [halls, setHalls] = useState<DiningHall[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedHall, setSelectedHall] = useState("all");
  const [selectedMeal, setSelectedMeal] = useState(() => {
    const h = new Date().getHours();
    if (h >= 7 && h < 11) return "breakfast";
    if (h >= 11 && h < 15) return "lunch";
    return "dinner";
  });
  const [dietary, setDietary] = useState<DietFilter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [hallsRes, itemsRes] = await Promise.all([
      supabase.from("dining_halls").select("id, name, short_name"),
      supabase.from("menu_items").select("*").eq("menu_date", new Date().toISOString().split("T")[0]),
    ]);
    if (hallsRes.data) setHalls(hallsRes.data);
    if (itemsRes.data) setItems(itemsRes.data as MenuItem[]);
    setLoading(false);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-menus");
      if (error) throw error;
      toast.success(data.message || "Menus updated");
      await fetchData();
    } catch (e) {
      toast.error("Failed to update menus");
      console.error(e);
    }
    setScraping(false);
  };

  const toggleDiet = (id: DietFilter) => {
    setDietary((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const clearDiet = () => setDietary([]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchHall = selectedHall === "all" || i.dining_hall_id === selectedHall;
      const matchMeal = i.meal_type === selectedMeal;
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      const matchDiet = matchesDietFilters(i, dietary);
      return matchHall && matchMeal && matchSearch && matchDiet;
    });
  }, [items, selectedHall, selectedMeal, search, dietary]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Today's Menu</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScrape}
          disabled={scraping}
          className="h-7 text-xs"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${scraping ? "animate-spin" : ""}`} />
          {scraping ? "Updating..." : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Meal Selector */}
        <div className="flex gap-1 bg-muted rounded-md p-0.5">
          {(["breakfast", "lunch", "dinner"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMeal(m)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                selectedMeal === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Hall Selector */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedHall("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedHall === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            All
          </button>
          {halls.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHall(h.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedHall === h.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {h.short_name}
            </button>
          ))}
        </div>

        {/* Dietary filters */}
        <div className="flex gap-1 flex-wrap items-center">
          {DIET_FILTERS.map((d) => (
            <button
              key={d.id}
              onClick={() => toggleDiet(d.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                dietary.includes(d.id)
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-pressed={dietary.includes(d.id)}
            >
              {d.label}
            </button>
          ))}
          {dietary.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearDiet}>
              Clear
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[150px] max-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                {cat}
                <Badge variant="secondary" className="text-xs">
                  {catItems.length}
                </Badge>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-sm text-muted-foreground">No menu items found</p>
          <p className="text-xs text-muted-foreground mt-1">Try widening filters or refreshing.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleScrape}>
            Fetch Today's Menu
          </Button>
        </div>
      )}
    </div>
  );
}

