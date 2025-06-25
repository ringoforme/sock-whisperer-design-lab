
import { PROFESSIONAL_SYSTEM_PROMPT } from './prompts.ts';

export class StreamingOpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *generateImageStream(userInput: string): AsyncGenerator<{
    type: 'partial_image' | 'final_image' | 'expanded_prompt';
    data: string;
    index?: number;
  }> {
    console.log('开始流式图片生成...');
    
    // First expand the prompt
    const expandResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: PROFESSIONAL_SYSTEM_PROMPT },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const expandData = await expandResponse.json();
    
    if (expandData.error) {
      throw new Error(expandData.error.message);
    }

    const expandedPrompt = expandData.choices[0].message.content;
    console.log('扩展提示词:', expandedPrompt);
    
    yield {
      type: 'expanded_prompt',
      data: expandedPrompt
    };

    // Now generate image with streaming
    const streamResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        input: expandedPrompt,
        stream: true,
        tools: [{"type": "image_generation", "partial_images": 3}]
      }),
    });

    if (!streamResponse.ok) {
      const errorData = await streamResponse.json();
      throw new Error(errorData.error?.message || 'Stream generation failed');
    }

    const reader = streamResponse.body?.getReader();
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
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'response.image_generation_call.partial_image') {
                console.log(`接收到部分图片 ${data.partial_image_index}`);
                yield {
                  type: 'partial_image',
                  data: data.partial_image_b64,
                  index: data.partial_image_index
                };
              } else if (data.type === 'response.image_generation_call.done') {
                console.log('图片生成完成');
                if (data.final_image_b64) {
                  yield {
                    type: 'final_image',
                    data: data.final_image_b64
                  };
                }
              }
            } catch (parseError) {
              console.error('解析流数据失败:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
