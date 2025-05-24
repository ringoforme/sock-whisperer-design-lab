
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
        { name: '万圣节', category: 'theme', value: 'halloween' },
        { name: '南瓜', category: 'pattern', value: 'pumpkins' },
        { name: '蝙蝠', category: 'pattern', value: 'bats' },
        { name: '骷髅', category: 'pattern', value: 'skulls' },
        { name: '紫色', category: 'color', value: '#9b87f5' },
        { name: '橙色', category: 'color', value: '#FEC6A1' },
      ];
    } 
    // Winter/Christmas elements (November-January)
    else if (currentMonth >= 10 || currentMonth <= 1) {
      seasonalElements = [
        { name: '圣诞节', category: 'theme', value: 'christmas' },
        { name: '冬季', category: 'theme', value: 'winter' },
        { name: '雪花', category: 'pattern', value: 'snowflakes' },
        { name: '拐杖糖', category: 'pattern', value: 'candy-canes' },
        { name: '蓝色', category: 'color', value: '#D3E4FD' },
        { name: '红色', category: 'color', value: '#FFDEE2' },
      ];
    }
    // Spring elements (February-April) 
    else if (currentMonth >= 2 && currentMonth <= 4) {
      seasonalElements = [
        { name: '春季', category: 'theme', value: 'spring' },
        { name: '花朵', category: 'pattern', value: 'flowers' },
        { name: '爱心', category: 'pattern', value: 'hearts' },
        { name: '圆点', category: 'pattern', value: 'polka-dots' },
        { name: '绿色', category: 'color', value: '#F2FCE2' },
        { name: '桃色', category: 'color', value: '#FDE1D3' },
      ];
    }
    // Summer elements (May-August)
    else {
      seasonalElements = [
        { name: '夏季', category: 'theme', value: 'summer' },
        { name: '星星', category: 'pattern', value: 'stars' },
        { name: '条纹', category: 'pattern', value: 'stripes' },
        { name: '人字纹', category: 'pattern', value: 'chevron' },
        { name: '黄色', category: 'color', value: '#FEF7CD' },
        { name: '粉色', category: 'color', value: '#FFDEE2' },
      ];
    }

    // Always include these trending elements
    const commonElements = [
      { name: '运动风', category: 'theme', value: 'athletic' },
      { name: '休闲风', category: 'theme', value: 'casual' },
      { name: '无图案', category: 'pattern', value: null },
      { name: '格子', category: 'pattern', value: 'plaid' },
    ];

    return [...seasonalElements, ...commonElements];
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle>袜子预览</CardTitle>
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
