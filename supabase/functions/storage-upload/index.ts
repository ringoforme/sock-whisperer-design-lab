
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { randomUUID } from 'node:crypto';


const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { imageUrl } = await req.json();
    console.log("开始云存储")
    console.log("url:",imageUrl)

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
    console.log("获取detail url",detailUrl)

    const { data: publicUrlBriefData } = supabase.storage.from(storageBucket).getPublicUrl(storagePath, {transform: {width: 256, height: 384}})
    const briefUrl = publicUrlBriefData.publicUrl
    console.log("获取brief url",briefUrl)  
    
    
    // 返回编辑后的图片（base64格式）
    return new Response(JSON.stringify({ 
      success: true,
      detail_image_url: detailUrl,
      brief_image_url: briefUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('上传storage获取url失败:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Storage Upload failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
