
import { useState, useEffect } from 'react';
import { Design, DesignLibrary } from '@/types/design';

const STORAGE_KEY = 'designLibrary';

const defaultLibrary: DesignLibrary = {
  edited: [],
  drafts: [],
  vectorized: [],
  downloaded: []
};

export const useDesignStorage = () => {
  const [library, setLibrary] = useState<DesignLibrary>(defaultLibrary);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLibrary(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored design library:', error);
      }
    }
  }, []);

  const saveToStorage = (newLibrary: DesignLibrary) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
    setLibrary(newLibrary);
  };

  const addDesign = (design: Design, type: keyof DesignLibrary) => {
    const newLibrary = {
      ...library,
      [type]: [...library[type], design]
    };
    saveToStorage(newLibrary);
  };

  const removeDesign = (designId: string, type: keyof DesignLibrary) => {
    const newLibrary = {
      ...library,
      [type]: library[type].filter(d => d.id !== designId)
    };
    saveToStorage(newLibrary);
  };

  const updateDesign = (designId: string, type: keyof DesignLibrary, updates: Partial<Design>) => {
    const newLibrary = {
      ...library,
      [type]: library[type].map(d => 
        d.id === designId ? { ...d, ...updates } : d
      )
    };
    saveToStorage(newLibrary);
  };

  return {
    library,
    addDesign,
    removeDesign,
    updateDesign
  };
};
