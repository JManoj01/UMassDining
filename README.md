# UMass Dining Recommendation Platform

A personalized meal recommendation system for UMass Amherst dining halls. Browse daily menus from Worcester, Franklin, Berkshire, and Hampshire dining commons, and get AI-powered recommendations based on your dietary preferences.

## Features

- **Daily Menu Scraping**: Automatically fetches real menu data from all four UMass dining halls
- **Personalized Recommendations**: TensorFlow.js-powered recommendation engine learns your preferences
- **Dietary Filtering**: Support for vegetarian, vegan, gluten-free, and dairy-free diets
- **Allergen Detection**: Identifies common allergens (nuts, soy, shellfish, eggs, wheat, dairy)
- **Nutrition Tracking**: View calories, protein, carbs, and fat for each menu item
- **Time-Based Suggestions**: Automatic meal recommendations for breakfast, lunch, and dinner

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **ML**: TensorFlow.js for client-side recommendations
- **Scraping**: Firecrawl API for menu data extraction

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd umass-dining

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Architecture

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── MenuBrowser.tsx # Menu browsing interface
│   ├── RecommendationEngine.tsx # AI recommendations
│   └── PreferencesPanel.tsx # User preferences
├── lib/
│   ├── menu/           # Menu tagging and filtering
│   └── tensorflow/     # Recommendation engine
├── pages/              # Route pages
└── integrations/       # Supabase client

supabase/
└── functions/
    └── scrape-menus/   # Edge function for menu scraping

docs/
├── backend-java/       # Java/Spring Boot backend reference
└── scraper-python/     # Python scraper reference
```

## Dining Halls

| Hall | Location | Specialty |
|------|----------|-----------|
| Worcester | Central Campus | Home-style comfort food |
| Franklin | Southwest | International cuisine |
| Berkshire | Southwest | Asian fusion, sushi |
| Hampshire | Northeast | Pizza, late-night |

## API Endpoints

### Scrape Menus
```
POST /functions/v1/scrape-menus
```
Triggers menu scraping for all dining halls. Runs automatically daily.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- UMass Dining Services for the original menu data
- Built for UMass Amherst students 🐘
