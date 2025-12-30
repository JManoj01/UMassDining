"""
UMass Dining Menu Scraper - Database Connection
"""
import logging
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor

from config import DATABASE_URL

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Manages PostgreSQL database connections"""
    
    def __init__(self, database_url: str = None):
        self.database_url = database_url or DATABASE_URL
        self._connection = None
    
    def connect(self):
        """Establish database connection"""
        if self._connection is None or self._connection.closed:
            try:
                self._connection = psycopg2.connect(self.database_url)
                logger.info("Database connection established")
            except psycopg2.Error as e:
                logger.error(f"Failed to connect to database: {e}")
                raise
        return self._connection
    
    def close(self):
        """Close database connection"""
        if self._connection and not self._connection.closed:
            self._connection.close()
            logger.info("Database connection closed")
    
    @contextmanager
    def get_cursor(self, commit: bool = True):
        """
        Context manager for database cursor
        
        Args:
            commit: Whether to auto-commit on success
            
        Yields:
            Database cursor
        """
        conn = self.connect()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()


# Singleton connection
_db_connection = None


def get_db_connection() -> DatabaseConnection:
    """Get or create database connection singleton"""
    global _db_connection
    if _db_connection is None:
        _db_connection = DatabaseConnection()
    return _db_connection
