# UMass Dining - PostgreSQL Database Schema

-- ===========================================
-- DINING HALLS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS dining_halls (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    location TEXT NOT NULL,
    breakfast_hours TEXT DEFAULT '7:00 AM - 10:30 AM',
    lunch_hours TEXT DEFAULT '11:00 AM - 2:30 PM',
    dinner_hours TEXT DEFAULT '4:30 PM - 10:00 PM',
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MENU ITEMS TABLE
-- ===========================================
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner');

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    dining_hall_id TEXT REFERENCES dining_halls(id),
    meal_type meal_type NOT NULL,
    menu_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(dining_hall_id, name, meal_type, menu_date)
);

-- ===========================================
-- USER PREFERENCES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    dietary_preferences TEXT[] DEFAULT '{}',
    disliked_ingredients TEXT[] DEFAULT '{}',
    favorite_halls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MEAL RATINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS meal_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One rating per user per item
    UNIQUE(user_id, menu_item_id)
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_menu_items_date ON menu_items(menu_date);
CREATE INDEX idx_menu_items_hall_date ON menu_items(dining_hall_id, menu_date);
CREATE INDEX idx_menu_items_meal_type ON menu_items(meal_type);
CREATE INDEX idx_meal_ratings_user ON meal_ratings(user_id);
CREATE INDEX idx_meal_ratings_item ON meal_ratings(menu_item_id);

-- ===========================================
-- TRIGGER FOR UPDATED_AT
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- INITIAL DATA - DINING HALLS
-- ===========================================
INSERT INTO dining_halls (id, name, short_name, location, features) VALUES
('worcester', 'Worcester Dining Commons', 'Worcester', 'Southwest Residential Area', 
 ARRAY['Vegan Options', 'Gluten-Free', 'Allergen Station']),
('franklin', 'Franklin Dining Commons', 'Franklin', 'Central Residential Area', 
 ARRAY['Kosher Options', 'Halal Options', 'Made-to-Order']),
('berkshire', 'Berkshire Dining Commons', 'Berkshire', 'Southwest Residential Area', 
 ARRAY['Late Night', 'Grab and Go']),
('hampshire', 'Hampshire Dining Commons', 'Hampshire', 'Central Residential Area', 
 ARRAY['Vegetarian Focus', 'Local Produce'])
ON CONFLICT (id) DO NOTHING;
