# UMass Dining Recommendation Platform

A personalized meal recommendation system for UMass Amherst dining halls. Browse daily menus from Worcester, Franklin, Berkshire, and Hampshire dining commons, and get AI-powered recommendations based on your dietary preferences.

## Tech Stack

### Frontend (React)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | Component library |
| TensorFlow.js | 4.22 | Client-side ML recommendations |
| React Router | 6.x | Routing |
| TanStack Query | 5.x | Data fetching |

### Backend (Java/Spring Boot)
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17+ | Language |
| Spring Boot | 3.2 | Web framework |
| Spring Data JPA | 3.2 | Database ORM |
| Spring Security | 6.x | Authentication |
| PostgreSQL | 15+ | Database |
| JWT (jjwt) | 0.12 | Token auth |
| Lombok | Latest | Boilerplate reduction |
| SpringDoc OpenAPI | 2.3 | API documentation |
| Redis | 7.x | Caching |

### Menu Scraper (Python)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Language |
| BeautifulSoup4 | 4.12+ | HTML parsing |
| Requests | 2.31+ | HTTP client |
| psycopg2 | 2.9+ | PostgreSQL driver |
| Schedule | 1.2+ | Job scheduling |
| python-dotenv | 1.0+ | Environment config |
| Firecrawl | Latest | Web scraping SDK |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker Compose | Local orchestration |
| Docker | Containerization |

---

## Quick Start (Full Stack)

### Prerequisites
- Docker & Docker Compose

### Steps

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```
   This will start PostgreSQL, Redis, the Java backend, and the Python scraper.

2. The backend API will be available at `http://localhost:8080/api`.

3. The frontend should be configured to use this API endpoint.

---

## API Endpoints (Java Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menus` | Today's menu items |
| GET | `/api/menus?date={date}&hall={id}` | Filtered menus |
| GET | `/api/dining-halls` | All dining halls |
| GET | `/api/recommendations` | Personalized recommendations |
| POST | `/api/preferences` | Save user preferences |
| GET | `/api/preferences` | Get user preferences |
| POST | `/api/ratings` | Rate a menu item |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

---

## Database Schema

- See `docs/scraper-python/sql/schema.sql` for full schema.

---

## Running Backend and Scraper Manually

### Java Backend
```bash
cd docs/backend-java
./mvnw spring-boot:run
```

### Python Scraper
```bash
cd docs/scraper-python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit as needed
python main.py --mode once  # Or --mode schedule
```

---



---
