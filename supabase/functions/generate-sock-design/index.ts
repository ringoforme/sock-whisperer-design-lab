
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { OpenAIService } from './openai-service.ts';
import { StreamingOpenAIService } from './streaming-service.ts';
import type { GenerationRequest, GenerationResponse, SessionContext } from './types.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function buildUserInput(body: GenerationRequest): string {
  let userInput = '';
  
  if (body.sessionContext) {
    const { sessionContext } = body;
    console.log('处理完整会话上下文:', sessionContext);
    
    const conversationSummary = sessionContext.messages
      .filter((m: any) => m.isUser)
      .map((m: any) => m.text)
      .join(' ');
    
    userInput = `会话上下文: ${JSON.stringify(sessionContext.requirements)}
对话摘要: ${conversationSummary}
收集的信息: ${JSON.stringify(sessionContext.collectedInfo)}
对话状态: ${JSON.stringify(sessionContext.conversationState)}`;
  } else if (body.requirements) {
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
    
    // Check if streaming is requested
    const isStreaming = body.stream === true;
    
    if (isStreaming) {
      // Handle streaming response
      const userInput = buildUserInput(body);
      const streamingService = new StreamingOpenAIService(openAIApiKey);
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of streamingService.generateImageStream(userInput)) {
              const eventData = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(new TextEncoder().encode(eventData));
            }
            controller.close();
          } catch (error) {
            console.error('流式生成失败:', error);
            const errorEvent = `data: ${JSON.stringify({ 
              type: 'error', 
              data: error.message 
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorEvent));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response (existing logic)
      const userInput = buildUserInput(body);
      const openAIService = new OpenAIService(openAIApiKey);

      const expandedPrompt = await openAIService.expandPrompt(userInput);
      const imageUrl = await openAIService.generateImage(expandedPrompt);

      const response: GenerationResponse = { 
        imageUrl,
        expandedPrompt: expandedPrompt,
        designName: '袜子设计',
        success: true 
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
