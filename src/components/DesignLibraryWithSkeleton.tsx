
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, File, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { Design } from '@/types/design';

interface DesignLibraryWithSkeletonProps {
  designs: Design[];
  title: string;
  loading?: boolean;
  error?: string | null;
  onEdit?: (design: Design) => void;
  onDownload?: (design: Design) => void;
  onVectorize?: (design: Design) => void;
  onImageClick?: (design: Design) => void;
  onRefresh?: () => void;
}

const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <CardHeader className="p-4">
      <Skeleton className="h-5 w-3/4" />
    </CardHeader>
    <CardContent className="p-0">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 pt-2 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
    <CardFooter className="p-4 pt-0 justify-between">
      <Skeleton className="h-9 w-16" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </CardFooter>
  </Card>
);

const DesignLibraryWithSkeleton: React.FC<DesignLibraryWithSkeletonProps> = ({
  designs,
  title,
  loading = false,
  error = null,
  onEdit,
  onDownload,
  onVectorize,
  onImageClick,
  onRefresh
}) => {
  if (loading && designs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sock-purple"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">加载失败: {error}</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                重新加载
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {title} {loading && <span className="text-sm text-gray-500">(更新中...)</span>}
        </h3>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        )}
      </div>
      
      {designs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无设计
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <CardTitle className="text-base truncate">{design.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gray-100">
                  <img 
                    src={design.imageUrl} 
                    alt={design.title}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onImageClick?.(design)}
                    loading="lazy"
                    onError={(e) => {
                      console.error('图片加载失败:', design.imageUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                  {design.originalPrompt && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {design.originalPrompt}
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

export default DesignLibraryWithSkeleton;
