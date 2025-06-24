
import { useState, useEffect, useCallback } from 'react';
import { Design, DesignLibrary } from '@/types/design';
import { sessionService, GeneratedImage } from '@/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';

// Convert GeneratedImage to Design format
const convertImageToDesign = (image: GeneratedImage): Design => ({
  id: image.id,
  imageUrl: image.image_url,
  title: image.design_name,
  createdAt: image.created_at || new Date().toISOString(),
  type: image.is_edited ? 'edited' : 'draft',
  originalPrompt: undefined // We don't have this info in GeneratedImage
});

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'design_library_cache';

interface CacheData {
  data: DesignLibrary;
  timestamp: number;
  userId: string;
}

export const useDesignStorage = () => {
  const [library, setLibrary] = useState<DesignLibrary>({
    edited: [],
    drafts: [],
    vectorized: [],
    downloaded: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user, loading: authLoading } = useAuth();

  // Cache utilities
  const getCachedData = useCallback((userId: string): DesignLibrary | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is valid and for the same user
      if (cacheData.userId === userId && (now - cacheData.timestamp) < CACHE_DURATION) {
        console.log('使用缓存的设计库数据');
        return cacheData.data;
      }
      
      // Clear expired cache
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('读取缓存失败:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedData = useCallback((data: DesignLibrary, userId: string) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('设计库数据已缓存');
    } catch (error) {
      console.error('缓存数据失败:', error);
    }
  }, []);

  // Optimized load designs with retry and caching
  const loadDesigns = useCallback(async (useCache = true) => {
    if (authLoading || !user) {
      console.log('用户未认证或认证加载中，跳过加载设计库');
      setLibrary({
        edited: [],
        drafts: [],
        vectorized: [],
        downloaded: []
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('开始加载用户设计库，用户ID:', user.id);

      // Try to use cached data first
      if (useCache) {
        const cachedData = getCachedData(user.id);
        if (cachedData) {
          setLibrary(cachedData);
          setLoading(false);
          return;
        }
      }

      setLoading(true);

      // Load data with timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), 30000); // 30 second timeout
      });

      // Use Promise.allSettled to handle partial failures gracefully
      const loadPromise = Promise.allSettled([
        sessionService.getUserDesigns(),
        sessionService.getUserEditedDesigns(),
        sessionService.getUserVectorizedDesigns(),
        sessionService.getUserDownloadedDesigns()
      ]);

      const results = await Promise.race([loadPromise, timeoutPromise]) as PromiseSettledResult<GeneratedImage[]>[];

      // Process results with error handling
      const drafts = results[0].status === 'fulfilled' ? results[0].value : [];
      const edited = results[1].status === 'fulfilled' ? results[1].value : [];
      const vectorized = results[2].status === 'fulfilled' ? results[2].value : [];
      const downloaded = results[3].status === 'fulfilled' ? results[3].value : [];

      // Log any failed requests
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const categories = ['drafts', 'edited', 'vectorized', 'downloaded'];
          console.error(`加载 ${categories[index]} 失败:`, result.reason);
        }
      });

      console.log('设计库数据:', {
        drafts: drafts.length,
        edited: edited.length,
        vectorized: vectorized.length,
        downloaded: downloaded.length
      });

      const libraryData = {
        drafts: drafts.map(convertImageToDesign),
        edited: edited.map(convertImageToDesign),
        vectorized: vectorized.map(convertImageToDesign),
        downloaded: downloaded.map(convertImageToDesign)
      };

      setLibrary(libraryData);
      
      // Cache the successful result
      setCachedData(libraryData, user.id);
      
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('加载设计库失败:', error);
      setError(error.message || '加载设计库失败');
      
      // Implement retry logic for temporary failures
      if (retryCount < 2 && (error.message?.includes('timeout') || error.code === '57014')) {
        console.log(`尝试重新加载设计库 (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadDesigns(false), 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, getCachedData, setCachedData, retryCount]);

  // Load designs when user changes or on mount
  useEffect(() => {
    loadDesigns();
  }, [user?.id]); // Only depend on user ID to avoid infinite loops

  // Mark design as edited
  const markAsEdited = async (designId: string) => {
    try {
      await sessionService.updateImageEditedStatus(designId, true);
      await loadDesigns(false); // Refresh without using cache
    } catch (error) {
      console.error('标记为已编辑失败:', error);
      throw error;
    }
  };

  // Mark design as vectorized
  const markAsVectorized = async (designId: string) => {
    try {
      await sessionService.updateImageVectorizedStatus(designId, true);
      await loadDesigns(false); // Refresh without using cache
    } catch (error) {
      console.error('标记为已矢量化失败:', error);
      throw error;
    }
  };

  // Mark design as downloaded
  const markAsDownloaded = async (designId: string) => {
    try {
      await sessionService.updateImageDownloadedStatus(designId, true);
      await loadDesigns(false); // Refresh without using cache
    } catch (error) {
      console.error('标记为已下载失败:', error);
      throw error;
    }
  };

  // Legacy methods for compatibility - now just refresh data
  const addDesign = async (design: Design, type: keyof DesignLibrary) => {
    console.log('addDesign called - refreshing data instead');
    await loadDesigns(false);
  };

  const removeDesign = async (designId: string, type: keyof DesignLibrary) => {
    console.log('removeDesign called - not implemented for database storage');
  };

  const updateDesign = async (designId: string, type: keyof DesignLibrary, updates: Partial<Design>) => {
    console.log('updateDesign called - not implemented for database storage');
  };

  // Manual refresh function
  const refreshLibrary = useCallback(() => {
    console.log('手动刷新设计库');
    setRetryCount(0);
    return loadDesigns(false);
  }, [loadDesigns]);

  return {
    library,
    loading,
    error,
    addDesign,
    removeDesign,
    updateDesign,
    markAsEdited,
    markAsVectorized,
    markAsDownloaded,
    refreshLibrary
  };
};
