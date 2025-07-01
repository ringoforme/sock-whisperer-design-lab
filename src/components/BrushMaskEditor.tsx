import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Brush, Eraser, RotateCcw, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState([20]);
  const [isEraser, setIsEraser] = useState(false);
  const [showMask, setShowMask] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const drawOnCanvas = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, brushSize[0] / 2, 0, 2 * Math.PI);
    ctx.fill();
  }, [brushSize, isEraser]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    console.log('Mouse down event triggered');
    setIsDrawing(true);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    console.log('Drawing at coordinates:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });
    drawOnCanvas(x, y, canvas);
  }, [imageLoaded, drawOnCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !imageLoaded) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    drawOnCanvas(x, y, canvas);
  }, [isDrawing, imageLoaded, drawOnCanvas]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearMask = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleEdit = useCallback(() => {
    if (!editPrompt.trim()) {
      toast.error('请输入编辑指令');
      return;
    }

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    // Check if mask has any content
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const hasContent = imageData.data.some((value, index) => index % 4 === 3 && value > 0);
    
    if (!hasContent) {
      toast.error('请先绘制遮罩区域');
      return;
    }

    const maskData = maskCanvas.toDataURL('image/png');
    onEdit(maskData, editPrompt);
  }, [editPrompt, onEdit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;

      // Draw image on main canvas
      ctx.drawImage(img, 0, 0);
      
      // Set up mask canvas
      maskCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('图片加载失败');
    };
    img.src = imageUrl;
  }, [imageUrl]);

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

        {/* Canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-checkered min-h-[400px] flex items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">加载图片中...</p>
              </div>
            </div>
          )}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="block max-w-full max-h-[400px] object-contain"
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            <canvas
              ref={maskCanvasRef}
              className={`absolute top-0 left-0 cursor-crosshair ${
                showMask ? 'opacity-50' : 'opacity-0'
              }`}
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                backgroundColor: showMask ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                pointerEvents: imageLoaded ? 'auto' : 'none',
                width: '100%',
                height: '100%'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>

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