
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

// 定义一个设计方案的数据结构
// 它必须和你的后端返回的JSON字段完全对应
export interface DesignData {
  url: string;
  prompt_en: string;
  design_name: string;
}

export interface DesignExample {
  id: number;
  imageUrl: string;
  prompt: string;
  label: string;
}
