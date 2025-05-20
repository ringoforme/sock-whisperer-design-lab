
import React from 'react';
import ChatWindow from '@/components/ChatWindow';
import SockDesignArea from '@/components/SockDesignArea';
import { useSockDesign } from '@/hooks/useSockDesign';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const {
    design,
    updateType,
    updateBaseColor,
    updatePattern,
    updatePatternColor,
    updateTheme,
    updateFromChatMessage,
    generateRandomDesign
  } = useSockDesign();

  const handleSendMessage = (message: string) => {
    updateFromChatMessage(message);
  };

  const handleElementClick = (element: {
    name: string;
    category: 'color' | 'pattern' | 'theme';
    value: string;
  }) => {
    switch (element.category) {
      case 'color':
        updateBaseColor(element.value);
        break;
      case 'pattern':
        updatePattern(element.value);
        break;
      case 'theme':
        updateTheme(element.value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold text-sock-purple text-center">Sock Whisperer Design Lab</h1>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <div className="h-[70vh] md:h-[80vh]">
            <ChatWindow onSendMessage={handleSendMessage} />
          </div>
          
          <div className="h-[70vh] md:h-[80vh] overflow-y-auto">
            <SockDesignArea 
              design={design}
              onTypeChange={updateType}
              onBaseColorChange={updateBaseColor}
              onPatternChange={updatePattern}
              onElementClick={handleElementClick}
              onRandomDesign={generateRandomDesign}
            />
          </div>
        </div>
      </main>

      <footer className="border-t mt-8 py-6 text-center text-sm text-gray-500">
        <p>© 2025 Sock Whisperer Design Lab. All rights reserved.</p>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
