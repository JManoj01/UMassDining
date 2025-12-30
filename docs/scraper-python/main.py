"""
UMass Dining Menu Scraper - Main Entry Point
"""
import logging
import argparse
from datetime import datetime
from scraper.menu_scraper import MenuScraper
from scheduler.jobs import start_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


def run_scrape():
    """Run a single scrape operation"""
    logger.info("Starting menu scrape...")
    
    try:
        scraper = MenuScraper()
        
        # Scrape all dining halls
        menus = scraper.scrape_all_halls()
        
        if menus:
            # Save to database
            saved_count = scraper.save_to_database(menus)
            logger.info(f"Successfully scraped and saved {saved_count} menu items")
        else:
            logger.warning("No menu items found during scrape")
            
    except Exception as e:
        logger.error(f"Scrape failed: {str(e)}", exc_info=True)
        raise


def main():
    parser = argparse.ArgumentParser(description='UMass Dining Menu Scraper')
    parser.add_argument(
        '--mode', 
        choices=['once', 'schedule'], 
        default='once',
        help='Run mode: once (single run) or schedule (continuous)'
    )
    parser.add_argument(
        '--date',
        type=str,
        default=None,
        help='Specific date to scrape (YYYY-MM-DD format)'
    )
    
    args = parser.parse_args()
    
    if args.mode == 'once':
        logger.info("Running single scrape...")
        run_scrape()
    else:
        logger.info("Starting scheduled scraper...")
        start_scheduler(run_scrape)


if __name__ == "__main__":
    main()
