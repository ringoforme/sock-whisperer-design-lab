
import { useState, useEffect, useCallback } from 'react';
import { Design, DesignLibrary } from '@/types/design';
import { useFastDesignStorage } from './useFastDesignStorage';
import { useAuth } from '@/contexts/AuthContext';

// Convert FastDesignItem to Design format for backward compatibility
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
    library: fastLibrary, 
    loading, 
    error, 
    loadDesigns: loadFastDesigns,
    updateDesignStatus,
    refresh: refreshFast
  } = useFastDesignStorage();
  
  const { user, loading: authLoading } = useAuth();

  // Convert fast library to legacy format
  useEffect(() => {
    const converted = {
      edited: fastLibrary.edited.map(convertToDesign),
      drafts: fastLibrary.drafts.map(convertToDesign),
      vectorized: fastLibrary.vectorized.map(convertToDesign),
      downloaded: fastLibrary.downloaded.map(convertToDesign)
    };
    setLibrary(converted);
  }, [fastLibrary]);

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
    await refreshFast();
  };

  const removeDesign = async (designId: string, type: keyof DesignLibrary) => {
    console.log('removeDesign called - not implemented for database storage');
  };

  const updateDesign = async (designId: string, type: keyof DesignLibrary, updates: Partial<Design>) => {
    console.log('updateDesign called - not implemented for database storage');
  };

  const refreshLibrary = useCallback(() => {
    console.log('手动刷新设计库');
    return refreshFast();
  }, [refreshFast]);

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
