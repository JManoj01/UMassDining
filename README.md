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

### Menu Scraper (Python)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Language |
| BeautifulSoup4 | 4.12+ | HTML parsing |
| Requests | 2.31+ | HTTP client |
| psycopg2 | 2.9+ | PostgreSQL driver |
| Schedule | 1.2+ | Job scheduling |
| python-dotenv | 1.0+ | Environment config |

### Cloud/Infrastructure
| Technology | Purpose |
|------------|---------|
| Supabase | Hosted PostgreSQL + Auth + Edge Functions |
| Firecrawl API | Web scraping service |

---

## Project Structure

```
umass-dining/
├── src/                          # React frontend
│   ├── components/               # UI components
│   ├── lib/
│   │   ├── menu/                 # Menu filtering logic
│   │   └── tensorflow/           # ML recommendation engine
│   ├── pages/                    # Route pages
│   └── integrations/supabase/    # Supabase client
│
├── supabase/
│   └── functions/
│       └── scrape-menus/         # Edge function for Firecrawl scraping
│
├── docs/
│   ├── backend-java/             # Java Spring Boot backend
│   │   ├── src/
│   │   │   ├── config/           # Security, CORS configs
│   │   │   ├── controller/       # REST endpoints
│   │   │   ├── service/          # Business logic
│   │   │   ├── repository/       # Data access
│   │   │   ├── model/            # JPA entities
│   │   │   ├── dto/              # Data transfer objects
│   │   │   └── exception/        # Error handling
│   │   ├── pom.xml               # Maven dependencies
│   │   └── README.md
│   │
│   └── scraper-python/           # Python menu scraper
│       ├── scraper/              # Scraping logic
│       ├── database/             # DB connection
│       ├── scheduler/            # Cron jobs
│       ├── sql/                  # Database schema
│       ├── requirements.txt
│       └── README.md
```

---

## Quick Start

### Option 1: Frontend Only (Uses Supabase Edge Functions)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend uses Supabase Edge Functions for menu scraping via Firecrawl.

### Option 2: Full Stack (Java Backend + Python Scraper)

#### Step 1: Database Setup

```bash
# Run the SQL schema
psql -U postgres -d umass_dining -f docs/scraper-python/sql/schema.sql
```

#### Step 2: Java Backend

```bash
cd docs/backend-java

# Create application.properties from template
cp src/config/application.properties src/main/resources/application.properties

# Edit database credentials
nano src/main/resources/application.properties

# Run with Maven
mvn spring-boot:run
```

#### Step 3: Python Scraper

```bash
cd docs/scraper-python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/umass_dining" > .env

# Run once
python main.py --mode once

# Or run with scheduler (daily at 6 AM)
python main.py --mode schedule
```

#### Step 4: Frontend (pointing to Java backend)

```bash
# Update API endpoint in src/integrations/supabase/client.ts
# Or create a new API client for the Java backend

npm run dev
```

---

## Features

### Dietary Filtering
- **Vegetarian**: No meat or seafood
- **Vegan**: No animal products
- **Gluten-Free**: No wheat/gluten
- **Dairy-Free**: No dairy products

### Allergen Detection
- Nuts, soy, shellfish, eggs, wheat, dairy

### Personalization
- Favorite dining halls
- Disliked ingredients
- Time-based meal recommendations

### Nutrition Tracking
- Calories, protein, carbs, fat per item

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

```sql
-- Core tables
dining_halls     -- Worcester, Franklin, Berkshire, Hampshire
menu_items       -- Daily menu items with nutrition
user_preferences -- Dietary preferences, favorites
meal_ratings     -- User ratings for items

-- See docs/scraper-python/sql/schema.sql for full schema
```

---

## Dining Halls

| Hall | Location | Specialty |
|------|----------|-----------|
| Worcester | Southwest | Home-style comfort food |
| Franklin | Central | International cuisine |
| Berkshire | Southwest | Asian fusion, sushi |
| Hampshire | Northeast | Pizza, late-night |

**Menu URLs:**
- https://umassdining.com/locations-menus/worcester
- https://umassdining.com/locations-menus/franklin
- https://umassdining.com/locations-menus/berkshire
- https://umassdining.com/locations-menus/hampshire

---

## Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### Java Backend (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/umass_dining
spring.datasource.username=postgres
spring.datasource.password=your_password
jwt.secret=your-jwt-secret-key
```

#### Python Scraper (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/umass_dining
SCRAPE_SCHEDULE=06:00
```

---

## Development

### Running Tests

```bash
# Frontend
npm run test

# Java Backend
cd docs/backend-java && mvn test

# Python Scraper
cd docs/scraper-python && python -m pytest
```

### Building for Production

```bash
# Frontend
npm run build

# Java Backend
cd docs/backend-java && mvn package
```

---

## Integration Guide

### Connecting Frontend to Java Backend

1. Update `src/lib/api/client.ts` to point to Java backend:

```typescript
const API_BASE = 'http://localhost:8080/api';

export const menuApi = {
  getMenus: (date?: string, hall?: string) => 
    fetch(`${API_BASE}/menus?date=${date}&hall=${hall}`).then(r => r.json()),
  
  getRecommendations: () =>
    fetch(`${API_BASE}/recommendations`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => r.json()),
};
```

### Using TensorFlow.js Recommendations

The frontend includes a client-side TensorFlow.js model that can work independently or alongside the Java backend:

```typescript
import { recommender } from '@/lib/tensorflow/recommender';

// Initialize once
await recommender.initialize();

// Score items
const scored = await recommender.scoreItems(menuItems, userPreferences);
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details.

---

## Acknowledgments

Built for UMass Amherst students 🐘
