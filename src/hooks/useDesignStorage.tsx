
import { useState, useEffect } from 'react';
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

export const useDesignStorage = () => {
  const [library, setLibrary] = useState<DesignLibrary>({
    edited: [],
    drafts: [],
    vectorized: [],
    downloaded: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load designs from database
  const loadDesigns = async () => {
    if (!user) {
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
      setLoading(true);
      console.log('加载用户设计库...');

      const [drafts, edited, vectorized, downloaded] = await Promise.all([
        sessionService.getUserDesigns(),
        sessionService.getUserEditedDesigns(),
        sessionService.getUserVectorizedDesigns(),
        sessionService.getUserDownloadedDesigns()
      ]);

      console.log('设计库数据:', {
        drafts: drafts.length,
        edited: edited.length,
        vectorized: vectorized.length,
        downloaded: downloaded.length
      });

      setLibrary({
        drafts: drafts.map(convertImageToDesign),
        edited: edited.map(convertImageToDesign),
        vectorized: vectorized.map(convertImageToDesign),
        downloaded: downloaded.map(convertImageToDesign)
      });
    } catch (error) {
      console.error('加载设计库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, [user]);

  // Mark design as edited
  const markAsEdited = async (designId: string) => {
    try {
      await sessionService.updateImageEditedStatus(designId, true);
      await loadDesigns(); // Refresh the data
    } catch (error) {
      console.error('标记为已编辑失败:', error);
      throw error;
    }
  };

  // Mark design as vectorized
  const markAsVectorized = async (designId: string) => {
    try {
      await sessionService.updateImageVectorizedStatus(designId, true);
      await loadDesigns(); // Refresh the data
    } catch (error) {
      console.error('标记为已矢量化失败:', error);
      throw error;
    }
  };

  // Mark design as downloaded
  const markAsDownloaded = async (designId: string) => {
    try {
      await sessionService.updateImageDownloadedStatus(designId, true);
      await loadDesigns(); // Refresh the data
    } catch (error) {
      console.error('标记为已下载失败:', error);
      throw error;
    }
  };

  // Legacy methods for compatibility - now just refresh data
  const addDesign = async (design: Design, type: keyof DesignLibrary) => {
    console.log('addDesign called - refreshing data instead');
    await loadDesigns();
  };

  const removeDesign = async (designId: string, type: keyof DesignLibrary) => {
    console.log('removeDesign called - not implemented for database storage');
  };

  const updateDesign = async (designId: string, type: keyof DesignLibrary, updates: Partial<Design>) => {
    console.log('updateDesign called - not implemented for database storage');
  };

  return {
    library,
    loading,
    addDesign,
    removeDesign,
    updateDesign,
    markAsEdited,
    markAsVectorized,
    markAsDownloaded,
    refreshLibrary: loadDesigns
  };
};
