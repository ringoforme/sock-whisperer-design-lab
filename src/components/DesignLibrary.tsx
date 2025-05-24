
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, File, Edit } from 'lucide-react';
import { Design } from '@/types/design';

interface DesignLibraryProps {
  designs: Design[];
  title: string;
  onEdit?: (design: Design) => void;
  onDownload?: (design: Design) => void;
  onVectorize?: (design: Design) => void;
}

const DesignLibrary: React.FC<DesignLibraryProps> = ({
  designs,
  title,
  onEdit,
  onDownload,
  onVectorize
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {designs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无设计
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-base">{design.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img 
                    src={design.imageUrl} 
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    创建时间: {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                  {design.originalPrompt && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      提示词: {design.originalPrompt}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 justify-between">
                <Button 
                  variant="outline"
                  onClick={() => onEdit?.(design)}
                  className="text-sock-purple border-sock-purple hover:bg-sock-light-purple"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onDownload?.(design)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onVectorize?.(design)}>
                    <File className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignLibrary;
