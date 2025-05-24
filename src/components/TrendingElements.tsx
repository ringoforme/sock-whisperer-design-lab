
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendingElement {
  name: string;
  category: 'color' | 'pattern' | 'theme';
  value: string;
}

interface TrendingElementsProps {
  elements: TrendingElement[];
  onElementClick: (element: TrendingElement) => void;
}

const TrendingElements: React.FC<TrendingElementsProps> = ({ 
  elements, 
  onElementClick 
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'color':
        return 'bg-sock-soft-blue text-blue-800';
      case 'pattern':
        return 'bg-sock-soft-green text-green-800';
      case 'theme':
        return 'bg-sock-soft-orange text-orange-800';
      default:
        return 'bg-sock-soft-purple text-purple-800';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium">热门元素</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {elements.map((element, index) => (
            <Badge 
              key={`${element.name}-${index}`}
              variant="outline"
              className={`trending-element cursor-pointer hover:bg-opacity-80 ${getCategoryColor(element.category)}`}
              onClick={() => onElementClick(element)}
            >
              {element.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingElements;
