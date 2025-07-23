
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function saveToDatabaseSync(supabase: any, sessionId: string, expandedPrompt: string, detail_image_url: string, thumbnail: string, designName: string): Promise<void> {
  console.log('开始同步写入数据库...');
  
  try {
    // 1. 获取用户ID
    console.log('获取会话用户ID...');
    const { data: sessionData, error: sessionError } = await supabase
      .from('design_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('获取会话用户ID失败:', sessionError);
      throw new Error(`获取会话用户ID失败: ${sessionError.message}`);
    }

    if (!sessionData?.user_id) {
      throw new Error('未找到会话对应的用户ID');
    }

    console.log('找到用户ID:', sessionData.user_id);

    // 2. 创建或更新设计简报
    console.log('写入设计简报...');
    const { data: brief, error: briefError } = await supabase
      .from('design_briefs')
      .upsert({
        session_id: sessionId,
        completion_status: 'complete',
        additional_notes: `基于上传图片生成的设计`
      })
      .select()
      .single();

    if (briefError) {
      console.error('写入设计简报失败:', briefError);
      throw new Error(`写入设计简报失败: ${briefError.message}`);
    }
    console.log('设计简报写入成功:', brief.id);

    // 3. 记录扩展提示词
    console.log('写入扩展提示词...');
    const { data: promptRecord, error: promptError } = await supabase
      .from('expanded_prompts')
      .insert({
        session_id: sessionId,
        brief_id: brief.id,
        original_brief: '用户上传图片',
        expanded_prompt: expandedPrompt
      })
      .select()
      .single();

    if (promptError) {
      console.error('写入扩展提示词失败:', promptError);
      throw new Error(`写入扩展提示词失败: ${promptError.message}`);
    }
    console.log('扩展提示词写入成功:', promptRecord.id);

    // 4. 记录生成的图片
    console.log('写入生成图片记录...');
    const { data: imageRecord, error: imageError } = await supabase
      .from('generated_images')
      .insert({
        session_id: sessionId,
        prompt_id: promptRecord.id,
        detail_image_url: detail_image_url,
        brief_image_url: thumbnail,
        design_name: designName,
        generation_status: 'success',
        user_id: sessionData.user_id,
        is_hidden_from_user: false
      })
      .select()
      .single();

    if (imageError) {
      console.error('写入生成图片记录失败:', imageError);
      throw new Error(`写入生成图片记录失败: ${imageError.message}`);
    }
    console.log('生成图片记录写入成功，图片ID:', imageRecord.id);

    console.log('同步数据库写入完成');
  } catch (error) {
    console.error('同步写入数据库失败:', error);
    
    // 记录失败状态
    try {
      await supabase
        .from('design_briefs')
        .upsert({
          session_id: sessionId,
          completion_status: 'failed',
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
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('开始处理图片上传生成请求');
    
    // Parse multipart/form-data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!imageFile || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing image file or prompt' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('接收到图片文件:', imageFile.name, '大小:', imageFile.size);
    console.log('提示词:', prompt);
    console.log('会话ID:', sessionId);

    // Validate file size (5MB limit)
    if (imageFile.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size too large. Maximum 5MB allowed.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG and PNG are allowed.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prepare FormData for OpenAI API
    const openAIFormData = new FormData();
    openAIFormData.append('image', imageFile);
    openAIFormData.append('prompt', prompt);
    openAIFormData.append('model', 'gpt-image-1');
    openAIFormData.append('size', '1024x1536');
    openAIFormData.append('quality', 'high');
    openAIFormData.append('background', 'auto');
    openAIFormData.append('moderation', 'auto');
    openAIFormData.append('n', '1');

    console.log('调用 OpenAI Images Edit API...');
    
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: openAIFormData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API 错误:', data);
      throw new Error(data.error?.message || 'Failed to generate image');
    }

    console.log('OpenAI API 调用成功');
    
    // Generate design name
    const designName = `uploaded-design_${new Date().toISOString().slice(0, 10)}_${Math.random().toString(36).slice(2, 8)}`;
    
    // Convert base64 to blob for upload
    const base64Data = data.data[0].b64_json;
    const imageBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
      type: 'image/png'
    });

    // Upload to Supabase Storage
    const fileName = `${designName}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('designs')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('上传到 Supabase Storage 失败:', uploadError);
      throw new Error('Failed to upload generated image');
    }

    const { data: publicUrlData } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName);

    const detailImageUrl = publicUrlData.publicUrl;

    // Generate thumbnail
    const thumbnailBlob = imageBlob; // For now, use same image as thumbnail
    const thumbnailFileName = `thumb_${fileName}`;
    
    const { error: thumbUploadError } = await supabase.storage
      .from('designs')
      .upload(thumbnailFileName, thumbnailBlob, {
        contentType: 'image/png',
        upsert: true
      });

    if (thumbUploadError) {
      console.error('上传缩略图失败:', thumbUploadError);
    }

    const { data: thumbUrlData } = supabase.storage
      .from('designs')
      .getPublicUrl(thumbnailFileName);

    const briefImageUrl = thumbUrlData.publicUrl;

    // Save to database synchronously if sessionId provided
    if (sessionId) {
      console.log('开始同步数据库写入...');
      try {
        await saveToDatabaseSync(supabase, sessionId, prompt, detailImageUrl, briefImageUrl, designName);
        console.log('数据库写入成功');
      } catch (dbError) {
        console.error('数据库写入失败:', dbError);
        // Don't fail the entire request if database write fails
        console.log('数据库写入失败，但继续返回图片结果');
      }
    }

    console.log('图片上传生成成功');
    
    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: detailImageUrl,
      brief_image_url: briefImageUrl,
      expandedPrompt: prompt,
      designName: designName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('图片上传生成失败:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image upload generation failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
