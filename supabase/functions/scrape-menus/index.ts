import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample menu data - In production, this would scrape from umassdining.com
const sampleMenuData = {
  worcester: {
    breakfast: [
      { name: "Fluffy Buttermilk Pancakes", description: "Stack of golden pancakes with maple syrup and berries", category: "Hot Breakfast", calories: 450, protein: 8, carbs: 68, fat: 16, tags: ["vegetarian"] },
      { name: "Veggie Egg White Omelette", description: "Egg whites with spinach, tomatoes, and feta", category: "Hot Breakfast", calories: 220, protein: 18, carbs: 8, fat: 12, tags: ["vegetarian", "high-protein"] },
      { name: "Avocado Toast", description: "Whole grain toast with smashed avocado", category: "Light Breakfast", calories: 280, protein: 6, carbs: 32, fat: 16, tags: ["vegan", "healthy"] },
    ],
    lunch: [
      { name: "Grilled Chicken Caesar Wrap", description: "Tender chicken, romaine, parmesan, Caesar dressing", category: "Sandwiches", calories: 520, protein: 32, carbs: 42, fat: 24, tags: ["high-protein"] },
      { name: "Mediterranean Falafel Bowl", description: "Crispy falafel, hummus, tabbouleh, tahini", category: "Global Cuisine", calories: 480, protein: 16, carbs: 56, fat: 22, tags: ["vegan", "halal"] },
      { name: "BBQ Bacon Burger", description: "Angus beef with bacon, cheddar, BBQ sauce", category: "Grill Station", calories: 780, protein: 42, carbs: 48, fat: 46, tags: [] },
    ],
    dinner: [
      { name: "Herb-Crusted Salmon", description: "Atlantic salmon with lemon dill sauce and quinoa", category: "Seafood", calories: 520, protein: 38, carbs: 28, fat: 28, tags: ["gluten-free", "healthy"] },
      { name: "Chicken Tikka Masala", description: "Tender chicken in creamy curry with basmati rice", category: "Global Cuisine", calories: 680, protein: 36, carbs: 64, fat: 28, tags: ["halal"] },
    ],
  },
  franklin: {
    breakfast: [
      { name: "Açaí Bowl", description: "Organic açaí with granola, fresh fruits, honey", category: "Light Breakfast", calories: 380, protein: 6, carbs: 72, fat: 8, tags: ["vegan", "healthy"] },
      { name: "Spinach & Cheese Croissant", description: "Flaky croissant with spinach and gruyère", category: "Bakery", calories: 420, protein: 14, carbs: 38, fat: 24, tags: ["vegetarian"] },
    ],
    lunch: [
      { name: "Harvest Grain Bowl", description: "Farro, roasted sweet potato, kale, chickpeas", category: "Bowls", calories: 520, protein: 18, carbs: 68, fat: 20, tags: ["vegan", "healthy"] },
      { name: "Turkey Club Sandwich", description: "Turkey, bacon, lettuce, tomato on sourdough", category: "Sandwiches", calories: 580, protein: 34, carbs: 42, fat: 28, tags: [] },
    ],
    dinner: [
      { name: "Vegetable Stir Fry", description: "Wok-tossed vegetables in teriyaki with jasmine rice", category: "Asian Station", calories: 420, protein: 12, carbs: 64, fat: 14, tags: ["vegan", "healthy"] },
      { name: "Lemon Herb Rotisserie Chicken", description: "Half rotisserie chicken with garlic mashed potatoes", category: "Comfort Classics", calories: 720, protein: 52, carbs: 38, fat: 38, tags: ["gluten-free"] },
    ],
  },
  berkshire: {
    breakfast: [
      { name: "Japanese Breakfast Set", description: "Miso soup, grilled salmon, rice, pickled vegetables", category: "International", calories: 480, protein: 32, carbs: 48, fat: 18, tags: ["healthy"] },
      { name: "Belgian Waffles", description: "Crispy waffles with whipped cream and strawberries", category: "Hot Breakfast", calories: 520, protein: 8, carbs: 78, fat: 20, tags: ["vegetarian"] },
    ],
    lunch: [
      { name: "Spicy Tuna Roll", description: "Fresh tuna with spicy mayo, cucumber, avocado", category: "Sushi Bar", calories: 380, protein: 22, carbs: 42, fat: 14, tags: ["healthy"] },
      { name: "Pho Bo", description: "Vietnamese beef noodle soup with herbs and lime", category: "International", calories: 420, protein: 28, carbs: 52, fat: 12, tags: ["gluten-free", "healthy"] },
    ],
    dinner: [
      { name: "Korean BBQ Beef Bowl", description: "Marinated bulgogi with rice, kimchi, gochujang", category: "International", calories: 620, protein: 38, carbs: 58, fat: 24, tags: [] },
      { name: "Vegan Pad Thai", description: "Rice noodles with tofu, vegetables, peanuts", category: "International", calories: 480, protein: 16, carbs: 68, fat: 18, tags: ["vegan"] },
    ],
  },
  hampshire: {
    breakfast: [
      { name: "Classic American Breakfast", description: "Two eggs any style, bacon, hash browns, toast", category: "Hot Breakfast", calories: 680, protein: 28, carbs: 42, fat: 44, tags: [] },
      { name: "Overnight Oats", description: "Steel-cut oats with almond milk, chia seeds, berries", category: "Light Breakfast", calories: 320, protein: 10, carbs: 58, fat: 8, tags: ["vegan", "healthy"] },
    ],
    lunch: [
      { name: "Pepperoni Pizza", description: "Hand-tossed pizza with marinara and pepperoni", category: "Pizza Station", calories: 320, protein: 14, carbs: 38, fat: 14, tags: [] },
      { name: "Loaded Mac & Cheese", description: "Four-cheese pasta with bacon and breadcrumbs", category: "Comfort Classics", calories: 720, protein: 24, carbs: 62, fat: 42, tags: ["vegetarian"] },
    ],
    dinner: [
      { name: "Slow-Roasted Prime Rib", description: "Tender prime rib with au jus and Yorkshire pudding", category: "Chef's Special", calories: 780, protein: 56, carbs: 28, fat: 48, tags: [] },
      { name: "Mushroom Risotto", description: "Creamy arborio rice with wild mushrooms, truffle oil", category: "Italian", calories: 520, protein: 14, carbs: 68, fat: 22, tags: ["vegetarian", "gluten-free"] },
    ],
  },
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting menu scrape...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date().toISOString().split("T")[0];

    console.log(`Scraping menus for date: ${today}`);

    // Check if we already have today's menu
    const { data: existingItems, error: checkError } = await supabase
      .from("menu_items")
      .select("id")
      .eq("menu_date", today)
      .limit(1);

    if (checkError) {
      console.error("Error checking existing items:", checkError);
      throw checkError;
    }

    if (existingItems && existingItems.length > 0) {
      console.log("Menu already scraped for today");
      return new Response(
        JSON.stringify({ success: true, message: "Menu already exists for today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert menu items for each dining hall
    const menuItems: any[] = [];
    
    for (const [hallId, meals] of Object.entries(sampleMenuData)) {
      for (const [mealType, items] of Object.entries(meals)) {
        for (const item of items) {
          menuItems.push({
            name: item.name,
            description: item.description,
            dining_hall_id: hallId,
            meal_type: mealType,
            category: item.category,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            tags: item.tags,
            menu_date: today,
          });
        }
      }
    }

    console.log(`Inserting ${menuItems.length} menu items...`);

    const { error: insertError } = await supabase
      .from("menu_items")
      .insert(menuItems);

    if (insertError) {
      console.error("Error inserting menu items:", insertError);
      throw insertError;
    }

    console.log("Menu scrape completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Inserted ${menuItems.length} menu items`,
        date: today
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
