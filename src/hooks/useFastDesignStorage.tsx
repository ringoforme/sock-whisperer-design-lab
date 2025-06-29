
import { useState, useCallback, useRef, useEffect } from 'react';
import { fastDesignService, type FastDesignLibrary, type FastDesignItem } from '@/services/fastDesignService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Fast cache service for immediate responses
class FastCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 2 * 60 * 1000; // 2 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

const fastCache = new FastCache();

export const useFastDesignStorage = () => {
  const [library, setLibrary] = useState<FastDesignLibrary>({
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

  // Fast load with immediate cache response
  const loadDesigns = useCallback(async (useCache = true) => {
    if (!user) {
      setLibrary({ all: [], drafts: [], edited: [], vectorized: [], downloaded: [] });
      return;
    }

    const cacheKey = `design_library_${user.id}`;
    
    // Return cached data immediately if available
    if (useCache) {
      const cached = fastCache.get(cacheKey);
      if (cached) {
        console.log('Using cached design library');
        setLibrary(cached);
        return cached;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      setLoading(true);

      console.log('Loading fresh design library...');
      const libraryData = await fastDesignService.getFastDesignLibrary();
      
      setLibrary(libraryData);
      fastCache.set(cacheKey, libraryData);

      return libraryData;
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      console.error('加载设计库失败:', error);
      setError(error.message || '加载设计库失败');
      toast.error('加载设计库失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Optimistic update with immediate UI response
  const updateDesignStatus = useCallback(async (
    designId: string,
    updates: { is_edited?: boolean; is_vectorized?: boolean; is_downloaded?: boolean }
  ) => {
    try {
      // Immediate optimistic update
      setLibrary(prev => {
        const updateDesign = (designs: FastDesignItem[]) =>
          designs.map(design => {
            if (design.id === designId) {
              const updated = { ...design, ...updates };
              // Recalculate category
              if (updates.is_downloaded) updated.category = 'downloaded';
              else if (updates.is_vectorized) updated.category = 'vectorized';
              else if (updates.is_edited) updated.category = 'edited';
              else updated.category = 'drafts';
              return updated;
            }
            return design;
          });

        const newLibrary = {
          all: updateDesign(prev.all),
          drafts: updateDesign(prev.drafts).filter(d => d.category === 'drafts'),
          edited: updateDesign(prev.edited).filter(d => d.category === 'edited'),
          vectorized: updateDesign(prev.vectorized).filter(d => d.category === 'vectorized'),
          downloaded: updateDesign(prev.downloaded).filter(d => d.category === 'downloaded')
        };

        // Update cache immediately
        if (user) {
          fastCache.set(`design_library_${user.id}`, newLibrary);
        }

        return newLibrary;
      });

      // Background database update
      await fastDesignService.updateDesignStatus(designId, updates);
      toast.success('状态更新成功');
    } catch (error) {
      console.error('更新设计状态失败:', error);
      toast.error('更新失败，正在重新加载...');
      
      // Revert by reloading
      loadDesigns(false);
    }
  }, [user, loadDesigns]);

  // Delete design with optimistic update
  const deleteDesign = useCallback(async (designId: string) => {
    try {
      // Immediate optimistic update - remove from UI
      setLibrary(prev => {
        const removeDesign = (designs: FastDesignItem[]) =>
          designs.filter(design => design.id !== designId);

        const newLibrary = {
          all: removeDesign(prev.all),
          drafts: removeDesign(prev.drafts),
          edited: removeDesign(prev.edited),
          vectorized: removeDesign(prev.vectorized),
          downloaded: removeDesign(prev.downloaded)
        };

        // Update cache immediately
        if (user) {
          fastCache.set(`design_library_${user.id}`, newLibrary);
        }

        return newLibrary;
      });

      // Background database update
      await fastDesignService.hideDesignFromUser(designId);
      toast.success('设计已从您的库中移除');
    } catch (error) {
      console.error('删除设计失败:', error);
      toast.error('删除失败，正在重新加载...');
      
      // Revert by reloading
      loadDesigns(false);
    }
  }, [user, loadDesigns]);

  // Fast refresh
  const refresh = useCallback(() => {
    console.log('Refreshing design library');
    if (user) {
      fastCache.delete(`design_library_${user.id}`);
    }
    return loadDesigns(false);
  }, [user, loadDesigns]);

  // Get single design
  const getDesign = useCallback(async (designId: string): Promise<FastDesignItem | null> => {
    try {
      return await fastDesignService.getDesignById(designId);
    } catch (error) {
      console.error('获取设计失败:', error);
      return null;
    }
  }, []);

  // Auto-load on user change
  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user?.id, loadDesigns]);

  return {
    library,
    loading,
    error,
    loadDesigns,
    getDesign,
    updateDesignStatus,
    deleteDesign,
    refresh
  };
};
