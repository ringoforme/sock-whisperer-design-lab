
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
    { name: '紫色', value: '#9b87f5' },
    { name: '浅紫色', value: '#E5DEFF' },
    { name: '绿色', value: '#F2FCE2' },
    { name: '黄色', value: '#FEF7CD' },
    { name: '橙色', value: '#FEC6A1' },
    { name: '粉色', value: '#FFDEE2' },
    { name: '桃色', value: '#FDE1D3' },
    { name: '蓝色', value: '#D3E4FD' },
    { name: '灰色', value: '#F1F0FB' },
  ];

  const patterns = [
    { name: '无图案', value: null },
    { name: '圆点', value: 'polka-dots' },
    { name: '条纹', value: 'stripes' },
    { name: '人字纹', value: 'chevron' },
    { name: '格子', value: 'plaid' },
    { name: '南瓜', value: 'pumpkins' },
    { name: '骷髅', value: 'skulls' },
    { name: '蝙蝠', value: 'bats' },
    { name: '拐杖糖', value: 'candy-canes' },
    { name: '雪花', value: 'snowflakes' },
    { name: '爱心', value: 'hearts' },
    { name: '星星', value: 'stars' },
    { name: '花朵', value: 'flowers' },
  ];

  return (
    <div className="design-controls mt-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">设计控制</h3>
        <Button onClick={onRandomDesign} variant="outline" className="text-xs">
          随机设计
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">袜子类型</h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={currentType === 'no-show' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'no-show' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('no-show')}
              >
                船袜
              </Button>
              <Button 
                variant={currentType === 'crew' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'crew' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('crew')}
              >
                中筒袜
              </Button>
              <Button 
                variant={currentType === 'knee-high' ? 'default' : 'outline'} 
                size="sm"
                className={`sock-type-button ${currentType === 'knee-high' ? 'active bg-sock-purple hover:bg-sock-dark-purple' : ''}`}
                onClick={() => onTypeChange('knee-high')}
              >
                长筒袜
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="mb-2 w-full">
          <TabsTrigger value="colors" className="flex-1">颜色</TabsTrigger>
          <TabsTrigger value="patterns" className="flex-1">图案</TabsTrigger>
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
