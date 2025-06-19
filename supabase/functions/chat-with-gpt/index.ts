
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

    console.log('收到聊天请求，用户消息:', message);
    console.log('收到对话历史长度:', conversationHistory.length);
    console.log('完整对话历史:', JSON.stringify(conversationHistory, null, 2));

    // 构建完整的消息数组，按照OpenAI官方文档方式
    const messages = [
      { role: 'system', content: systemPrompt || '你是一个专业的袜子设计助手' }
    ];

    // 添加完整对话历史（保留最近20轮对话，避免token过多）
    const recentHistory = conversationHistory.slice(-20);
    console.log('使用的对话历史长度:', recentHistory.length);
    
    // 直接添加所有历史消息，不需要额外处理
    messages.push(...recentHistory.map((msg: ConversationMessage) => ({
      role: msg.role,
      content: msg.content
    })));

    console.log('发送到OpenAI的完整消息数组:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API 错误:', data.error);
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
