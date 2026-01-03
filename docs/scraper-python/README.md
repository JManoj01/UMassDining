# UMass Dining Menu Scraper - Python Module

Complete Python scraper for UMass Amherst dining hall menus with PostgreSQL storage.

## Technology Stack

- **Python 3.10+**
- **BeautifulSoup4** - HTML parsing
- **Requests** - HTTP client
- **psycopg2** - PostgreSQL driver
- **Schedule** - Job scheduling
- **python-dotenv** - Environment configuration

## Prerequisites

- Python 3.10 or higher
- PostgreSQL 15+
- pip or poetry

## Project Structure

```
scraper-python/
├── main.py                 # Entry point
├── config.py               # Configuration
├── requirements.txt        # Dependencies
├── scraper/
│   ├── __init__.py
│   ├── menu_scraper.py     # Main scraping logic
│   ├── parser.py           # HTML parsing
│   └── utils.py            # Utility functions
├── database/
│   ├── __init__.py
│   ├── connection.py       # Database connection
│   └── models.py           # Database operations
├── scheduler/
│   ├── __init__.py
│   └── jobs.py             # Scheduled jobs
└── sql/
    └── schema.sql          # Database schema
```

## Quick Start

### 1. Set Up Database

```bash
# Create database
createdb umass_dining

# Run schema
psql -U postgres -d umass_dining -f sql/schema.sql
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/umass_dining
SCRAPE_SCHEDULE=06:00
```

### 4. Run Scraper

```bash
# Single run
python main.py --mode once

# Continuous with scheduler (runs daily at configured time)
python main.py --mode schedule

# Scrape specific date
python main.py --mode once --date 2024-01-15
```

## UMass Dining URLs

The scraper fetches menus from:
- https://umassdining.com/locations-menus/worcester
- https://umassdining.com/locations-menus/franklin
- https://umassdining.com/locations-menus/berkshire
- https://umassdining.com/locations-menus/hampshire

## Configuration (config.py)

```python
# Dining halls
DINING_HALLS = {
    "worcester": {
        "id": "worcester",
        "name": "Worcester Dining Commons",
        "url_slug": "worcester"
    },
    # ... franklin, berkshire, hampshire
}

# Meal types
MEAL_TYPES = ["breakfast", "lunch", "dinner"]

# Request settings
REQUEST_TIMEOUT = 30
MAX_RETRIES = 3
RETRY_DELAY = 5
```

## Usage Examples

### Basic Scraping

```python
from scraper import MenuScraper

# Initialize
scraper = MenuScraper()

# Scrape all halls
menus = scraper.scrape_all_halls()

# Save to database
saved_count = scraper.save_to_database(menus)
print(f"Saved {saved_count} items")
```

### Scrape Specific Hall

```python
from datetime import date
from scraper import MenuScraper

scraper = MenuScraper()

# Scrape just Worcester for today
items = scraper.scrape_meal("worcester", "lunch", date.today())
```

### Using the Parser Directly

```python
from scraper import MenuParser

parser = MenuParser()

# Parse HTML content
with open("menu_page.html") as f:
    html = f.read()

items = parser.parse_menu_page(
    html,
    hall_id="worcester",
    meal_type="lunch",
    menu_date=date.today()
)
```

### Dietary Tag Inference

```python
from scraper.utils import infer_dietary_tags

# Returns ['vegetarian', 'vegan', 'dairy-free']
tags = infer_dietary_tags("Roasted Vegetable Medley", "Fresh seasonal vegetables")

# Returns [] (has meat)
tags = infer_dietary_tags("Grilled Chicken Breast", "Seasoned and grilled")
```

## Database Models

### Insert Menu Items

```python
from database import MenuItemDB

item = {
    "name": "Grilled Chicken Sandwich",
    "description": "Seasoned grilled chicken",
    "dining_hall_id": "worcester",
    "meal_type": "lunch",
    "menu_date": "2024-01-15",
    "category": "Grill",
    "calories": 450,
    "protein": 35,
    "carbs": 42,
    "fat": 12,
    "tags": ["gluten-free"]
}

MenuItemDB.upsert_menu_item(item)
```

### Query Menu Items

```python
from database import MenuItemDB
from datetime import date

# Get today's menu
items = MenuItemDB.get_menu_by_date(date.today())

# Filter by hall and meal
items = MenuItemDB.get_menu_by_hall_and_meal(
    date.today(),
    "worcester",
    "lunch"
)
```

## Scheduling

The scheduler runs the scraper at configured times:

```python
from scheduler import start_scheduler

def my_scrape_function():
    from scraper import MenuScraper
    scraper = MenuScraper()
    menus = scraper.scrape_all_halls()
    scraper.save_to_database(menus)

# Runs daily at 6 AM (or configured time)
start_scheduler(my_scrape_function)
```

## Logging

Logs are written to `scraper.log` and stdout:

```
2024-01-15 06:00:00 - INFO - Starting menu scrape...
2024-01-15 06:00:02 - INFO - Scraping Worcester...
2024-01-15 06:00:05 - INFO - Found 45 items from Worcester
2024-01-15 06:00:07 - INFO - Scraping Franklin...
...
2024-01-15 06:00:20 - INFO - Successfully scraped and saved 180 menu items
```

## Integration with Java Backend

The scraper stores data in the same PostgreSQL database that the Java backend reads from:

1. Run the scraper on a schedule (cron, systemd, etc.)
2. Java backend reads from `menu_items` table
3. Both use the same schema from `sql/schema.sql`

### Cron Example

```bash
# Run daily at 6 AM
0 6 * * * /path/to/venv/bin/python /path/to/main.py --mode once
```

### Systemd Service

Create `/etc/systemd/system/umass-scraper.service`:
```ini
[Unit]
Description=UMass Dining Menu Scraper
After=network.target

[Service]
Type=simple
User=scraper
WorkingDirectory=/opt/umass-scraper
ExecStart=/opt/umass-scraper/venv/bin/python main.py --mode schedule
Restart=always

[Install]
WantedBy=multi-user.target
```

## Testing

```bash
# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=scraper tests/
```

## Troubleshooting

### Connection Issues

```python
# Test database connection
from database import get_connection
conn = get_connection()
print("Connected!" if conn else "Failed")
```

### Scraping Issues

```python
# Test URL access
import requests
url = "https://umassdining.com/locations-menus/worcester"
response = requests.get(url, timeout=30)
print(f"Status: {response.status_code}")
```

### Rate Limiting

If you get blocked, increase delays in `config.py`:
```python
REQUEST_TIMEOUT = 60
RETRY_DELAY = 10
```
