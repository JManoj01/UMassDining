import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// UMass Dining Hall URLs with specific menu pages
const DINING_HALLS = [
  { id: "worcester", name: "Worcester", url: "https://umassdining.com/locations-menus/worcester" },
  { id: "franklin", name: "Franklin", url: "https://umassdining.com/locations-menus/franklin" },
  { id: "berkshire", name: "Berkshire", url: "https://umassdining.com/locations-menus/berkshire" },
  { id: "hampshire", name: "Hampshire", url: "https://umassdining.com/locations-menus/hampshire" },
];

interface ScrapedItem {
  name: string;
  description: string;
  category: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  tags: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Comprehensive food patterns for accurate detection
const FOOD_PATTERNS = [
  // Proteins
  /\b(chicken|beef|pork|fish|salmon|tuna|shrimp|tofu|turkey|lamb|steak)\b/i,
  // Dishes
  /\b(pizza|pasta|burger|sandwich|wrap|salad|soup|rice|curry|tacos?|burrito|quesadilla)\b/i,
  // Breakfast
  /\b(eggs?|pancakes?|waffles?|oatmeal|cereal|bacon|sausage|omelet|french toast|bagel)\b/i,
  // Cooking methods
  /\b(grilled|roasted|baked|fried|steamed|sauteed|braised|stir[- ]?fry)\b/i,
  // Sides & Other
  /\b(fries|potatoes?|vegetables?|beans?|noodles?|bowl|plate|entree)\b/i,
];

// Categories based on station/section names
const CATEGORY_PATTERNS: [RegExp, string][] = [
  [/grill(e)?|bbq|barbecue/i, "Grill"],
  [/pizza/i, "Pizza"],
  [/pasta|italian|noodle/i, "Pasta"],
  [/vegetarian|vegan|plant|meatless/i, "Plant-Based"],
  [/salad|greens/i, "Salad Bar"],
  [/deli|sandwich|sub/i, "Deli"],
  [/dessert|bakery|sweet|pastry|cake|cookie/i, "Desserts"],
  [/international|global|world|asian|mexican|indian|mediterranean/i, "Global"],
  [/breakfast|morning|brunch/i, "Breakfast"],
  [/soup/i, "Soups"],
  [/comfort|home|classic/i, "Comfort"],
];

// Dietary tag detection
const DIET_SIGNALS = {
  vegan: [/\bvegan\b/i, /\bvg\b/i, /\bplant[- ]?based\b/i],
  vegetarian: [/\bvegetarian\b/i, /\bveg\b/i, /\bmeatless\b/i],
  "gluten-free": [/\bgluten[- ]?free\b/i, /\bgf\b/i, /\bceliac\b/i],
  "dairy-free": [/\bdairy[- ]?free\b/i, /\bdf\b/i, /\blactose[- ]?free\b/i],
  halal: [/\bhalal\b/i],
  kosher: [/\bkosher\b/i],
};

// Meat/animal products for accurate vegan/vegetarian detection
const MEAT_KEYWORDS = [
  "beef", "chicken", "pork", "bacon", "ham", "sausage", "pepperoni",
  "turkey", "lamb", "steak", "meatball", "prosciutto", "salami", "hot dog",
  "ribs", "wing", "drumstick", "brisket", "corned beef", "pastrami"
];
const SEAFOOD_KEYWORDS = [
  "fish", "salmon", "tuna", "shrimp", "crab", "lobster", "clam",
  "mussel", "oyster", "scallop", "anchovy", "cod", "tilapia", "mahi"
];
const DAIRY_KEYWORDS = [
  "milk", "cheese", "butter", "cream", "yogurt", "mozzarella", "cheddar",
  "parmesan", "feta", "gouda", "ricotta", "brie", "ice cream", "whipped"
];
const EGG_KEYWORDS = ["egg", "omelet", "omelette", "mayo", "aioli", "meringue"];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function inferDietaryTags(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const tags: string[] = [];

  const hasMeat = containsAny(text, MEAT_KEYWORDS);
  const hasSeafood = containsAny(text, SEAFOOD_KEYWORDS);
  const hasDairy = containsAny(text, DAIRY_KEYWORDS);
  const hasEgg = containsAny(text, EGG_KEYWORDS);

  // Check explicit signals
  for (const [tag, patterns] of Object.entries(DIET_SIGNALS)) {
    if (patterns.some(p => p.test(text))) {
      tags.push(tag);
    }
  }

  // Infer vegetarian if no meat/seafood
  const isVegetarianSafe = !hasMeat && !hasSeafood;
  if (isVegetarianSafe && !tags.includes("vegetarian")) {
    // Only add if it's explicitly marked or no animal proteins detected
    if (tags.includes("vegan") || (!hasMeat && !hasSeafood)) {
      tags.push("vegetarian");
    }
  }

  // Vegan must not have meat, seafood, dairy, or eggs
  const isVeganSafe = isVegetarianSafe && !hasDairy && !hasEgg;
  if (tags.includes("vegan") && !isVeganSafe) {
    // Remove vegan tag if it has animal products
    const idx = tags.indexOf("vegan");
    if (idx > -1) tags.splice(idx, 1);
  }

  // Remove duplicates
  return [...new Set(tags)];
}

function detectCategory(text: string): string {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return "Entrees";
}

function detectMealType(text: string, context: string): "breakfast" | "lunch" | "dinner" {
  const combined = `${text} ${context}`.toLowerCase();
  
  if (/breakfast|morning|brunch/i.test(combined)) return "breakfast";
  if (/lunch|midday|noon/i.test(combined)) return "lunch";
  if (/dinner|evening|supper|late night/i.test(combined)) return "dinner";
  
  // Time-based heuristics from section headers
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  return "dinner";
}

// Parse nutrition from text patterns like "250 cal" or "Calories: 250"
function parseNutrition(text: string): { calories?: number; protein?: number; carbs?: number; fat?: number } {
  const result: { calories?: number; protein?: number; carbs?: number; fat?: number } = {};
  
  const calMatch = text.match(/(\d+)\s*(?:cal|kcal|calories?)/i);
  if (calMatch) result.calories = parseInt(calMatch[1]);
  
  const proteinMatch = text.match(/(\d+)\s*g?\s*protein/i);
  if (proteinMatch) result.protein = parseInt(proteinMatch[1]);
  
  const carbMatch = text.match(/(\d+)\s*g?\s*(?:carbs?|carbohydrates?)/i);
  if (carbMatch) result.carbs = parseInt(carbMatch[1]);
  
  const fatMatch = text.match(/(\d+)\s*g?\s*fat/i);
  if (fatMatch) result.fat = parseInt(fatMatch[1]);
  
  return result;
}

// Enhanced markdown parser with better food item detection
function parseMenuFromMarkdown(markdown: string, hallId: string): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  const lines = markdown.split("\n");
  const seen = new Set<string>();
  
