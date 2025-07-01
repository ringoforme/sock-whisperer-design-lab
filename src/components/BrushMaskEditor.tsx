import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import BrushToolbar from './BrushToolbar';
import CanvasArea, { CanvasAreaRef } from './CanvasArea';

interface BrushMaskEditorProps {
  imageUrl: string;
  onEdit: (maskData: string, prompt: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const BrushMaskEditor: React.FC<BrushMaskEditorProps> = ({
  imageUrl,
  onEdit,
  onClose,
  isLoading = false
}) => {
  const canvasAreaRef = useRef<CanvasAreaRef>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState([20]);
  const [isEraser, setIsEraser] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClearMask = () => {
    canvasAreaRef.current?.clearMask();
  };

  const handleEdit = () => {
    if (!editPrompt.trim()) {
      toast.error('请输入编辑指令');
      return;
    }

    if (!canvasAreaRef.current?.hasMaskContent()) {
      toast.error('请先绘制遮罩区域');
      return;
    }

    const maskData = canvasAreaRef.current?.getMaskData();
    if (maskData) {
      onEdit(maskData, editPrompt);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>笔刷遮罩编辑</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tools */}
        <BrushToolbar
          isEraser={isEraser}
          setIsEraser={setIsEraser}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          clearMask={handleClearMask}
          showMask={showMask}
          setShowMask={setShowMask}
        />

        {/* Canvas */}
        <CanvasArea
          ref={canvasAreaRef}
          imageUrl={imageUrl}
          brushSize={brushSize}
          isEraser={isEraser}
          showMask={showMask}
          imageLoaded={imageLoaded}
          setImageLoaded={setImageLoaded}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
        />

        {/* Edit Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">编辑指令</label>
          <Textarea
            placeholder="描述您想要对选中区域进行的修改..."
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={handleEdit} 
            disabled={isLoading || !imageLoaded}
          >
            {isLoading ? '处理中...' : '应用编辑'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrushMaskEditor;