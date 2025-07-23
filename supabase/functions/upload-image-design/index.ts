
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

    // Save to database if sessionId provided
    if (sessionId) {
      const { error: dbError } = await supabase
        .from('generated_images')
        .insert({
          session_id: sessionId,
          design_name: designName,
          detail_image_url: detailImageUrl,
          brief_image_url: briefImageUrl,
          generation_status: 'success',
          prompt_en: prompt,
          is_draft: true
        });

      if (dbError) {
        console.error('保存到数据库失败:', dbError);
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
