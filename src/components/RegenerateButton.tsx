
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RegenerateButtonProps {
  onRegenerate: () => void;
  isGenerating?: boolean;
  label?: string;
  disabled?: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  onRegenerate,
  isGenerating = false,
  label = "重新生成",
  disabled = false
}) => {
  return (
    <Button
      onClick={onRegenerate}
      disabled={isGenerating || disabled}
      className="bg-sock-purple hover:bg-sock-dark-purple"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
      {isGenerating ? '生成中...' : label}
    </Button>
  );
};

export default RegenerateButton;
