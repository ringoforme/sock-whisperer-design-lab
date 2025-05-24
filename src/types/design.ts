
export interface Design {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
  type: 'edited' | 'draft' | 'vectorized' | 'downloaded';
  originalPrompt?: string;
  editHistory?: EditAction[];
}

export interface EditAction {
  id: string;
  action: string;
  timestamp: string;
  changes: Record<string, any>;
}

export interface DesignLibrary {
  edited: Design[];
  drafts: Design[];
  vectorized: Design[];
  downloaded: Design[];
}
