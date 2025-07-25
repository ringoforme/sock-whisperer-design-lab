
import { PROFESSIONAL_SYSTEM_PROMPT } from './prompts.ts';

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // **修改点**: expandPrompt 现在接收一个消息对象数组，而不是一个字符串
  async expandPrompt(messagesPayload: any[]): Promise<string> {
    console.log('调用GPT-4o扩展提示词（新版）...');
    
    const expandResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        // **修改点**: 将系统Prompt与传入的Payload合并
        messages: [
          { role: 'system', content: PROFESSIONAL_SYSTEM_PROMPT },
          ...messagesPayload // 使用展开运算符(...)将传入的数组内容直接添加进来
        ],
        temperature: 0.7,
        max_tokens: 800 // 稍微增加token上限以容纳更复杂的prompt
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

  // generateImage 方法保持不变
  async generateImage(prompt: string): Promise<string> {
    console.log('调用图像生成API...');
    
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3', // 推荐使用dall-e-3以获得更好的矢量风格遵循效果
        prompt: prompt,
        n: 1,
        size: '1024x1024', // DALL-E 3 推荐使用方形尺寸
        quality: 'standard', // standard质量性价比更高
        response_format: 'b64_json' // 明确要求base64格式
      }),
    });

    const imageData = await imageResponse.json();
    
    if (imageData.error) {
      console.error('图像生成失败:', imageData.error);
      throw new Error(imageData.error.message);
    }

    const base64Image = imageData.data[0].b64_json;
    return `data:image/png;base64,${base64Image}`;
  }
}