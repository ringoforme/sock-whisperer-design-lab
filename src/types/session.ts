
export interface SessionMessage {
  id: number;
  text: string;
  isUser: boolean;
  designWork?: {
    id: string;
    name: string;
    thumbnail_url?: string;
    image_url: string;
    status: string;
  };
}

export interface SessionState {
  currentSessionId: string | null;
  messages: SessionMessage[];
  hasUserInteraction: boolean;
}
