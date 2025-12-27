import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { DiningHallCard } from "@/components/DiningHallCard";
import { MenuPage } from "@/components/MenuPage";
import { PreferencesPage, UserPreferences } from "@/components/PreferencesPage";
import { RecommendationsPage } from "@/components/RecommendationsPage";
import { diningHalls } from "@/data/diningData";

type Page = "home" | "menus" | "recommendations" | "preferences";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHall, setSelectedHall] = useState<string | undefined>();
  const [userPreferences, setUserPreferences] = useState<UserPreferences | undefined>();

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    if (page !== "menus") {
      setSelectedHall(undefined);
    }
  };

  const handleDiningHallClick = (hallId: string) => {
    setSelectedHall(hallId);
    setCurrentPage("menus");
  };

  const handleSavePreferences = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
  };

  // Render menu page
  if (currentPage === "menus") {
    return (
      <>
        <Helmet>
          <title>Menus | UMass Dining - Today's Menu at All Dining Commons</title>
          <meta
            name="description"
            content="Browse today's menus from all four UMass Amherst dining commons. View breakfast, lunch, and dinner options with nutritional information."
          />
        </Helmet>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <MenuPage
          hallId={selectedHall}
          onBack={() => setCurrentPage("home")}
        />
      </>
    );
  }

  // Render preferences page
  if (currentPage === "preferences") {
    return (
      <>
        <Helmet>
          <title>Preferences | UMass Dining - Personalize Your Meal Recommendations</title>
          <meta
            name="description"
            content="Set your dietary preferences and favorite dining halls to get personalized meal recommendations at UMass Amherst."
          />
        </Helmet>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <PreferencesPage
          onSave={handleSavePreferences}
          initialPreferences={userPreferences}
        />
      </>
    );
  }

  // Render recommendations page
  if (currentPage === "recommendations") {
    return (
      <>
        <Helmet>
          <title>For You | UMass Dining - Personalized Meal Recommendations</title>
          <meta
            name="description"
            content="Get personalized meal recommendations based on your dietary preferences at UMass Amherst dining commons."
          />
        </Helmet>
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        <RecommendationsPage
          preferences={userPreferences}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // Render home page
  return (
    <>
      <Helmet>
        <title>UMass Dining | America's #1 Ranked Campus Dining Program</title>
        <meta
          name="description"
          content="Discover daily menus from Worcester, Franklin, Berkshire, and Hampshire dining halls. Get personalized meal recommendations at UMass Amherst."
        />
      </Helmet>
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      <main>
        {/* Hero Section */}
        <HeroSection onNavigate={handleNavigate} />

        {/* Dining Halls Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Dining Commons
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Four award-winning dining halls serving fresh, diverse cuisines
                crafted by our talented culinary team.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
              {diningHalls.map((hall) => (
                <DiningHallCard
                  key={hall.id}
                  hall={hall}
                  onClick={() => handleDiningHallClick(hall.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Features */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-maroon flex items-center justify-center mx-auto mb-4 shadow-maroon">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Fresh Daily Menus</h3>
                <p className="text-muted-foreground">
                  Menus updated every day with seasonal ingredients and chef specials.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-maroon flex items-center justify-center mx-auto mb-4 shadow-maroon">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
                <p className="text-muted-foreground">
                  Get personalized meal suggestions based on your dietary preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-maroon flex items-center justify-center mx-auto mb-4 shadow-maroon">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Nutrition Info</h3>
                <p className="text-muted-foreground">
                  Complete nutritional details for every item to help you eat mindfully.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-lg">🍴</span>
                </div>
                <span className="font-bold">UMass Dining</span>
              </div>
              <p className="text-sm text-background/70">
                © {new Date().getFullYear()} UMass Amherst Dining Services. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
