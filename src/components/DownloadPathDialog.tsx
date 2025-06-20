
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Download } from 'lucide-react';
import { downloadService, DownloadPreferences } from '@/services/downloadService';
import { toast } from 'sonner';

interface DownloadPathDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preferences: DownloadPreferences) => void;
  designName: string;
}

const DownloadPathDialog: React.FC<DownloadPathDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  designName
}) => {
  const [preferences, setPreferences] = useState<DownloadPreferences>(() => 
    downloadService.getPreferences()
  );
  const [customPath, setCustomPath] = useState(preferences.defaultPath || '');
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);

  const handleConfirm = () => {
    const finalPreferences: DownloadPreferences = {
      ...preferences,
      defaultPath: preferences.rememberPath ? customPath : undefined
    };
    
    downloadService.savePreferences(finalPreferences);
    onConfirm(finalPreferences);
    onClose();
  };

  const handleBrowse = async () => {
    setIsSelectingFolder(true);
    
    try {
      // 检查是否支持 File System Access API
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setCustomPath(directoryHandle.name);
        toast.success('文件夹选择成功');
      } else {
        // 降级方案：使用输入框提示
        toast.info('您的浏览器不支持文件夹选择器，请手动输入路径');
        const path = prompt('请输入下载路径 (例如: /Users/username/Downloads):');
        if (path) {
          setCustomPath(path);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Directory selection failed:', error);
        toast.error('文件夹选择失败，请手动输入路径');
      }
    } finally {
      setIsSelectingFolder(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>下载设置</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">文件名预览</Label>
            <Input
              id="filename"
              value={downloadService.generateFileName(designName, preferences.fileFormat)}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">文件格式</Label>
            <Select
              value={preferences.fileFormat}
              onValueChange={(value: 'png' | 'jpg') => 
                setPreferences(prev => ({ ...prev, fileFormat: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (推荐)</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">下载路径</Label>
            <div className="flex space-x-2">
              <Input
                id="path"
                placeholder="选择下载路径 (留空使用浏览器默认)"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleBrowse}
                disabled={isSelectingFolder}
              >
                <Folder className={`h-4 w-4 ${isSelectingFolder ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
            {!('showDirectoryPicker' in window) && (
              <p className="text-xs text-amber-600">
                ⚠️ 您的浏览器不支持文件夹选择器，请手动输入路径或使用现代浏览器
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={preferences.rememberPath}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, rememberPath: !!checked }))
              }
            />
            <Label htmlFor="remember" className="text-sm">
              记住此设置，下次直接使用
            </Label>
          </div>

          {preferences.rememberPath && (
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              💡 启用后，下次下载将直接使用这些设置，无需再次选择
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirm}>
            开始下载
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadPathDialog;
