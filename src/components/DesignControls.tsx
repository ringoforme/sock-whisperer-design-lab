
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface DesignControlsProps {
  currentType: 'no-show' | 'crew' | 'knee-high';
  onTypeChange: (type: 'no-show' | 'crew' | 'knee-high') => void;
  onColorChange: (color: string) => void;
  onPatternChange: (pattern: string | null) => void;
  onRandomDesign: () => void;
}

const DesignControls: React.FC<DesignControlsProps> = ({
  currentType,
  onTypeChange,
  onColorChange,
  onPatternChange,
  onRandomDesign
}) => {
  const colors = [
    { name: 'Purple', value: '#9b87f5' },
    { name: 'Light Purple', value: '#E5DEFF' },
    { name: 'Green', value: '#F2FCE2' },
    { name: 'Yellow', value: '#FEF7CD' },
    { name: 'Orange', value: '#FEC6A1' },
    { name: 'Pink', value: '#FFDEE2' },
    { name: 'Peach', value: '#FDE1D3' },
    { name: 'Blue', value: '#D3E4FD' },
    { name: 'Gray', value: '#F1F0FB' },
  ];

  const patterns = [
    { name: 'None', value: null },
    { name: 'Polka Dots', value: 'polka-dots' },
    { name: 'Stripes', value: 'stripes' },
    { name: 'Chevron', value: 'chevron' },
    { name: 'Plaid', value: 'plaid' },
    { name: 'Pumpkins', value: 'pumpkins' },
    { name: 'Skulls', value: 'skulls' },
    { name: 'Bats', value: 'bats' },
    { name: 'Candy Canes', value: 'candy-canes' },
    { name: 'Snowflakes', value: 'snowflakes' },
    { name: 'Hearts', value: 'hearts' },
    { name: 'Stars', value: 'stars' },
    { name: 'Flowers', value: 'flowers' },
  ];

  return (
    <div className="design-controls mt-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Design Controls</h3>
        <Button onClick={onRandomDesign} variant="outline" className="text-xs">
          Random Design
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">Sock Type</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={currentType === 'no-show' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'no-show' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('no-show')}
              >
                No-Show
              </Button>
              <Button 
                variant={currentType === 'crew' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'crew' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('crew')}
              >
                Crew
              </Button>
              <Button 
                variant={currentType === 'knee-high' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'knee-high' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('knee-high')}
              >
                Knee-High
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="mb-2 w-full">
          <TabsTrigger value="colors" className="flex-1">Colors</TabsTrigger>
          <TabsTrigger value="patterns" className="flex-1">Patterns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <div 
                key={color.value}
                className="rounded-md p-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onColorChange(color.value)}
              >
                <div 
                  className="w-full h-8 rounded-md border mb-1" 
                  style={{ backgroundColor: color.value }}
                ></div>
                <p className="text-xs text-center">{color.name}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-4">
          <RadioGroup className="grid grid-cols-2 gap-2">
            {patterns.map((pattern) => (
              <div key={pattern.name} className="flex items-center space-x-2">
                <RadioGroupItem 
                  id={pattern.name} 
                  value={pattern.name}
                  onClick={() => onPatternChange(pattern.value)} 
                />
                <Label htmlFor={pattern.name} className="cursor-pointer">
                  {pattern.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignControls;
