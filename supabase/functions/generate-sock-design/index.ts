
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { OpenAIService } from './openai-service.ts';
import type { GenerationRequest, GenerationResponse, SessionContext } from './types.ts';
import { randomUUID } from 'node:crypto';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// **新增**: 更强大的上下文构建函数，替代旧的 buildUserInput
function buildExpansionPayload(body: GenerationRequest): any[] {
  const { sessionContext, modificationContext } = body;

  if (!sessionContext) {
    throw new Error('缺少 sessionContext');
  }

  // 将对话历史拼接成一个字符串
  const conversationText = sessionContext.messages
    .map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');

  if (modificationContext && modificationContext.imageUrl && modificationContext.previousPrompt) {
    // --- 修改模式 ---
    console.log('构建 [修改模式] 的Payload');
    // 对于多模态输入，我们将所有上下文打包到一个'user'角色的消息中
    return [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
            Please act as the Prompt Expander. Here is the context for a design modification request.
            
            **Previous Expanded Prompt (This is your primary reference, treat it like source code):**
            \`\`\`markdown
            ${modificationContext.previousPrompt}
            \`\`\`

            **Full Conversation History (Use this to understand the user's latest change requests):**
            \`\`\`
            ${conversationText}
            \`\`\`

            Your task is to modify the 'Previous Expanded Prompt' based on the latest user requests in the conversation, using the provided reference image as the visual ground truth. Output the new, complete, structured prompt.
          `
        },
        {
          type: 'image_url',
          image_url: {
            url: modificationContext.imageUrl
          }
        }
      ]
    }];
  } else {
    // --- 首次生成模式 ---
    console.log('构建 [首次生成] 的Payload');
    return [{
      role: 'user',
      content: `
        Please act as the Prompt Expander. Here is the full conversation history for a new sock design.
        
        **Full Conversation History:**
        \`\`\`
        ${conversationText}
        \`\`\`

        Your task is to generate a new, complete, structured prompt from scratch based on this conversation.
      `
    }];
  }
}


// 数据库写入函数 batchWriteToDatabase 保持不变，这里省略以保持清爽
async function batchWriteToDatabase(supabase: any, sessionContext: SessionContext, expandedPrompt: string, detail_image_url: string, thumbnail: string, designName: string, messageId?: string): Promise<void> {
    // ... 此处代码与您之前的文件完全相同 ...
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
        detail_image_url: detail_image_url,
        brief_image_url: thumbnail,
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


// ---- 主服务逻辑 (Serve) ----
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GenerationRequest = await req.json();
    
    if (!openAIApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Environment configuration missing' }), { status: 500 });
    }

    console.log('收到请求体:', JSON.stringify(body, null, 2));

    // **修改点**: 使用新的函数来构建发送给AI的Payload
    const messagesPayload = buildExpansionPayload(body);
    console.log('处理后的AI Payload:', JSON.stringify(messagesPayload, null, 2));

    // 初始化服务
    const openAIService = new OpenAIService(openAIApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // **修改点**: 调用扩展提示词服务，传入完整的消息Payload
    const expandedPrompt = await openAIService.expandPrompt(messagesPayload);
    console.log('扩展后的提示词:', expandedPrompt);

    // 第二步：生成图像 (这部分逻辑不变)
    const imageUrl = await openAIService.generateImage(expandedPrompt);
    console.log('图像生成完成');

    // 第三步：上传到云存储 (这部分逻辑不变)
    // ...
    console.log("开始云存储")
    const storageBucket = 'designs'
    const base64Match = imageUrl.match(/^data:(.*?);base64,(.*)$/);
    if (!base64Match) return new Response(JSON.stringify({ error: 'Invalid base64 format that api generated' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    const binary = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const storagePath = `images/${randomUUID()}.png`;

    const { error: uploadError } = await supabase.storage.from(storageBucket).upload(storagePath, binary.buffer, { contentType: mimeType, upsert: true });

    if (uploadError) return new Response(JSON.stringify({ error: uploadError.message }), { status: 500, headers: corsHeaders });

    console.log("上传图片成功")

    const { data: publicUrlData } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);
    const detailUrl = publicUrlData.publicUrl;
    console.log("获取detail url")

    const { data: publicUrlBriefData } = supabase.storage.from(storageBucket).getPublicUrl(storagePath, {transform: {width: 256, height: 384}})
    const briefUrl = publicUrlBriefData.publicUrl
    console.log("获取brief url")


    // 第四步：批量写入数据库 (这部分逻辑不变)
    const designName = '袜子设计';
    if (body.sessionContext?.sessionId) {
      console.log('开始后台数据库写入任务，消息ID:', body.messageId);
      // 使用 EdgeRuntime.waitUntil 在后台执行数据库写入
      EdgeRuntime.waitUntil(
        batchWriteToDatabase(supabase, body.sessionContext, expandedPrompt, detailUrl, briefUrl, designName, body.messageId)
          .catch(error => {
            console.error('后台数据库写入失败:', error);
          })
      );
    }

    // 返回响应 (这部分逻辑不变)
    const response: GenerationResponse = { 
      imageUrl: detailUrl,
      brief_image_url: briefUrl,
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
    return new Response(JSON.stringify({ error: error.message || 'Image generation failed', success: false }), { status: 500, headers: corsHeaders });
  }
});