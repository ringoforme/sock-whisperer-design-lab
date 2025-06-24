
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { DesignData } from '@/types/design';
import DesignImageDisplay from './DesignImageDisplay';

interface EditingViewProps {
  design: DesignData;
  onExitEdit: () => void;
  onDownload: () => void;
  onVectorize: () => void;
  onImageClick?: () => void;
}

const EditingView: React.FC<EditingViewProps> = ({
  design,
  onExitEdit,
  onDownload,
  onVectorize,
  onImageClick
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
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <DesignImageDisplay
            imageUrl={design.url}
            designName={design.design_name}
            showEditButton={false}
            onImageClick={onImageClick}
            onDownload={onDownload}
            onVectorize={onVectorize}
            className="w-full max-w-lg"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditingView;
