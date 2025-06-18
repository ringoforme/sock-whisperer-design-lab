
export interface DesignRequirements {
  sockType?: 'ankle' | 'crew' | 'knee-high' | 'thigh-high';
  colors?: string[];
  pattern?: 'geometric' | 'animal' | 'floral' | 'abstract' | 'text' | 'holiday' | 'sports';
  occasion?: 'daily' | 'sport' | 'business' | 'special';
  style?: 'minimalist' | 'bold' | 'cute' | 'elegant' | 'trendy';
  additionalNotes?: string;
}

export type ConversationPhase = 
  | 'welcome'
  | 'collecting_type'
  | 'collecting_colors'
  | 'collecting_pattern'
  | 'collecting_occasion'
  | 'collecting_style'
  | 'confirming'
  | 'ready_to_generate'
  | 'editing_feedback';

export interface ConversationState {
  phase: ConversationPhase;
  requirements: DesignRequirements;
  collectedInfo: string[];
  isComplete: boolean;
}
