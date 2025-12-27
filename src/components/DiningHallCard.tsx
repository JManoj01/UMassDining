import { Clock, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiningHall } from "@/data/diningData";

interface DiningHallCardProps {
  hall: DiningHall;
  onClick: () => void;
}

export function DiningHallCard({ hall, onClick }: DiningHallCardProps) {
  // Get current meal time
  const getCurrentMeal = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return { meal: "Breakfast", time: hall.hours.breakfast };
    if (hour >= 11 && hour < 15) return { meal: "Lunch", time: hall.hours.lunch };
    if (hour >= 16 && hour < 22) return { meal: "Dinner", time: hall.hours.dinner };
    return { meal: "Closed", time: "Opens at 7:00 AM" };
  };

  const currentMeal = getCurrentMeal();
  const isOpen = currentMeal.meal !== "Closed";

  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className="group overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={hall.imageUrl}
          alt={hall.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant={isOpen ? "success" : "secondary"}>
            {isOpen ? `Serving ${currentMeal.meal}` : "Closed"}
          </Badge>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-primary-foreground mb-1">
            {hall.shortName}
          </h3>
          <div className="flex items-center gap-1 text-primary-foreground/80 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{hall.location}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {hall.description}
        </p>

        {/* Current Hours */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{currentMeal.time}</span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hall.features.slice(0, 2).map((feature) => (
            <Badge key={feature} variant="maroon">
              {feature}
            </Badge>
          ))}
          {hall.features.length > 2 && (
            <Badge variant="secondary">+{hall.features.length - 2}</Badge>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between text-primary font-semibold group-hover:gap-2 transition-all">
          <span>View Menu</span>
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  );
}
