import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, maskData, editInstruction } = await req.json();
    console.log('笔刷遮罩编辑请求:', { imageUrl: imageUrl?.slice(0, 50) + '...', maskData: maskData?.slice(0, 50) + '...', editInstruction });

    // 验证输入参数
    if (!imageUrl || !maskData || !editInstruction) {
      throw new Error('缺少必要参数: imageUrl, maskData, editInstruction');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY 未配置');
    }

    // 准备原图数据
    let imageBase64: string;
    if (imageUrl.startsWith('data:image/')) {
      // 已经是base64格式
      imageBase64 = imageUrl.split(',')[1];
    } else {
      // 下载图片并转换为base64
      console.log('下载原图片...');
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`无法下载原图片: ${imageResponse.statusText}`);
      }
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
    }

    // 准备遮罩数据
    let maskBase64: string;
    if (maskData.startsWith('data:image/')) {
      maskBase64 = maskData.split(',')[1];
    } else {
      maskBase64 = maskData;
    }

    console.log('调用 OpenAI images.edit API...');
    
    // 调用 OpenAI images.edit API
    const formData = new FormData();
    
    // 将base64转换为Blob
    const imageBlob = new Blob([Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))], { type: 'image/png' });
    const maskBlob = new Blob([Uint8Array.from(atob(maskBase64), c => c.charCodeAt(0))], { type: 'image/png' });
    
    formData.append('image', imageBlob, 'image.png');
    formData.append('mask', maskBlob, 'mask.png');
    formData.append('prompt', editInstruction);
    formData.append('n', '1');
    formData.append('size', '1024x1536');
    formData.append('model', 'gpt-image-1');

    const editResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData
    });

    const editData = await editResponse.json();
    console.log('OpenAI API 响应状态:', editResponse.status);

    if (!editResponse.ok || editData.error) {
      console.error('OpenAI API 错误:', editData.error);
      throw new Error(editData.error?.message || `OpenAI API 调用失败: ${editResponse.status}`);
    }

    if (!editData.data || editData.data.length === 0) {
      throw new Error('OpenAI API 返回的数据为空');
    }

    const editedImageBase64 = editData.data[0].b64_json;
    console.log('笔刷遮罩编辑成功');

    return new Response(JSON.stringify({
      success: true,
      imageData: editedImageBase64,
      editInstruction: editInstruction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('笔刷遮罩编辑失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '笔刷遮罩编辑失败'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});