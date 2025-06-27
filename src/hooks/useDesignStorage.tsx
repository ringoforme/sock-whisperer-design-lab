
import { useState, useEffect, useCallback } from 'react';
import { Design, DesignLibrary } from '@/types/design';
import { useOptimizedDesignStorage } from './useOptimizedDesignStorage';
import { useAuth } from '@/contexts/AuthContext';

// Convert OptimizedDesignLibrary to Design format for backward compatibility
const convertToDesign = (item: any): Design => ({
  id: item.id,
  imageUrl: item.image_url,
  title: item.design_name,
  createdAt: item.created_at || new Date().toISOString(),
  type: item.category as 'draft' | 'edited' | 'vectorized' | 'downloaded',
  originalPrompt: undefined
});

export const useDesignStorage = () => {
  const [library, setLibrary] = useState<DesignLibrary>({
    edited: [],
    drafts: [],
    vectorized: [],
    downloaded: []
  });
  
  const { 
    library: optimizedLibrary, 
    loading, 
    error, 
    loadDesigns: loadOptimizedDesigns,
    updateDesignStatus,
    refresh: refreshOptimized
  } = useOptimizedDesignStorage();
  
  const { user, loading: authLoading } = useAuth();

  // Convert optimized library to legacy format
  useEffect(() => {
    const converted = {
      edited: optimizedLibrary.edited.map(convertToDesign),
      drafts: optimizedLibrary.drafts.map(convertToDesign),
      vectorized: optimizedLibrary.vectorized.map(convertToDesign),
      downloaded: optimizedLibrary.downloaded.map(convertToDesign)
    };
    setLibrary(converted);
  }, [optimizedLibrary]);

  // Load designs when user changes
  useEffect(() => {
    if (!authLoading && user) {
      loadOptimizedDesigns();
    }
  }, [user?.id, authLoading, loadOptimizedDesigns]);

  // Legacy methods for backward compatibility
  const markAsEdited = async (designId: string) => {
    await updateDesignStatus(designId, { is_edited: true });
  };

  const markAsVectorized = async (designId: string) => {
    await updateDesignStatus(designId, { is_vectorized: true });
  };

  const markAsDownloaded = async (designId: string) => {
    await updateDesignStatus(designId, { is_downloaded: true });
  };

  const addDesign = async (design: Design, type: keyof DesignLibrary) => {
    console.log('addDesign called - refreshing data instead');
    await refreshOptimized();
  };

  const removeDesign = async (designId: string, type: keyof DesignLibrary) => {
    console.log('removeDesign called - not implemented for database storage');
  };

  const updateDesign = async (designId: string, type: keyof DesignLibrary, updates: Partial<Design>) => {
    console.log('updateDesign called - not implemented for database storage');
  };

  const refreshLibrary = useCallback(() => {
    console.log('手动刷新设计库');
    return refreshOptimized();
  }, [refreshOptimized]);

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
