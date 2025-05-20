
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

const CustomizedDesign = () => {
  const navigate = useNavigate();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const patterns = [
    { id: 'stripes', name: 'Stripes' },
    { id: 'animals', name: 'Animals' },
    { id: 'geometric', name: 'Geometric' },
    { id: 'dots', name: 'Polka Dots' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'floral', name: 'Floral' }
  ];

  const colors = [
    { id: 'purple', name: 'Purple', value: '#9b87f5' },
    { id: 'blue', name: 'Blue', value: '#D3E4FD' },
    { id: 'green', name: 'Green', value: '#F2FCE2' },
    { id: 'yellow', name: 'Yellow', value: '#FEF7CD' },
    { id: 'orange', name: 'Orange', value: '#FEC6A1' },
    { id: 'pink', name: 'Pink', value: '#FFDEE2' },
    { id: 'peach', name: 'Peach', value: '#FDE1D3' },
    { id: 'gray', name: 'Gray', value: '#F1F0FB' }
  ];

  const [trendingElements, setTrendingElements] = useState([
    'Summer vibes', 'Retro design', 'Adventure', 'Cozy & warm',
    'Minimalist', 'Bold colors', 'Nature', 'Urban style'
  ]);

  const refreshTrendingElements = () => {
    // In a real app, you'd fetch new trending elements from the server
    const newElements = [
      'Beach day', 'Mountain life', 'City nights', 'Classic patterns',
      'Modern art', 'Sports theme', 'Weekend style', 'Business casual'
    ];
    setTrendingElements(newElements);
  };

  const toggleElement = (element: string) => {
    if (selectedElements.includes(element)) {
      setSelectedElements(selectedElements.filter(e => e !== element));
    } else {
      setSelectedElements([...selectedElements, element]);
    }
  };

  const handleSubmit = () => {
    // In a real app, you'd pass these preferences to the design generation page
    console.log('Submitting preferences:', {
      pattern: selectedPattern,
      color: selectedColor,
      elements: selectedElements
    });
    
    navigate('/design');
  };

  const isSubmitDisabled = !selectedPattern || !selectedColor;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sock-purple">SoxLab Customizer</h1>
          <nav className="flex items-center space-x-4">
            <Link to="/drafts" className="text-gray-700 hover:text-sock-purple transition-colors">
              Drafts
            </Link>
            <Link to="/profile" className="ml-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Customize Your Sock Design</CardTitle>
            <CardDescription>
              Select your preferences to create personalized sock designs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pattern" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="pattern">Pattern Type</TabsTrigger>
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="elements">Trending Elements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pattern" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {patterns.map(pattern => (
                    <div
                      key={pattern.id}
                      className={`
                        border rounded-lg p-4 text-center cursor-pointer transition-all
                        ${selectedPattern === pattern.id 
                          ? 'border-sock-purple bg-sock-purple bg-opacity-10 shadow-md transform -translate-y-1' 
                          : 'hover:border-sock-purple hover:shadow-sm'}
                      `}
                      onClick={() => setSelectedPattern(pattern.id)}
                    >
                      <div className="h-24 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                        <span className="text-gray-400">{pattern.name}</span>
                      </div>
                      <p className="font-medium">{pattern.name}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="color" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {colors.map(color => (
                    <div
                      key={color.id}
                      className={`
                        border rounded-lg p-4 text-center cursor-pointer transition-all
                        ${selectedColor === color.id 
                          ? 'border-sock-purple shadow-md transform -translate-y-1' 
                          : 'hover:border-sock-purple hover:shadow-sm'}
                      `}
                      onClick={() => setSelectedColor(color.id)}
                    >
                      <div 
                        className="h-24 rounded-md mb-2" 
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <p className="font-medium">{color.name}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="elements" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Popular Elements</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshTrendingElements}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {trendingElements.map(element => (
                    <Button
                      key={element}
                      variant={selectedElements.includes(element) ? "default" : "outline"}
                      size="sm"
                      className={selectedElements.includes(element) ? "bg-sock-purple hover:bg-sock-dark-purple" : ""}
                      onClick={() => toggleElement(element)}
                    >
                      {element}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled}
            className="bg-sock-purple hover:bg-sock-dark-purple"
          >
            Create My Design
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CustomizedDesign;
