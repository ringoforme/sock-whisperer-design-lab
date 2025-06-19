
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { OpenAIService } from './openai-service.ts';
import type { GenerationRequest, GenerationResponse, SessionContext } from './types.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildUserInput(body: GenerationRequest): string {
  let userInput = '';
  
  // 处理两种输入格式：新的 sessionContext 和旧的 requirements
  if (body.sessionContext) {
    // 新格式：完整会话上下文
    const { sessionContext } = body;
    console.log('处理完整会话上下文:', sessionContext);
    
    // 构建用于扩展的上下文描述
    const conversationSummary = sessionContext.messages
      .filter((m: any) => m.isUser)
      .map((m: any) => m.text)
      .join(' ');
    
    userInput = `会话上下文: ${JSON.stringify(sessionContext.requirements)}
对话摘要: ${conversationSummary}
收集的信息: ${JSON.stringify(sessionContext.collectedInfo)}
对话状态: ${JSON.stringify(sessionContext.conversationState)}`;
  } else if (body.requirements) {
    // 旧格式：简单需求
    userInput = JSON.stringify(body.requirements);
  } else {
    throw new Error('缺少必要的输入参数');
  }

  return userInput;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerationRequest = await req.json();
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('收到请求体:', JSON.stringify(body, null, 2));

    const userInput = buildUserInput(body);
    console.log('处理后的用户输入:', userInput);

    // 初始化OpenAI服务
    const openAIService = new OpenAIService(openAIApiKey);

    // 第一步：扩展提示词
    const parsedPrompt = await openAIService.expandPrompt(userInput);
    console.log('解析后的提示词:', parsedPrompt);

    // 第二步：生成图像
    const imageUrl = await openAIService.generateImage(parsedPrompt.prompt_en);

    const response: GenerationResponse = { 
      imageUrl,
      expandedPrompt: parsedPrompt.prompt_en,
      designName: parsedPrompt.design_name,
      success: true 
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-sock-design function:', error);
    
    const errorResponse: GenerationResponse = { 
      imageUrl: '',
      expandedPrompt: '',
      designName: '',
      error: error.message || 'Image generation failed',
      success: false 
    };

    return new Response(JSON.stringify(errorResponse), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
