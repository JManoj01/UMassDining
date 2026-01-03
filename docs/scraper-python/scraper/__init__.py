"""
UMass Dining Menu Scraper - Package Init
"""
from .menu_scraper import MenuScraper
from .parser import MenuParser
from .utils import (
    infer_dietary_tags,
    detect_category,
    detect_meal_type,
    parse_nutrition,
    is_likely_food_item,
    clean_item_name
)

__all__ = [
    'MenuScraper',
    'MenuParser',
    'infer_dietary_tags',
    'detect_category',
    'detect_meal_type',
    'parse_nutrition',
    'is_likely_food_item',
    'clean_item_name'
]
