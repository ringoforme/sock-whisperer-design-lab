
import { supabase } from "@/integrations/supabase/client";

export interface StreamEvent {
  type: 'expanded_prompt' | 'partial_image' | 'final_image' | 'error';
  data: string;
  index?: number;
}

export class StreamingGenerationService {
  static async *generateDesignStream(sessionContext: any): AsyncGenerator<StreamEvent> {
    try {
      // Call the streaming endpoint
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/generate-sock-design`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionContext,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data:') {
              try {
                const eventData = JSON.parse(line.slice(6));
                yield eventData as StreamEvent;
              } catch (parseError) {
                console.error('解析流数据失败:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('流式生成失败:', error);
      yield {
        type: 'error',
        data: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
