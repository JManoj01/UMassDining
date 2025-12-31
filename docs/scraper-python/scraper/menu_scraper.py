"""
UMass Dining Menu Scraper - Core Scraping Logic

DINING HALL URLS:
- Worcester: https://umassdining.com/locations-menus/worcester
- Franklin:  https://umassdining.com/locations-menus/franklin
- Berkshire: https://umassdining.com/locations-menus/berkshire
- Hampshire: https://umassdining.com/locations-menus/hampshire
"""
import logging
import time
from datetime import datetime, date
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup

from config import (
    UMASS_DINING_BASE_URL,
    DINING_HALLS,
    MEAL_TYPES,
    REQUEST_HEADERS,
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY
)
from .parser import MenuParser
from database.connection import get_db_connection
from database.models import MenuItemDB

logger = logging.getLogger(__name__)


class MenuScraper:
    """
    Scrapes UMass dining menus from the official website.
    
    Supported dining halls:
    - Worcester: https://umassdining.com/locations-menus/worcester
    - Franklin:  https://umassdining.com/locations-menus/franklin
    - Berkshire: https://umassdining.com/locations-menus/berkshire
    - Hampshire: https://umassdining.com/locations-menus/hampshire
    """
    
    def __init__(self):
        self.parser = MenuParser()
        self.session = requests.Session()
        self.session.headers.update(REQUEST_HEADERS)
    
    def scrape_all_halls(self, target_date: Optional[date] = None) -> List[Dict]:
        """
        Scrape menus from all dining halls.
        
        Args:
            target_date: Date to scrape (defaults to today)
            
        Returns:
            List of menu item dictionaries
        """
        if target_date is None:
            target_date = date.today()
            
        all_menus = []
        
        for hall_id, hall_info in DINING_HALLS.items():
            logger.info(f"Scraping {hall_info['name']} ({hall_info['full_url']})...")
            
            for meal_type in MEAL_TYPES:
                try:
                    items = self.scrape_meal(
                        hall_id=hall_id,
                        meal_type=meal_type,
                        target_date=target_date
                    )
                    all_menus.extend(items)
                    logger.info(f"  {meal_type}: {len(items)} items")
                    
                except Exception as e:
                    logger.error(f"Failed to scrape {hall_id} {meal_type}: {e}")
                    
                # Be nice to the server
                time.sleep(1)
        
        return all_menus
    
    def scrape_meal(
        self, 
        hall_id: str, 
        meal_type: str,
        target_date: date
    ) -> List[Dict]:
        """
        Scrape menu for a specific hall and meal.
        
        Args:
            hall_id: Dining hall identifier (worcester, franklin, berkshire, hampshire)
            meal_type: breakfast, lunch, or dinner
            target_date: Date to scrape
            
        Returns:
            List of menu item dictionaries
        """
        url = self._build_url(hall_id, target_date)
        html = self._fetch_page(url)
        
        if not html:
            return []
        
        # Parse the HTML
        items = self.parser.parse_menu_page(
            html=html,
            hall_id=hall_id,
            meal_type=meal_type,
            menu_date=target_date
        )
        
        return items
    
    def _build_url(self, hall_id: str, target_date: date) -> str:
        """
        Build the URL for a specific dining hall and date.
        
        Examples:
            - https://umassdining.com/locations-menus/worcester
            - https://umassdining.com/locations-menus/worcester/2024-01-15
        """
        hall_info = DINING_HALLS.get(hall_id)
        if not hall_info:
            raise ValueError(f"Unknown dining hall: {hall_id}")
        
        # Format: https://umassdining.com/locations-menus/{hall}/{date}
        date_str = target_date.strftime("%Y-%m-%d")
        return f"{UMASS_DINING_BASE_URL}/{hall_info['url_slug']}/{date_str}"
    
    def _fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch a page with retry logic.
        
        Args:
            url: URL to fetch
            
        Returns:
            HTML content or None if failed
        """
        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(url, timeout=REQUEST_TIMEOUT)
                response.raise_for_status()
                return response.text
                
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
        
        logger.error(f"All attempts failed for {url}")
        return None
    
    def save_to_database(self, menu_items: List[Dict]) -> int:
        """
        Save menu items to the database.
        
        Args:
            menu_items: List of menu item dictionaries
            
        Returns:
            Number of items saved
        """
        if not menu_items:
            return 0
        
        db = MenuItemDB()
        saved_count = 0
        
        for item in menu_items:
            try:
                db.upsert_menu_item(item)
                saved_count += 1
            except Exception as e:
                logger.error(f"Failed to save item {item.get('name')}: {e}")
        
        logger.info(f"Saved {saved_count}/{len(menu_items)} items to database")
        return saved_count
