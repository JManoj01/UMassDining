"""
UMass Dining Menu Scraper - HTML Parser
"""
import re
import logging
from datetime import date
from typing import List, Dict, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class MenuParser:
    """Parses HTML from UMass dining pages to extract menu items"""
    
    # Common dietary tags to look for
    DIETARY_TAGS = {
        'vegetarian': ['vegetarian', 'veg'],
        'vegan': ['vegan'],
        'gluten-free': ['gluten-free', 'gluten free', 'gf'],
        'halal': ['halal'],
        'contains-nuts': ['nuts', 'tree nuts', 'peanuts'],
        'contains-dairy': ['dairy', 'milk', 'cheese'],
        'contains-eggs': ['eggs', 'egg'],
        'contains-soy': ['soy', 'soybean'],
        'contains-wheat': ['wheat', 'gluten'],
        'contains-fish': ['fish', 'seafood'],
        'contains-shellfish': ['shellfish', 'shrimp', 'crab', 'lobster']
    }
    
    def parse_menu_page(
        self, 
        html: str, 
        hall_id: str,
        meal_type: str,
        menu_date: date
    ) -> List[Dict]:
        """
        Parse a dining hall menu page
        
        Args:
            html: Raw HTML content
            hall_id: Dining hall identifier
            meal_type: Meal type (breakfast/lunch/dinner)
            menu_date: Date of the menu
            
        Returns:
            List of menu item dictionaries
        """
        soup = BeautifulSoup(html, 'html.parser')
        items = []
        
        # Find the meal section
        # NOTE: Adjust selectors based on actual UMass dining page structure
        meal_section = self._find_meal_section(soup, meal_type)
        
        if not meal_section:
            logger.warning(f"Could not find {meal_type} section")
            return items
        
        # Find all food stations/categories
        stations = meal_section.find_all(class_='menu-station') or \
                   meal_section.find_all('div', class_='station')
        
        for station in stations:
            category = self._extract_category(station)
            station_items = self._parse_station(
                station=station,
                category=category,
                hall_id=hall_id,
                meal_type=meal_type,
                menu_date=menu_date
            )
            items.extend(station_items)
        
        # If no stations found, try parsing all items directly
        if not items:
            items = self._parse_flat_menu(
                soup=meal_section,
                hall_id=hall_id,
                meal_type=meal_type,
                menu_date=menu_date
            )
        
        return items
    
    def _find_meal_section(self, soup: BeautifulSoup, meal_type: str):
        """Find the section for a specific meal type"""
        # Try different possible selectors
        selectors = [
            f'#{meal_type}',
            f'.{meal_type}-menu',
            f'[data-meal="{meal_type}"]',
            f'.meal-{meal_type}'
        ]
        
        for selector in selectors:
            section = soup.select_one(selector)
            if section:
                return section
        
        # Try finding by text content
        for heading in soup.find_all(['h2', 'h3', 'h4']):
            if meal_type.lower() in heading.get_text().lower():
                return heading.find_parent('div') or heading.find_parent('section')
        
        return soup  # Return whole soup if no section found
    
    def _extract_category(self, station) -> str:
        """Extract category/station name"""
        header = station.find(['h3', 'h4', 'h5']) or \
                 station.find(class_='station-name') or \
                 station.find(class_='category-name')
        
        if header:
            return header.get_text(strip=True)
        return "General"
    
    def _parse_station(
        self,
        station,
        category: str,
        hall_id: str,
        meal_type: str,
        menu_date: date
    ) -> List[Dict]:
        """Parse items from a single station/category"""
        items = []
        
        # Find menu items within the station
        item_elements = station.find_all(class_='menu-item') or \
                        station.find_all('li') or \
                        station.find_all(class_='food-item')
        
        for element in item_elements:
            item = self._parse_item(
                element=element,
                category=category,
                hall_id=hall_id,
                meal_type=meal_type,
                menu_date=menu_date
            )
            if item:
                items.append(item)
        
        return items
    
    def _parse_item(
        self,
        element,
        category: str,
        hall_id: str,
        meal_type: str,
        menu_date: date
    ) -> Optional[Dict]:
        """Parse a single menu item element"""
        # Extract name
        name_elem = element.find(class_='item-name') or \
                    element.find(['a', 'span', 'strong']) or \
                    element
        
        name = name_elem.get_text(strip=True) if name_elem else None
        
        if not name or len(name) < 2:
            return None
        
        # Extract description
        desc_elem = element.find(class_='item-description') or \
                    element.find(class_='description')
        description = desc_elem.get_text(strip=True) if desc_elem else None
        
        # Extract nutrition info
        nutrition = self._extract_nutrition(element)
        
        # Extract dietary tags
        tags = self._extract_tags(element, name, description)
        
        return {
            'name': name,
            'description': description,
            'dining_hall_id': hall_id,
            'meal_type': meal_type,
            'menu_date': menu_date.isoformat(),
            'category': category,
            'calories': nutrition.get('calories'),
            'protein': nutrition.get('protein'),
            'carbs': nutrition.get('carbs'),
            'fat': nutrition.get('fat'),
            'tags': tags
        }
    
    def _extract_nutrition(self, element) -> Dict:
        """Extract nutritional information from an element"""
        nutrition = {}
        
        # Look for nutrition elements
        cal_elem = element.find(class_='calories') or \
                   element.find(attrs={'data-calories': True})
        if cal_elem:
            nutrition['calories'] = self._parse_number(
                cal_elem.get_text() or cal_elem.get('data-calories')
            )
        
        protein_elem = element.find(class_='protein')
        if protein_elem:
            nutrition['protein'] = self._parse_number(protein_elem.get_text())
        
        carbs_elem = element.find(class_='carbs') or element.find(class_='carbohydrates')
        if carbs_elem:
            nutrition['carbs'] = self._parse_number(carbs_elem.get_text())
        
        fat_elem = element.find(class_='fat')
        if fat_elem:
            nutrition['fat'] = self._parse_number(fat_elem.get_text())
        
        return nutrition
    
    def _extract_tags(
        self, 
        element, 
        name: str, 
        description: Optional[str]
    ) -> List[str]:
        """Extract dietary tags from element and content"""
        tags = []
        
        # Check for explicit tag elements
        tag_elements = element.find_all(class_='dietary-icon') or \
                       element.find_all(class_='allergen') or \
                       element.find_all('img', alt=True)
        
        for tag_elem in tag_elements:
            tag_text = tag_elem.get('alt') or tag_elem.get('title') or \
                       tag_elem.get_text(strip=True)
            if tag_text:
                tags.append(tag_text.lower())
        
        # Check content for dietary keywords
        content = f"{name} {description or ''}".lower()
        
        for tag_name, keywords in self.DIETARY_TAGS.items():
            for keyword in keywords:
                if keyword in content:
                    if tag_name not in tags:
                        tags.append(tag_name)
                    break
        
        return tags
    
    def _parse_flat_menu(
        self,
        soup,
        hall_id: str,
        meal_type: str,
        menu_date: date
    ) -> List[Dict]:
        """Parse menu when items are not organized in stations"""
        items = []
        
        # Try to find any list items or menu items
        elements = soup.find_all('li') or soup.find_all(class_='menu-item')
        
        for element in elements:
            item = self._parse_item(
                element=element,
                category="General",
                hall_id=hall_id,
                meal_type=meal_type,
                menu_date=menu_date
            )
            if item:
                items.append(item)
        
        return items
    
    @staticmethod
    def _parse_number(text: str) -> Optional[int]:
        """Extract a number from text"""
        if not text:
            return None
        
        # Find first number in text
        match = re.search(r'\d+', text)
        if match:
            return int(match.group())
        return None
