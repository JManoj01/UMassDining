"""
UMass Dining Menu Scraper - Scheduled Jobs
"""
import logging
import schedule
import time
from typing import Callable

from config import SCRAPE_TIME

logger = logging.getLogger(__name__)


def start_scheduler(scrape_function: Callable):
    """
    Start the scheduled scraper
    
    Args:
        scrape_function: Function to call for scraping
    """
    # Schedule daily scrape
    schedule.every().day.at(SCRAPE_TIME).do(scrape_function)
    
    logger.info(f"Scheduler started. Scraping daily at {SCRAPE_TIME}")
    
    # Run immediately on start
    logger.info("Running initial scrape...")
    try:
        scrape_function()
    except Exception as e:
        logger.error(f"Initial scrape failed: {e}")
    
    # Keep running
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
            break
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
            time.sleep(300)  # Wait 5 minutes on error


def run_with_retry(func: Callable, max_retries: int = 3, delay: int = 60):
    """
    Run a function with retry logic
    
    Args:
        func: Function to run
        max_retries: Maximum retry attempts
        delay: Delay between retries in seconds
    """
    for attempt in range(max_retries):
        try:
            func()
            return
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {delay} seconds...")
                time.sleep(delay)
    
    logger.error("All retry attempts failed")