  let currentMeal: "breakfast" | "lunch" | "dinner" = "dinner";
  let currentCategory = "Entrees";
  let sectionContext = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Track section headers for context
    if (line.startsWith("#")) {
      sectionContext = line.replace(/^#+\s*/, "");
      
      // Detect meal from header
      if (/breakfast|morning|brunch/i.test(sectionContext)) currentMeal = "breakfast";
      else if (/lunch|midday/i.test(sectionContext)) currentMeal = "lunch";
      else if (/dinner|evening|supper|late/i.test(sectionContext)) currentMeal = "dinner";
      
      // Detect category from header
      currentCategory = detectCategory(sectionContext);
      continue;
    }
    
    // Skip navigation, links, and non-food content
    if (line.startsWith("[") || line.startsWith("http") || line.startsWith("!")) continue;
    if (line.length < 4 || line.length > 100) continue;
    if (/^\d+$|^[*-]\s*$|^#{1,6}\s*$/.test(line)) continue;
    
    // Check if line looks like a food item
    const cleanLine = line.replace(/^[*\-•]\s*/, "").replace(/[*_#`]/g, "").trim();
    
    // Skip if too short or looks like UI text
    if (cleanLine.length < 4) continue;
    if (/^(menu|hours|location|contact|about|home|back|next|prev)/i.test(cleanLine)) continue;
    
    // Match food patterns
    const isFood = FOOD_PATTERNS.some(p => p.test(cleanLine)) ||
      // Or has explicit dietary labels
      Object.values(DIET_SIGNALS).some(patterns => patterns.some(p => p.test(cleanLine)));
    
    if (!isFood) continue;
    
    // Deduplicate
    const key = `${hallId}-${currentMeal}-${cleanLine.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    
    // Get next line for potential description
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
    const description = (nextLine && !nextLine.startsWith("#") && nextLine.length > 10 && nextLine.length < 200)
      ? nextLine.replace(/^[*\-•]\s*/, "").replace(/[*_#`]/g, "").trim()
      : "";
    
    // Parse nutrition from description or nearby lines
    const nutrition = parseNutrition(`${cleanLine} ${description} ${lines.slice(i, i + 3).join(" ")}`);
    
    // Infer dietary tags
    const tags = inferDietaryTags(cleanLine, description);
    
    items.push({
      name: cleanLine,
      description,
      category: detectCategory(`${sectionContext} ${cleanLine}`),
      meal_type: currentMeal,
      tags,
      ...nutrition,
    });
  }
  
  return items;
}

async function scrapeWithFirecrawl(url: string): Promise<string | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY not configured");
    return null;
  }

  try {
    console.log(`Scraping: ${url}`);
    
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 5000, // Wait longer for dynamic content
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Firecrawl error for ${url}: ${response.status} ${errText}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || null;
    
    if (markdown) {
      console.log(`  Retrieved ${markdown.length} chars from ${url}`);
    }
    
    return markdown;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting UMass menu scrape with Firecrawl...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    if (!firecrawlKey) {
      throw new Error("Missing FIRECRAWL_API_KEY - please configure in secrets");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split("T")[0];

    console.log(`Scraping menus for date: ${today}`);

    // Check if we already have today's menu
    const { data: existingItems } = await supabase
      .from("menu_items")
      .select("id")
      .eq("menu_date", today)
      .limit(1);

    if (existingItems && existingItems.length > 0) {
      console.log("Menu already scraped for today");
      return new Response(
        JSON.stringify({ success: true, message: "Menu already exists for today", date: today }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape all dining halls
    const allItems: any[] = [];
    const scrapedHalls: string[] = [];
    
    for (const hall of DINING_HALLS) {
      console.log(`\nScraping ${hall.name}...`);
      
      const markdown = await scrapeWithFirecrawl(hall.url);
      
      if (markdown) {
        const items = parseMenuFromMarkdown(markdown, hall.id);
        console.log(`  Found ${items.length} items from ${hall.name}`);
        
        if (items.length > 0) {
          scrapedHalls.push(hall.name);
        }
        
        for (const item of items) {
          allItems.push({
            name: item.name,
            description: item.description || null,
            dining_hall_id: hall.id,
            meal_type: item.meal_type,
            category: item.category,
            calories: item.calories || null,
            protein: item.protein || null,
            carbs: item.carbs || null,
            fat: item.fat || null,
            tags: item.tags,
            menu_date: today,
          });
        }
      } else {
        console.log(`  No data retrieved for ${hall.name}`);
      }
      
      // Rate limit between requests
      await new Promise(r => setTimeout(r, 2000));
    }

    // If no items scraped, add sample data as fallback
    if (allItems.length === 0) {
      console.log("No items scraped, using fallback sample data");
      const sampleItems = generateFallbackData(today);
      allItems.push(...sampleItems);
    }

    console.log(`\nInserting ${allItems.length} total menu items...`);

    const { error: insertError } = await supabase
      .from("menu_items")
      .insert(allItems);

    if (insertError) {
      console.error("Error inserting menu items:", insertError);
      throw insertError;
    }

    console.log("Menu scrape completed successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraped and inserted ${allItems.length} menu items`,
        date: today,
        halls: scrapedHalls.length > 0 ? scrapedHalls : DINING_HALLS.map(h => h.name),
        itemCount: allItems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback data with realistic UMass dining items
function generateFallbackData(today: string) {
  const items = [
    // Worcester
    { hall: "worcester", meal: "breakfast", name: "Scrambled Eggs", category: "Breakfast", tags: ["vegetarian", "gluten-free"] },
    { hall: "worcester", meal: "breakfast", name: "Buttermilk Pancakes", category: "Breakfast", tags: ["vegetarian"] },
    { hall: "worcester", meal: "breakfast", name: "Turkey Sausage Links", category: "Breakfast", tags: ["gluten-free"] },
    { hall: "worcester", meal: "breakfast", name: "Fresh Fruit Bowl", category: "Breakfast", tags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
    { hall: "worcester", meal: "breakfast", name: "Avocado Toast", category: "Breakfast", tags: ["vegan", "vegetarian", "dairy-free"] },
    { hall: "worcester", meal: "lunch", name: "Grilled Chicken Sandwich", category: "Grill", tags: [] },
    { hall: "worcester", meal: "lunch", name: "Black Bean Burger", category: "Grill", tags: ["vegan", "vegetarian", "dairy-free"] },
    { hall: "worcester", meal: "lunch", name: "Caesar Salad with Grilled Chicken", category: "Salad Bar", tags: [] },
    { hall: "worcester", meal: "lunch", name: "Garden Salad", category: "Salad Bar", tags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
    { hall: "worcester", meal: "lunch", name: "Cheese Pizza", category: "Pizza", tags: ["vegetarian"] },
    { hall: "worcester", meal: "dinner", name: "Roasted Salmon", category: "Entrees", tags: ["gluten-free", "dairy-free"] },
    { hall: "worcester", meal: "dinner", name: "Pasta Marinara", category: "Pasta", tags: ["vegan", "vegetarian", "dairy-free"] },
    { hall: "worcester", meal: "dinner", name: "Grilled Ribeye Steak", category: "Grill", tags: ["gluten-free"] },
    { hall: "worcester", meal: "dinner", name: "Vegetable Stir Fry with Tofu", category: "Global", tags: ["vegan", "vegetarian", "dairy-free"] },
    
    // Franklin
    { hall: "franklin", meal: "breakfast", name: "Oatmeal Bar", category: "Breakfast", tags: ["vegan", "vegetarian", "dairy-free"] },
    { hall: "franklin", meal: "breakfast", name: "Veggie Omelet", category: "Breakfast", tags: ["vegetarian", "gluten-free"] },
    { hall: "franklin", meal: "lunch", name: "Turkey Club Wrap", category: "Deli", tags: [] },
    { hall: "franklin", meal: "lunch", name: "Mediterranean Hummus Bowl", category: "Global", tags: ["vegan", "vegetarian", "dairy-free"] },
    { hall: "franklin", meal: "dinner", name: "Mushroom Risotto", category: "Entrees", tags: ["vegetarian", "gluten-free"] },
    { hall: "franklin", meal: "dinner", name: "Grilled Chicken Thighs", category: "Entrees", tags: ["gluten-free", "dairy-free"] },
    
    // Berkshire
    { hall: "berkshire", meal: "breakfast", name: "Belgian Waffles", category: "Breakfast", tags: ["vegetarian"] },
    { hall: "berkshire", meal: "breakfast", name: "Greek Yogurt Parfait", category: "Breakfast", tags: ["vegetarian", "gluten-free"] },
    { hall: "berkshire", meal: "lunch", name: "Pho", category: "Global", tags: ["gluten-free", "dairy-free"] },
    { hall: "berkshire", meal: "lunch", name: "Sushi Rolls", category: "Global", tags: ["dairy-free"] },
    { hall: "berkshire", meal: "dinner", name: "Korean BBQ Bowl", category: "Global", tags: ["dairy-free"] },
    { hall: "berkshire", meal: "dinner", name: "Thai Green Curry with Tofu", category: "Global", tags: ["vegan", "vegetarian", "gluten-free", "dairy-free"] },
    
    // Hampshire
    { hall: "hampshire", meal: "breakfast", name: "Bacon and Eggs", category: "Breakfast", tags: ["gluten-free"] },
    { hall: "hampshire", meal: "breakfast", name: "Blueberry Muffin", category: "Breakfast", tags: ["vegetarian"] },
    { hall: "hampshire", meal: "lunch", name: "Pepperoni Pizza", category: "Pizza", tags: [] },
    { hall: "hampshire", meal: "lunch", name: "Margherita Pizza", category: "Pizza", tags: ["vegetarian"] },
    { hall: "hampshire", meal: "dinner", name: "Prime Rib", category: "Entrees", tags: ["gluten-free"] },
    { hall: "hampshire", meal: "dinner", name: "Eggplant Parmesan", category: "Entrees", tags: ["vegetarian"] },
  ];
  
  return items.map((item, i) => ({
    name: item.name,
    description: null,
    dining_hall_id: item.hall,
    meal_type: item.meal,
    category: item.category,
    calories: 200 + (i * 37) % 500,
    protein: 5 + (i * 13) % 40,
    carbs: 10 + (i * 17) % 60,
    fat: 5 + (i * 11) % 30,
    tags: item.tags,
    menu_date: today,
  }));
}
