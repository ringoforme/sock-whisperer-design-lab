
import React from 'react';
import SockPreview from './SockPreview';
import DesignControls from './DesignControls';
import TrendingElements from './TrendingElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SockDesignAreaProps {
  design: {
    type: 'no-show' | 'crew' | 'knee-high';
    baseColor: string;
    patternType: string | null;
    patternColor: string;
    theme: string;
    description: string;
  };
  onTypeChange: (type: 'no-show' | 'crew' | 'knee-high') => void;
  onBaseColorChange: (color: string) => void;
  onPatternChange: (pattern: string | null) => void;
  onElementClick: (element: {
    name: string;
    category: 'color' | 'pattern' | 'theme';
    value: string;
  }) => void;
  onRandomDesign: () => void;
}

const SockDesignArea: React.FC<SockDesignAreaProps> = ({
  design,
  onTypeChange,
  onBaseColorChange,
  onPatternChange,
  onElementClick,
  onRandomDesign
}) => {
  // Generate trending elements based on current design and season
  const getTrendingElements = () => {
    const currentMonth = new Date().getMonth();
    let seasonalElements = [];

    // Halloween elements (September-October)
    if (currentMonth === 8 || currentMonth === 9) {
      seasonalElements = [
        { name: 'Halloween', category: 'theme', value: 'halloween' },
        { name: 'Pumpkins', category: 'pattern', value: 'pumpkins' },
        { name: 'Bats', category: 'pattern', value: 'bats' },
        { name: 'Skulls', category: 'pattern', value: 'skulls' },
        { name: 'Purple', category: 'color', value: '#9b87f5' },
        { name: 'Orange', category: 'color', value: '#FEC6A1' },
      ];
    } 
    // Winter/Christmas elements (November-January)
    else if (currentMonth >= 10 || currentMonth <= 1) {
      seasonalElements = [
        { name: 'Christmas', category: 'theme', value: 'christmas' },
        { name: 'Winter', category: 'theme', value: 'winter' },
        { name: 'Snowflakes', category: 'pattern', value: 'snowflakes' },
        { name: 'Candy Canes', category: 'pattern', value: 'candy-canes' },
        { name: 'Blue', category: 'color', value: '#D3E4FD' },
        { name: 'Red', category: 'color', value: '#FFDEE2' },
      ];
    }
    // Spring elements (February-April) 
    else if (currentMonth >= 2 && currentMonth <= 4) {
      seasonalElements = [
        { name: 'Spring', category: 'theme', value: 'spring' },
        { name: 'Flowers', category: 'pattern', value: 'flowers' },
        { name: 'Hearts', category: 'pattern', value: 'hearts' },
        { name: 'Polka Dots', category: 'pattern', value: 'polka-dots' },
        { name: 'Green', category: 'color', value: '#F2FCE2' },
        { name: 'Peach', category: 'color', value: '#FDE1D3' },
      ];
    }
    // Summer elements (May-August)
    else {
      seasonalElements = [
        { name: 'Summer', category: 'theme', value: 'summer' },
        { name: 'Stars', category: 'pattern', value: 'stars' },
        { name: 'Stripes', category: 'pattern', value: 'stripes' },
        { name: 'Chevron', category: 'pattern', value: 'chevron' },
        { name: 'Yellow', category: 'color', value: '#FEF7CD' },
        { name: 'Pink', category: 'color', value: '#FFDEE2' },
      ];
    }

    // Always include these trending elements
    const commonElements = [
      { name: 'Athletic', category: 'theme', value: 'athletic' },
      { name: 'Casual', category: 'theme', value: 'casual' },
      { name: 'No Pattern', category: 'pattern', value: null },
      { name: 'Plaid', category: 'pattern', value: 'plaid' },
    ];

    return [...seasonalElements, ...commonElements];
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle>Sock Preview</CardTitle>
          <CardDescription>{design.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <SockPreview
            type={design.type}
            baseColor={design.baseColor}
            patternType={design.patternType}
            patternColor={design.patternColor}
          />
        </CardContent>
      </Card>

      <TrendingElements 
        elements={getTrendingElements()}
        onElementClick={onElementClick}
      />

      <DesignControls
        currentType={design.type}
        onTypeChange={onTypeChange}
        onColorChange={onBaseColorChange}
        onPatternChange={onPatternChange}
        onRandomDesign={onRandomDesign}
      />
    </div>
  );
};

export default SockDesignArea;
