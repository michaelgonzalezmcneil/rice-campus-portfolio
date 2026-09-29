import { BookOpen, Coffee, Compass, Dumbbell, GraduationCap, Library, Utensils } from "lucide-react";
export const locations = [
  { id: "first-class", name: "My first class", detail: "O’Connor Building", icon: GraduationCap },
  { id: "breakfast", name: "Breakfast", detail: "West Servery", icon: Utensils },
  { id: "coffee", name: "Coffee", detail: "Brochstein Pavilion", icon: Coffee },
  { id: "library", name: "Library", detail: "Fondren Library", icon: Library },
  { id: "recreation-center", name: "Recreation Center", detail: "Gibbs Recreation Center", icon: Dumbbell },
  { id: "academic-quad", name: "Academic Quad", detail: "Lovett Hall", icon: BookOpen },
  { id: "explore", name: "Explore campus", detail: "Surprise me", icon: Compass },
] as const;
