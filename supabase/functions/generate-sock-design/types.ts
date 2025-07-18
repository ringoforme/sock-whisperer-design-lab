
// Type definitions for the sock design generation service
export interface SessionContext {
  sessionId?: string;
  messages: Array<{ id: number; text: string; isUser: boolean }>;
  conversationState: any;
  collectedInfo: string[];
  requirements: any;
}

export interface GenerationRequest {
  sessionContext?: SessionContext;
  requirements?: any;
}

export interface GenerationResponse {
  imageUrl: string;
  brief_image_url: string;
  expandedPrompt: string;
  designName: string;
  success: boolean;
  error?: string;
}
