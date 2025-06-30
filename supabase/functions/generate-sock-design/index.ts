
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

import { OpenAIService } from './openai-service.ts';
import type { GenerationRequest, GenerationResponse, SessionContext } from './types.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

async function batchWriteToDatabase(supabase: any, sessionContext: SessionContext, expandedPrompt: string, imageUrl: string, designName: string, messageId?: string): Promise<void> {
  console.log('开始批量写入数据库...');
  console.log('关联消息ID:', messageId);
  
  try {
    // 1. 创建或更新设计简报
    console.log('写入设计简报...');
    const { data: brief, error: briefError } = await supabase
      .from('design_briefs')
      .upsert({
        session_id: sessionContext.sessionId,
        completion_status: 'complete',
        additional_notes: `基于完整会话上下文生成，收集的信息: ${JSON.stringify(sessionContext.collectedInfo)}`
      })
      .select()
      .single();

    if (briefError) {
      console.error('写入设计简报失败:', briefError);
      throw briefError;
    }
    console.log('设计简报写入成功:', brief.id);

    // 2. 记录扩展提示词
    console.log('写入扩展提示词...');
    const { data: promptRecord, error: promptError } = await supabase
      .from('expanded_prompts')
      .insert({
        session_id: sessionContext.sessionId,
        brief_id: brief.id,
        original_brief: JSON.stringify(sessionContext.collectedInfo),
        expanded_prompt: expandedPrompt
      })
      .select()
      .single();

    if (promptError) {
      console.error('写入扩展提示词失败:', promptError);
      throw promptError;
    }
    console.log('扩展提示词写入成功:', promptRecord.id);

    // 3. 获取用户ID（从session context或从数据库查询）
    const { data: sessionData, error: sessionError } = await supabase
      .from('design_sessions')
      .select('user_id')
      .eq('id', sessionContext.sessionId)
      .single();

    if (sessionError) {
      console.error('获取会话用户ID失败:', sessionError);
      throw sessionError;
    }

    // 4. 记录生成的图片，直接设置message_id
    console.log('写入生成图片记录，消息ID:', messageId);
    const { data: imageRecord, error: imageError } = await supabase
      .from('generated_images')
      .insert({
        session_id: sessionContext.sessionId,
        prompt_id: promptRecord.id,
        image_url: imageUrl,
        design_name: designName,
        generation_status: 'success',
        user_id: sessionData.user_id,
        message_id: messageId // 直接设置消息ID，避免后续更新操作
      })
      .select()
      .single();

    if (imageError) {
      console.error('写入生成图片记录失败:', imageError);
      throw imageError;
    }
    console.log('生成图片记录写入成功，图片ID:', imageRecord.id, '消息ID:', messageId);

    console.log('批量数据库写入完成');
  } catch (error) {
    console.error('批量写入数据库失败:', error);
    
    // 记录失败状态
    try {
      await supabase
        .from('design_briefs')
        .upsert({
          session_id: sessionContext.sessionId,
          completion_status: 'complete',
          additional_notes: `生成失败：${error.message}`
        });
    } catch (fallbackError) {
      console.error('记录失败状态也失败了:', fallbackError);
    }
    
    throw error;
  }
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

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('收到请求体:', JSON.stringify(body, null, 2));

    const userInput = buildUserInput(body);
    console.log('处理后的用户输入:', userInput);

    // 初始化服务
    const openAIService = new OpenAIService(openAIApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 第一步：扩展提示词
    const expandedPrompt = await openAIService.expandPrompt(userInput);
    console.log('扩展后的提示词:', expandedPrompt);

    // 第二步：生成图像
    const imageUrl = await openAIService.generateImage(expandedPrompt);
    console.log('图像生成完成');

    const designName = '袜子设计';

    // 第三步：批量写入数据库（在后台执行）
    if (body.sessionContext?.sessionId) {
      console.log('开始后台数据库写入任务，消息ID:', body.messageId);
      // 使用 EdgeRuntime.waitUntil 在后台执行数据库写入
      EdgeRuntime.waitUntil(
        batchWriteToDatabase(supabase, body.sessionContext, expandedPrompt, imageUrl, designName, body.messageId)
          .catch(error => {
            console.error('后台数据库写入失败:', error);
          })
      );
    }

    // 立即返回最小展示数据
    const response: GenerationResponse = { 
      imageUrl,
      expandedPrompt: expandedPrompt,
      designName: designName,
      success: true 
    };

    console.log('返回响应，数据库写入在后台进行');
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
