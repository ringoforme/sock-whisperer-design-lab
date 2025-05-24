
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designExamples, DesignExample } from '@/data/designExamples';

interface DesignExamplesProps {
  onExampleClick: (example: DesignExample) => void;
}

const DesignExamples: React.FC<DesignExamplesProps> = ({ onExampleClick }) => {
  const getStyleColor = (style: string) => {
    switch (style) {
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-gray-100 text-gray-800';
      case 'sport': return 'bg-green-100 text-green-800';
      case 'festive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">优秀设计样例</h2>
          <p className="text-xl text-gray-600">
            从这些精选设计中获得灵感，点击任意样例开始编辑
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designExamples.map((example) => (
            <Card 
              key={example.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              onClick={() => onExampleClick(example)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={example.imageUrl} 
                  alt={example.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getStyleColor(example.style)}>
                    {example.style === 'casual' && '休闲'}
                    {example.style === 'business' && '商务'}
                    {example.style === 'sport' && '运动'}
                    {example.style === 'festive' && '节日'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{example.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{example.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {example.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-sock-purple hover:bg-sock-dark-purple"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExampleClick(example);
                  }}
                >
                  编辑此设计
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignExamples;
