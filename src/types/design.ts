
// 更新设计类型定义以匹配新的数据库结构
export interface Design {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
  type: "edited" | "draft" | "vectorized" | "downloaded";
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

// 新的设计数据结构，对应数据库的 design_works 表
export interface DesignWork {
  id: string;
  session_id: string;
  requirements_id?: string;
  name: string;
  description?: string;
  prompt_used: string;
  image_url: string;
  thumbnail_url?: string;
  generation_provider: string;
  generation_model: string;
  generation_params: Record<string, any>;
  status: 'generating' | 'generated' | 'failed' | 'archived';
  is_favorite: boolean;
  download_count: number;
  edit_history: EditAction[];
  parent_work_id?: string;
  version: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// 设计需求结构
export interface DesignRequirement {
  id: string;
  session_id: string;
  sock_type?: string;
  colors?: string[];
  patterns?: string[];
  style?: string;
  occasion?: string;
  size_range?: string;
  material_preferences?: string[];
  special_features?: string[];
  target_audience?: string;
  budget_range?: string;
  additional_notes?: string;
  is_finalized: boolean;
  created_at: string;
  updated_at: string;
}

// 设计会话结构
export interface DesignSession {
  id: string;
  user_id: string;
  title: string;
  initial_prompt: string;
  status: 'active' | 'completed' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// 对话消息结构
export interface ConversationMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

// 设计标签结构
export interface DesignTag {
  id: string;
  name: string;
  category?: string;
  color: string;
  created_at: string;
}

// 兼容旧版本的数据结构
export interface DesignData {
  url: string;
  prompt_en: string;
  design_name: string;
}

// 转换函数：将新的 DesignWork 转换为旧的 Design 格式
export function designWorkToDesign(work: DesignWork): Design {
  return {
    id: work.id,
    imageUrl: work.image_url,
    title: work.name,
    createdAt: work.created_at,
    type: "draft", // 默认类型
    originalPrompt: work.prompt_used,
    editHistory: work.edit_history
  };
}

// 转换函数：将新的 DesignWork 转换为 DesignData 格式
export function designWorkToDesignData(work: DesignWork): DesignData {
  return {
    url: work.image_url,
    prompt_en: work.prompt_used,
    design_name: work.name
  };
}
