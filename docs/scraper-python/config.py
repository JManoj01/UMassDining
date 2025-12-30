"""
UMass Dining Menu Scraper - Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/umass_dining"
)

# Scraping Configuration
UMASS_DINING_BASE_URL = "https://umassdining.com/locations-menus"

# Dining Hall IDs and URLs
DINING_HALLS = {
    "worcester": {
        "id": "worcester",
        "name": "Worcester Dining Commons",
        "short_name": "Worcester",
        "url_slug": "worcester"
    },
    "franklin": {
        "id": "franklin", 
        "name": "Franklin Dining Commons",
        "short_name": "Franklin",
        "url_slug": "franklin"
    },
    "berkshire": {
        "id": "berkshire",
        "name": "Berkshire Dining Commons", 
        "short_name": "Berkshire",
        "url_slug": "berkshire"
    },
    "hampshire": {
        "id": "hampshire",
        "name": "Hampshire Dining Commons",
        "short_name": "Hampshire", 
        "url_slug": "hampshire"
    }
}

# Meal Types
MEAL_TYPES = ["breakfast", "lunch", "dinner"]

# Scraping Schedule (24-hour format)
SCRAPE_TIME = os.getenv("SCRAPE_SCHEDULE", "06:00")

# Request Configuration
REQUEST_TIMEOUT = 30
REQUEST_HEADERS = {
    "User-Agent": "UMass Dining Recommendation Bot/1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Retry Configuration
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
