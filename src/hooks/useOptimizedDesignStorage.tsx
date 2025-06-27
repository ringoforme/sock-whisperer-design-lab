
import { useState, useCallback, useRef } from 'react';
import { optimizedSessionService, OptimizedDesignLibrary } from '@/services/optimizedSessionService';
import { cacheService } from '@/services/cacheService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OptimizedDesignLibrary {
  all: OptimizedDesignLibrary[];
  drafts: OptimizedDesignLibrary[];
  edited: OptimizedDesignLibrary[];
  vectorized: OptimizedDesignLibrary[];
  downloaded: OptimizedDesignLibrary[];
}

export const useOptimizedDesignStorage = () => {
  const [library, setLibrary] = useState<OptimizedDesignLibrary>({
    all: [],
    drafts: [],
    edited: [],
    vectorized: [],
    downloaded: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((suffix: string) => {
    return user ? cacheService.getUserCacheKey(user.id, suffix) : null;
  }, [user]);

  // Load designs with caching and optimized queries
  const loadDesigns = useCallback(async (useCache = true, offset = 0, limit = 100) => {
    if (!user) {
      setLibrary({ all: [], drafts: [], edited: [], vectorized: [], downloaded: [] });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      setLoading(true);

      const cacheKey = getCacheKey('design_library');
      
      // Try cache first
      if (useCache && cacheKey && offset === 0) {
        const cachedData = await cacheService.get<OptimizedDesignLibrary>(cacheKey);
        if (cachedData) {
          setLibrary(cachedData);
          setLoading(false);
          return;
        }
      }

      console.log('加载设计库数据...');
      
      // Use optimized query
      const libraryData = await optimizedSessionService.getUserDesignLibraryOptimized(limit, offset);
      
      // If this is a paginated load, append to existing data
      if (offset > 0) {
        setLibrary(prev => ({
          all: [...prev.all, ...libraryData.all],
          drafts: [...prev.drafts, ...libraryData.drafts],
          edited: [...prev.edited, ...libraryData.edited],
          vectorized: [...prev.vectorized, ...libraryData.vectorized],
          downloaded: [...prev.downloaded, ...libraryData.downloaded]
        }));
      } else {
        setLibrary(libraryData);
        
        // Cache the result
        if (cacheKey) {
          await cacheService.set(cacheKey, libraryData, { ttl: 3 * 60 * 1000 }); // 3 minutes
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('加载设计库失败:', error);
      setError(error.message || '加载设计库失败');
      toast.error('加载设计库失败');
    } finally {
      setLoading(false);
    }
  }, [user, getCacheKey]);

  // Get single design quickly
  const getDesign = useCallback(async (designId: string): Promise<OptimizedDesignLibrary | null> => {
    try {
      return await optimizedSessionService.getDesignById(designId);
    } catch (error) {
      console.error('获取设计失败:', error);
      return null;
    }
  }, []);

  // Update design status with optimistic updates
  const updateDesignStatus = useCallback(async (
    designId: string,
    updates: { is_edited?: boolean; is_vectorized?: boolean; is_downloaded?: boolean }
  ) => {
    try {
      // Optimistic update - update UI immediately
      setLibrary(prev => {
        const updateDesign = (designs: OptimizedDesignLibrary[]) =>
          designs.map(design => 
            design.id === designId 
              ? { ...design, ...updates }
              : design
          );

        return {
          all: updateDesign(prev.all),
          drafts: updateDesign(prev.drafts),
          edited: updateDesign(prev.edited),
          vectorized: updateDesign(prev.vectorized),
          downloaded: updateDesign(prev.downloaded)
        };
      });

      // Update database
      await optimizedSessionService.updateDesignStatus(designId, updates);
      
      // Invalidate cache
      const cacheKey = getCacheKey('design_library');
      if (cacheKey) {
        cacheService.delete(cacheKey);
      }

      toast.success('状态更新成功');
    } catch (error) {
      console.error('更新设计状态失败:', error);
      toast.error('更新失败，请重试');
      
      // Revert optimistic update by reloading
      loadDesigns(false);
    }
  }, [getCacheKey, loadDesigns]);

  // Refresh data
  const refresh = useCallback(() => {
    const cacheKey = getCacheKey('design_library');
    if (cacheKey) {
      cacheService.delete(cacheKey);
    }
    return loadDesigns(false);
  }, [getCacheKey, loadDesigns]);

  return {
    library,
    loading,
    error,
    loadDesigns,
    getDesign,
    updateDesignStatus,
    refresh
  };
};
