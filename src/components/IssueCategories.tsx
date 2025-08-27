import { Card, CardContent } from "@/components/ui/card";
import { 
  Construction, 
  Droplets, 
  Lightbulb, 
  Palette, 
  TreePine, 
  Trash2,
  AlertTriangle,
  Car
} from "lucide-react";

const categories = [
  {
    id: "pothole",
    name: "Potholes & Roads",
    icon: Construction,
    description: "Road damage, potholes, broken sidewalks",
    color: "bg-orange-500"
  },
  {
    id: "water",
    name: "Water Issues",
    icon: Droplets,
    description: "Water leaks, flooding, drainage problems",
    color: "bg-blue-500"
  },
  {
    id: "lighting",
    name: "Street Lighting",
    icon: Lightbulb,
    description: "Broken streetlights, dark areas",
    color: "bg-yellow-500"
  },
  {
    id: "graffiti",
    name: "Graffiti & Vandalism",
    icon: Palette,
    description: "Graffiti, property damage, vandalism",
    color: "bg-purple-500"
  },
  {
    id: "vegetation",
    name: "Parks & Trees",
    icon: TreePine,
    description: "Fallen trees, park maintenance, vegetation",
    color: "bg-green-500"
  },
  {
    id: "waste",
    name: "Waste & Dumping",
    icon: Trash2,
    description: "Illegal dumping, overflowing bins",
    color: "bg-red-500"
  },
  {
    id: "safety",
    name: "Public Safety",
    icon: AlertTriangle,
    description: "Safety hazards, dangerous areas",
    color: "bg-amber-500"
  },
  {
    id: "traffic",
    name: "Traffic & Parking",
    icon: Car,
    description: "Traffic signals, parking violations",
    color: "bg-indigo-500"
  }
];

interface IssueCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

const IssueCategories = ({ onCategorySelect, selectedCategory }: IssueCategoriesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-card-civic hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-primary shadow-civic' : ''
            }`}
            onClick={() => onCategorySelect?.(category.id)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IssueCategories;