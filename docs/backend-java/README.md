# UMass Dining Recommendation Platform - Java Backend

## Overview
This document provides complete Java/Spring Boot backend specifications for the UMass Dining Recommendation Platform.

## Technology Stack
- **Java 17+**
- **Spring Boot 3.2+**
- **Spring Data JPA**
- **PostgreSQL 15+**
- **Maven/Gradle**

## Project Structure
```
src/main/java/com/umassdining/
├── UmassDiningApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── SwaggerConfig.java
├── controller/
│   ├── MenuController.java
│   ├── DiningHallController.java
│   ├── RecommendationController.java
│   ├── UserPreferenceController.java
│   └── AuthController.java
├── service/
│   ├── MenuService.java
│   ├── RecommendationService.java
│   ├── UserPreferenceService.java
│   └── ScrapingService.java
├── repository/
│   ├── MenuItemRepository.java
│   ├── DiningHallRepository.java
│   ├── UserPreferenceRepository.java
│   └── MealRatingRepository.java
├── model/
│   ├── MenuItem.java
│   ├── DiningHall.java
│   ├── UserPreference.java
│   ├── MealRating.java
│   └── User.java
├── dto/
│   ├── MenuItemDTO.java
│   ├── RecommendationDTO.java
│   └── UserPreferenceDTO.java
├── enums/
│   └── MealType.java
└── exception/
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

## Quick Start

### 1. Create Spring Boot Project
Use Spring Initializr (https://start.spring.io/) with:
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Lombok
- Validation

### 2. Application Properties
See `application.properties` file in this directory.

### 3. Run the Application
```bash
mvn spring-boot:run
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menus` | Get all menu items for today |
| GET | `/api/menus?date={date}&hall={id}` | Filter menus |
| GET | `/api/dining-halls` | Get all dining halls |
| GET | `/api/recommendations` | Get personalized recommendations |
| POST | `/api/preferences` | Save user preferences |
| GET | `/api/preferences` | Get user preferences |
| POST | `/api/ratings` | Rate a menu item |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

## Database Schema
See the SQL files in the `sql/` directory for complete schema.
