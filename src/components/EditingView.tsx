
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, File } from 'lucide-react';
import { DesignData } from '@/types/design';

interface EditingViewProps {
  design: DesignData;
  onExitEdit: () => void;
  onDownload: () => void;
  onVectorize: () => void;
}

const EditingView: React.FC<EditingViewProps> = ({
  design,
  onExitEdit,
  onDownload,
  onVectorize
}) => {
  return (
    <div className="h-[80vh] flex flex-col animate-fade-in">
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onExitEdit}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>编辑模式</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" size="sm" onClick={onVectorize}>
                <File className="h-4 w-4 mr-2" />
                矢量化
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full">
            <img 
              src={design.url} 
              alt={design.design_name} 
              className="w-full h-auto rounded-lg shadow-lg border transition-transform hover:scale-105"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditingView;
