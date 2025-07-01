import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Brush, Eraser, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface BrushToolbarProps {
  isEraser: boolean;
  setIsEraser: (value: boolean) => void;
  brushSize: number[];
  setBrushSize: (value: number[]) => void;
  clearMask: () => void;
  showMask: boolean;
  setShowMask: (value: boolean) => void;
}

const BrushToolbar: React.FC<BrushToolbarProps> = ({
  isEraser,
  setIsEraser,
  brushSize,
  setBrushSize,
  clearMask,
  showMask,
  setShowMask
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant={!isEraser ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEraser(false)}
        >
          <Brush className="h-4 w-4 mr-2" />
          笔刷
        </Button>
        <Button
          variant={isEraser ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEraser(true)}
        >
          <Eraser className="h-4 w-4 mr-2" />
          擦除
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-2 w-full sm:w-[240px] min-w-[120px]">
        <span className="text-sm whitespace-nowrap">大小:</span>
        <Slider
          value={brushSize}
          onValueChange={setBrushSize}
          max={50}
          min={5}
          step={1}
          className="flex-1 min-w-[120px] sm:min-w-[180px]"
        />
        <span className="text-sm w-8 text-center">{brushSize[0]}</span>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button variant="outline" size="sm" onClick={clearMask}>
        <RotateCcw className="h-4 w-4 mr-2" />
        清除
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMask(!showMask)}
      >
        {showMask ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        {showMask ? '隐藏遮罩' : '显示遮罩'}
      </Button>
    </div>
  );
};

export default BrushToolbar;