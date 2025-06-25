// Type definitions for the sock design generation service
export interface SessionContext {
  sessionId?: string;
  messages: Array<{ id: number; text: string; isUser: boolean }>;
  conversationState: any;
  collectedInfo: string[];
  requirements: any;
}

export interface GenerationRequest {
  requirements?: any;
  sessionContext?: SessionContext;
  stream?: boolean; // Add streaming flag
}

export interface GenerationResponse {
  imageUrl: string;
  expandedPrompt: string;
  designName: string;
  success: boolean;
  error?: string;
}
