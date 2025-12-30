"""
UMass Dining Menu Scraper - Database Models and Operations
"""
import logging
from typing import Dict, List, Optional
from datetime import date
import uuid

from .connection import get_db_connection

logger = logging.getLogger(__name__)


class MenuItemDB:
    """Database operations for menu items"""
    
    def __init__(self):
        self.db = get_db_connection()
    
    def upsert_menu_item(self, item: Dict) -> str:
        """
        Insert or update a menu item
        
        Args:
            item: Menu item dictionary
            
        Returns:
            Item ID
        """
        # Generate ID if not provided
        item_id = item.get('id') or str(uuid.uuid4())
        
        query = """
            INSERT INTO menu_items (
                id, name, description, dining_hall_id, meal_type,
                menu_date, category, calories, protein, carbs, fat, tags
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                calories = EXCLUDED.calories,
                protein = EXCLUDED.protein,
                carbs = EXCLUDED.carbs,
                fat = EXCLUDED.fat,
                tags = EXCLUDED.tags
            RETURNING id
        """
        
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (
                item_id,
                item['name'],
                item.get('description'),
                item['dining_hall_id'],
                item['meal_type'],
                item['menu_date'],
                item.get('category'),
                item.get('calories'),
                item.get('protein'),
                item.get('carbs'),
                item.get('fat'),
                item.get('tags', [])
            ))
            result = cursor.fetchone()
            return result['id']
    
    def bulk_insert(self, items: List[Dict]) -> int:
        """
        Bulk insert menu items
        
        Args:
            items: List of menu item dictionaries
            
        Returns:
            Number of items inserted
        """
        if not items:
            return 0
        
        query = """
            INSERT INTO menu_items (
                id, name, description, dining_hall_id, meal_type,
                menu_date, category, calories, protein, carbs, fat, tags
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (dining_hall_id, name, meal_type, menu_date) 
            DO UPDATE SET
                description = EXCLUDED.description,
                calories = EXCLUDED.calories,
                protein = EXCLUDED.protein,
                carbs = EXCLUDED.carbs,
                fat = EXCLUDED.fat,
                tags = EXCLUDED.tags
        """
        
        values = []
        for item in items:
            values.append((
                str(uuid.uuid4()),
                item['name'],
                item.get('description'),
                item['dining_hall_id'],
                item['meal_type'],
                item['menu_date'],
                item.get('category'),
                item.get('calories'),
                item.get('protein'),
                item.get('carbs'),
                item.get('fat'),
                item.get('tags', [])
            ))
        
        with self.db.get_cursor() as cursor:
            cursor.executemany(query, values)
            return len(values)
    
    def get_items_by_date(self, menu_date: date) -> List[Dict]:
        """Get all menu items for a date"""
        query = """
            SELECT * FROM menu_items 
            WHERE menu_date = %s
            ORDER BY dining_hall_id, meal_type, category
        """
        
        with self.db.get_cursor(commit=False) as cursor:
            cursor.execute(query, (menu_date,))
            return cursor.fetchall()
    
    def delete_old_items(self, days_to_keep: int = 7) -> int:
        """Delete menu items older than specified days"""
        query = """
            DELETE FROM menu_items 
            WHERE menu_date < CURRENT_DATE - INTERVAL '%s days'
            RETURNING id
        """
        
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (days_to_keep,))
            deleted = cursor.fetchall()
            return len(deleted)
    
    def menu_exists_for_date(self, menu_date: date) -> bool:
        """Check if menu data exists for a date"""
        query = "SELECT EXISTS(SELECT 1 FROM menu_items WHERE menu_date = %s)"
        
        with self.db.get_cursor(commit=False) as cursor:
            cursor.execute(query, (menu_date,))
            result = cursor.fetchone()
            return result['exists']


class DiningHallDB:
    """Database operations for dining halls"""
    
    def __init__(self):
        self.db = get_db_connection()
    
    def get_all(self) -> List[Dict]:
        """Get all dining halls"""
        query = "SELECT * FROM dining_halls ORDER BY name"
        
        with self.db.get_cursor(commit=False) as cursor:
            cursor.execute(query)
            return cursor.fetchall()
    
    def get_by_id(self, hall_id: str) -> Optional[Dict]:
        """Get dining hall by ID"""
        query = "SELECT * FROM dining_halls WHERE id = %s"
        
        with self.db.get_cursor(commit=False) as cursor:
            cursor.execute(query, (hall_id,))
            return cursor.fetchone()
