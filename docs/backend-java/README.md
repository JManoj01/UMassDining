# UMass Dining Recommendation Platform - Java Backend

Complete Java/Spring Boot backend for the UMass Dining Recommendation Platform.

## Technology Stack

- **Java 17+**
- **Spring Boot 3.2+**
- **Spring Data JPA**
- **Spring Security + JWT**
- **PostgreSQL 15+**
- **Lombok**
- **SpringDoc OpenAPI (Swagger)**

## Prerequisites

- JDK 17 or higher
- Maven 3.8+
- PostgreSQL 15+

## Project Structure

```
src/
├── UmassDiningApplication.java       # Main entry point
├── config/
│   ├── application.properties        # Configuration
│   ├── SecurityConfig.java           # JWT security
│   └── CorsConfig.java               # CORS settings
├── controller/
│   ├── MenuController.java           # Menu endpoints
│   ├── DiningHallController.java     # Dining hall info
│   ├── RecommendationController.java # AI recommendations
│   ├── UserPreferenceController.java # User preferences
│   └── AuthController.java           # Authentication
├── service/
│   ├── MenuService.java              # Menu business logic
│   ├── RecommendationService.java    # Recommendation engine
│   ├── UserPreferenceService.java    # Preference management
│   ├── AuthService.java              # JWT authentication
│   └── ScrapingService.java          # Menu scraping
├── repository/
│   ├── MenuItemRepository.java
│   ├── DiningHallRepository.java
│   ├── UserPreferenceRepository.java
│   ├── MealRatingRepository.java
│   └── UserRepository.java
├── model/
│   ├── MenuItem.java
│   ├── DiningHall.java
│   ├── UserPreference.java
│   ├── MealRating.java
│   ├── MealType.java
│   └── User.java
├── dto/
│   ├── MenuItemDTO.java
│   ├── RecommendationDTO.java
│   ├── UserPreferenceDTO.java
│   ├── AuthRequest.java
│   └── AuthResponse.java
└── exception/
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

## Quick Start

### 1. Create Spring Boot Project

Using Spring Initializr (https://start.spring.io/):
- Project: Maven
- Language: Java
- Spring Boot: 3.2.x
- Dependencies:
  - Spring Web
  - Spring Data JPA
  - PostgreSQL Driver
  - Spring Security
  - Lombok
  - Validation

### 2. Copy Source Files

```bash
# Copy all files from this docs/backend-java/src directory
# to your Spring Boot project's src/main/java/com/umassdining/
```

### 3. Configure Database

Create the database:
```sql
CREATE DATABASE umass_dining;
```

Run the schema:
```bash
psql -U postgres -d umass_dining -f ../scraper-python/sql/schema.sql
```

### 4. Update application.properties

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/umass_dining
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE

# JWT Secret (change in production!)
jwt.secret=your-super-secret-jwt-key-minimum-32-characters
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html`

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menus` | Get today's menu |
| GET | `/api/menus?date={date}` | Get menu for specific date |
| GET | `/api/menus?hall={id}` | Filter by dining hall |
| GET | `/api/menus?mealType={type}` | Filter by meal type |
| GET | `/api/dining-halls` | List all dining halls |
| GET | `/api/dining-halls/{id}` | Get dining hall details |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |
| GET | `/api/preferences` | Get user preferences |
| POST | `/api/preferences` | Save user preferences |
| POST | `/api/ratings` | Rate a menu item |
| GET | `/api/ratings` | Get user's ratings |

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Recommendation Engine

The `RecommendationService` scores menu items based on:
1. **Dietary Matching** - Items matching user's dietary preferences
2. **Favorite Halls** - Items from user's favorite dining halls
3. **Disliked Ingredients** - Penalizes items with disliked ingredients
4. **Past Ratings** - Boosts items similar to highly-rated items
5. **Item Popularity** - Considers overall item ratings

## Menu Scraping

The `ScrapingService` runs daily at 6 AM (configurable) to fetch menus from:
- https://umassdining.com/locations-menus/worcester
- https://umassdining.com/locations-menus/franklin
- https://umassdining.com/locations-menus/berkshire
- https://umassdining.com/locations-menus/hampshire

## Building for Production

```bash
# Create JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/umass-dining-api-1.0.0.jar
```

## Docker Support

Create a `Dockerfile`:
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/umass-dining-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t umass-dining-api .
docker run -p 8080:8080 umass-dining-api
```

## Frontend Integration

The React frontend can call this backend instead of Supabase:

```typescript
// src/lib/api/backend.ts
const API_URL = 'http://localhost:8080/api';

export async function getMenus(date?: string, hall?: string) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (hall) params.append('hall', hall);
  
  const response = await fetch(`${API_URL}/menus?${params}`);
  return response.json();
}

export async function getRecommendations(token: string) {
  const response = await fetch(`${API_URL}/recommendations`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}
```
