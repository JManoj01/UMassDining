-- Create enum for meal types
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner');

-- Create dining halls table
CREATE TABLE public.dining_halls (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  location TEXT NOT NULL,
  breakfast_hours TEXT DEFAULT '7:00 AM - 10:30 AM',
  lunch_hours TEXT DEFAULT '11:00 AM - 2:30 PM',
  dinner_hours TEXT DEFAULT '4:30 PM - 10:00 PM',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  dining_hall_id TEXT REFERENCES public.dining_halls(id) ON DELETE CASCADE,
  meal_type meal_type NOT NULL,
  category TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  tags TEXT[] DEFAULT '{}',
  menu_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_preferences TEXT[] DEFAULT '{}',
  favorite_halls TEXT[] DEFAULT '{}',
  disliked_ingredients TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create meal ratings table
CREATE TABLE public.meal_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

-- Enable RLS
ALTER TABLE public.dining_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_ratings ENABLE ROW LEVEL SECURITY;

-- Dining halls are publicly readable
CREATE POLICY "Dining halls are publicly readable"
ON public.dining_halls FOR SELECT
USING (true);

-- Menu items are publicly readable
CREATE POLICY "Menu items are publicly readable"
ON public.menu_items FOR SELECT
USING (true);

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
ON public.user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can read their own ratings
CREATE POLICY "Users can read own ratings"
ON public.meal_ratings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own ratings
CREATE POLICY "Users can insert own ratings"
ON public.meal_ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON public.meal_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_menu_items_date ON public.menu_items(menu_date);
CREATE INDEX idx_menu_items_hall ON public.menu_items(dining_hall_id);
CREATE INDEX idx_menu_items_meal ON public.menu_items(meal_type);

-- Insert initial dining halls data
INSERT INTO public.dining_halls (id, name, short_name, location, features) VALUES
('worcester', 'Worcester Dining Commons', 'Worcester', 'Central Residential Area', ARRAY['Halal Station', 'Vegetarian Options', 'Made-to-Order Grill']),
('franklin', 'Franklin Dining Commons', 'Franklin', 'Southwest Residential Area', ARRAY['Extensive Salad Bar', 'Fresh Bakery', 'Smoothie Station']),
('berkshire', 'Berkshire Dining Commons', 'Berkshire', 'Central Campus', ARRAY['International Cuisine', 'Sushi Bar', 'Vegan Station']),
('hampshire', 'Hampshire Dining Commons', 'Hampshire', 'Northeast Residential Area', ARRAY['Late Night Dining', 'Comfort Food', 'Pizza Station']);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();