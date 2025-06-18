
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, systemPrompt, conversationHistory = [] } = await req.json();

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('收到聊天请求:', message);
    console.log('对话历史长度:', conversationHistory.length);

    // 构建完整的消息数组，包含系统提示词、历史对话和当前消息
    const messages = [
      { role: 'system', content: systemPrompt || '你是一个专业的袜子设计助手' }
    ];

    // 添加对话历史（最近10轮对话，避免token过多）
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // 添加当前用户消息（如果不在历史记录末尾）
    const lastMessage = recentHistory[recentHistory.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== message) {
      messages.push({ role: 'user', content: message });
    }

    console.log('发送到OpenAI的消息数量:', messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiMessage = data.choices[0].message.content;
    console.log('GPT回复:', aiMessage);

    return new Response(JSON.stringify({ 
      message: aiMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Chat failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
