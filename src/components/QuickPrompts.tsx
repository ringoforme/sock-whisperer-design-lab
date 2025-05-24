
import React from 'react';
import { Button } from '@/components/ui/button';
import { quickPrompts } from '@/data/designExamples';

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {quickPrompts.map((prompt) => (
        <Button
          key={prompt.id}
          variant="outline"
          className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-sock-purple transition-all duration-200"
          onClick={() => onPromptClick(prompt.prompt)}
        >
          {prompt.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickPrompts;
