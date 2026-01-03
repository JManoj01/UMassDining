"""
UMass Dining Menu Scraper - Utility Functions
"""
import re
from typing import List, Dict, Optional

# Keyword lists for dietary detection
MEAT_KEYWORDS = [
    "beef", "chicken", "pork", "bacon", "ham", "sausage", "pepperoni",
    "turkey", "lamb", "steak", "meatball", "prosciutto", "salami",
    "hot dog", "ribs", "wing", "drumstick", "brisket"
]

SEAFOOD_KEYWORDS = [
    "fish", "salmon", "tuna", "shrimp", "crab", "lobster", "clam",
    "mussel", "oyster", "scallop", "anchovy", "cod", "tilapia"
]

DAIRY_KEYWORDS = [
    "milk", "cheese", "butter", "cream", "yogurt", "mozzarella",
    "cheddar", "parmesan", "feta", "gouda", "ricotta", "ice cream"
]

EGG_KEYWORDS = ["egg", "omelet", "omelette", "mayo", "aioli", "meringue"]

GLUTEN_KEYWORDS = [
    "bread", "pasta", "flour", "wheat", "barley", "rye", "breaded",
    "battered", "crouton", "noodle", "tortilla", "pita", "wrap", "bun"
]


def contains_any(text: str, keywords: List[str]) -> bool:
    """Check if text contains any of the keywords"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in keywords)


def infer_dietary_tags(name: str, description: str = "") -> List[str]:
    """Infer dietary tags from item name and description"""
    text = f"{name} {description}".lower()
    tags = []

    has_meat = contains_any(text, MEAT_KEYWORDS)
    has_seafood = contains_any(text, SEAFOOD_KEYWORDS)
    has_dairy = contains_any(text, DAIRY_KEYWORDS)
    has_egg = contains_any(text, EGG_KEYWORDS)
    has_gluten = contains_any(text, GLUTEN_KEYWORDS)

    # Vegetarian: no meat or seafood
    if not has_meat and not has_seafood:
        tags.append("vegetarian")
        
        # Vegan: no animal products at all
        if not has_dairy and not has_egg:
            tags.append("vegan")
            tags.append("dairy-free")

    # Explicit signals
    if "gluten-free" in text or "gf" in text:
        tags.append("gluten-free")
    elif not has_gluten:
        tags.append("gluten-free")

    if "dairy-free" in text or "df" in text:
        if "dairy-free" not in tags:
            tags.append("dairy-free")

    if "vegan" in text:
        if "vegan" not in tags:
            tags.append("vegan")
            if "vegetarian" not in tags:
                tags.append("vegetarian")

    return list(set(tags))


def detect_category(text: str) -> str:
    """Detect food category from text"""
    text_lower = text.lower()
    
    if "grill" in text_lower or "bbq" in text_lower:
        return "Grill"
    if "pizza" in text_lower:
        return "Pizza"
    if "pasta" in text_lower or "italian" in text_lower or "noodle" in text_lower:
        return "Pasta"
    if "salad" in text_lower:
        return "Salad Bar"
    if "deli" in text_lower or "sandwich" in text_lower:
        return "Deli"
    if "dessert" in text_lower or "bakery" in text_lower or "cake" in text_lower:
        return "Desserts"
    if any(word in text_lower for word in ["asian", "mexican", "indian", "international"]):
        return "Global"
    if "breakfast" in text_lower:
        return "Breakfast"
    if "soup" in text_lower:
        return "Soups"
    
    return "Entrees"


def detect_meal_type(text: str) -> str:
    """Detect meal type from text"""
    text_lower = text.lower()
    
    if "breakfast" in text_lower or "morning" in text_lower or "brunch" in text_lower:
        return "breakfast"
    if "lunch" in text_lower or "midday" in text_lower:
        return "lunch"
    if "dinner" in text_lower or "evening" in text_lower or "supper" in text_lower:
        return "dinner"
    
    return "dinner"  # Default


def parse_nutrition(text: str) -> Dict[str, Optional[int]]:
    """Parse nutrition information from text"""
    result = {
        "calories": None,
        "protein": None,
        "carbs": None,
        "fat": None
    }
    
    # Calories
    cal_match = re.search(r'(\d+)\s*(?:cal|kcal|calories?)', text, re.IGNORECASE)
    if cal_match:
        result["calories"] = int(cal_match.group(1))
    
    # Protein
    protein_match = re.search(r'(\d+)\s*g?\s*protein', text, re.IGNORECASE)
    if protein_match:
        result["protein"] = int(protein_match.group(1))
    
    # Carbs
    carb_match = re.search(r'(\d+)\s*g?\s*(?:carbs?|carbohydrates?)', text, re.IGNORECASE)
    if carb_match:
        result["carbs"] = int(carb_match.group(1))
    
    # Fat
    fat_match = re.search(r'(\d+)\s*g?\s*fat', text, re.IGNORECASE)
    if fat_match:
        result["fat"] = int(fat_match.group(1))
    
    return result


def is_likely_food_item(text: str) -> bool:
    """Check if text is likely a food item name"""
    if len(text) < 4 or len(text) > 80:
        return False
    
    # Skip navigation/UI text
    skip_patterns = [
        r'^(menu|hours|location|contact|about|home|back|next|prev)',
        r'^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
        r'^(closed|open|am|pm)$'
    ]
    
    text_lower = text.lower()
    for pattern in skip_patterns:
        if re.match(pattern, text_lower):
            return False
    
    # Food patterns
    food_patterns = [
        r'\b(chicken|beef|pork|fish|salmon|tofu|turkey|lamb|steak)\b',
        r'\b(pizza|pasta|burger|sandwich|wrap|salad|soup|rice|curry)\b',
        r'\b(eggs?|pancakes?|waffles?|oatmeal|bacon|sausage)\b',
        r'\b(grilled|roasted|baked|fried|steamed|sauteed)\b',
        r'\b(fries|potatoes?|vegetables?|beans?|noodles?)\b'
    ]
    
    return any(re.search(pattern, text_lower) for pattern in food_patterns)


def clean_item_name(text: str) -> str:
    """Clean up a menu item name"""
    # Remove markdown formatting
    text = re.sub(r'[*_#`]', '', text)
    # Remove leading bullets
    text = re.sub(r'^[\-•]\s*', '', text)
    # Normalize whitespace
    text = ' '.join(text.split())
    return text.strip()
