
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, editInstruction } = await req.json();

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('开始图片编辑，编辑指令:', editInstruction);
    console.log('原始图片URL:', imageUrl);

    // 下载原始图片
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download original image');
    }
    
    const imageBlob = await imageResponse.blob();
    console.log('图片下载完成，大小:', imageBlob.size);

    // 准备 FormData
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', editInstruction);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1536');
    formData.append('background', 'opaque');
    formData.append('output_format', 'png');
    formData.append('quality', 'high');

    console.log('调用 OpenAI Image Edit API...');
    
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API 错误:', data);
      throw new Error(data.error?.message || 'Failed to edit image');
    }

    console.log('图片编辑成功');
    
    // 返回编辑后的图片（base64格式）
    return new Response(JSON.stringify({ 
      success: true,
      imageData: data.data[0].b64_json,
      editInstruction: editInstruction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('图片编辑失败:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image editing failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
