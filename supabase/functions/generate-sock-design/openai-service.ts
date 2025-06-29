
// OpenAI API service for sock design generation
import { PROFESSIONAL_SYSTEM_PROMPT } from './prompts.ts';

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async expandPrompt(userInput: string): Promise<string> {
    console.log('调用GPT-4o扩展提示词...');
    
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
      console.error('GPT扩展提示词失败:', expandData.error);
      throw new Error(expandData.error.message);
    }

    const expandedPrompt = expandData.choices[0].message.content;
    console.log('GPT返回的扩展提示词:', expandedPrompt);

    return expandedPrompt;
  }

  async generateImage(prompt: string): Promise<string> {
    console.log('调用图像生成API...');
    
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1536',
        quality: 'high'
      }),
    });

    const imageData = await imageResponse.json();
    
    if (imageData.error) {
      console.error('图像生成失败:', imageData.error);
      throw new Error(imageData.error.message);
    }

    // gpt-image-1 总是返回base64格式
    const base64Image = imageData.data[0].b64_json;
    return `data:image/png;base64,${base64Image}`;
  }
}
