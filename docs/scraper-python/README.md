# UMass Dining Menu Scraper - Python Module

## Overview
This Python module scrapes the official UMass Amherst dining menus and stores them in PostgreSQL.

## Requirements
```
requests>=2.31.0
beautifulsoup4>=4.12.0
psycopg2-binary>=2.9.9
schedule>=1.2.0
python-dotenv>=1.0.0
selenium>=4.15.0  # For JavaScript-rendered content
webdriver-manager>=4.0.1
```

## Project Structure
```
scraper/
├── main.py                 # Entry point
├── config.py               # Configuration
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
└── tests/
    └── test_scraper.py
```

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/umass_dining
SCRAPE_SCHEDULE=06:00
```

3. Run the scraper:
```bash
python main.py
```

## UMass Dining URLs
- Main menu page: https://umassdining.com/locations-menus/{hall}/{date}
- Dining halls: worcester, franklin, berkshire, hampshire

## Usage
```python
from scraper import MenuScraper

scraper = MenuScraper()
menus = scraper.scrape_all_halls()
scraper.save_to_database(menus)
```
