import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';

export interface CanvasAreaRef {
  clearMask: () => void;
  getMaskData: () => string | null;
  hasMaskContent: () => boolean;
}

interface CanvasAreaProps {
  imageUrl: string;
  brushSize: number[];
  isEraser: boolean;
  showMask: boolean;
  imageLoaded: boolean;
  setImageLoaded: (value: boolean) => void;
  isDrawing: boolean;
  setIsDrawing: (value: boolean) => void;
  onMaskUpdate?: () => void;
}

const CanvasArea = forwardRef<CanvasAreaRef, CanvasAreaProps>(({
  imageUrl,
  brushSize,
  isEraser,
  showMask,
  imageLoaded,
  setImageLoaded,
  isDrawing,
  setIsDrawing,
  onMaskUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawOnCanvas = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize[0] / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    onMaskUpdate?.();
  }, [brushSize, isEraser, onMaskUpdate]);

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
  }, [imageLoaded, drawOnCanvas, setIsDrawing]);

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
  }, [setIsDrawing]);

  const clearMask = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onMaskUpdate?.();
  }, [onMaskUpdate]);

  const getMaskData = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return null;
    return maskCanvas.toDataURL('image/png');
  }, []);

  const hasMaskContent = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return false;
    
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return false;
    
    const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    return imageData.data.some((value, index) => index % 4 === 3 && value > 0);
  }, []);

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
      maskCtx.fillStyle = 'rgba(255, 255, 255, 255)';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('图片加载失败');
    };
    img.src = imageUrl;
  }, [imageUrl, setImageLoaded]);

  // Expose methods for parent component
  useImperativeHandle(ref, () => ({
    clearMask,
    getMaskData,
    hasMaskContent
  }));

  return (
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
  );
});

export default CanvasArea;