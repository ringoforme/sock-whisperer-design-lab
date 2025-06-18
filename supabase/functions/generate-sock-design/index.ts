
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 扩写系统提示词 - 将用户需求转换为专业的图像生成提示
const EXPANDER_SYSTEM_PROMPT = `你是一个专业的袜子设计图像生成提示词专家。你的任务是将用户的袜子设计需求转换为详细、专业的图像生成提示词。

转换规则：
1. 保持袜子设计的核心要素
2. 添加专业的设计术语和视觉描述
3. 确保提示词适合AI图像生成
4. 包含材质、纹理、光照等视觉细节
5. 使用英文输出，适合国际化的图像生成模型

示例转换：
用户输入："红色几何图案中筒袜，用于日常休闲"
输出："Modern crew socks with vibrant red geometric patterns, comfortable cotton blend material, clean minimalist design, flat lay photography, soft natural lighting, white background, high resolution, product photography style"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements } = await req.json();

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 第一步：使用GPT将用户需求扩写为专业的图像生成提示
    const expandResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: EXPANDER_SYSTEM_PROMPT },
          { role: 'user', content: `设计需求：${JSON.stringify(requirements, null, 2)}` }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    const expandData = await expandResponse.json();
    const expandedPrompt = expandData.choices[0].message.content;

    console.log('Expanded prompt:', expandedPrompt);

    // 第二步：使用扩写后的提示生成图像
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: expandedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      }),
    });

    const imageData = await imageResponse.json();
    
    if (imageData.error) {
      throw new Error(imageData.error.message);
    }

    const base64Image = imageData.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return new Response(JSON.stringify({ 
      imageUrl,
      expandedPrompt,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-sock-design function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image generation failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
