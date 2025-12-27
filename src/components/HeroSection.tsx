import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dining.jpg";

interface HeroSectionProps {
  onNavigate: (page: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="UMass Dining Commons showcasing diverse cuisines"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6 animate-fade-up">
            <Star className="w-4 h-4 text-gold" fill="currentColor" />
            <span className="text-sm font-medium text-primary-foreground">
              America's #1 Ranked Campus Dining
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Discover Your Next
            <span className="block text-gold">Favorite Meal</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            Explore menus from all four dining commons, get personalized recommendations,
            and never miss your favorite dishes at UMass Amherst.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => onNavigate("menus")}
            >
              View Today's Menus
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => onNavigate("recommendations")}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Get Recommendations
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <span className="text-sm text-primary-foreground/70">Dining Commons</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-2xl font-bold text-primary-foreground">7AM-10PM</span>
              </div>
              <span className="text-sm text-primary-foreground/70">Open Daily</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Star className="w-4 h-4 text-gold" fill="currentColor" />
                <span className="text-2xl font-bold text-primary-foreground">50+</span>
              </div>
              <span className="text-sm text-primary-foreground/70">Daily Dishes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100V60C240 20 480 0 720 20C960 40 1200 80 1440 60V100H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
