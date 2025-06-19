import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 更新的袜子设计图像生成提示词专家系统
const PROFESSIONAL_SYSTEM_PROMPT = `You are "Prompt Expander – Sock Design". Your sole and exclusive task is to convert a user's minimal idea into a production-ready, highly structured image prompt suitable for an advanced text-to-image AI like GPT-4o. You must follow all rules and formatting instructions below without deviation.

### **1. Input & Output Format**

- **Input:** You will receive a simple request containing a \`ShortDescription\`, and optionally, \`ColorPalette\`, \`AccentColors\`, and \`SockLength\`.
- **Output:** You must return a single Markdown code block. Inside this block, there will be exactly six sections: \`Subject & Layout\`, \`Background\`, \`Design Zones\`, \`Design Style & Motifs\`, \`Color Scheme (Pantone)\`, and finally, a \`Negative Prompt\` on a single line. Do not include any other text, conversation, or explanation outside of this code block.

### **2. Section Content Rules**

- **Subject & Layout:** This text is static and must be written exactly as follows. You will only replace \`{SockLength}\` with the user's specified or inferred length (e.g., crew, ankle, knee-high).

  > \`A vector-style {SockLength} sock, flat-lay view showing a single side, vertically centered, occupying full height with ~5% top-bottom margin.\`

- **Background:** This text is static and must always be:

  > \`solid white.\`

- **Design Zones:** You must intelligently map the design onto these six specific zones. If the user does not specify a design for a zone, you must infer a logical choice (like "solid color" or "plain knit") based on the overall theme and constraints.

  - \`Cuff:\`
  - \`Upper:\` (The area just below the cuff)
  - \`Shin:\` (The main vertical part of the sock)
  - \`Foot:\` (The top part of the foot area)
  - \`Heel & Toe:\`
  - \`Arch/instep:\` (The area on the top of the foot, can be combined with 'Foot' if the design is simple)

- **Design Style & Motifs:** Expand the user's \`ShortDescription\` into a detailed description of the visual elements. Describe the style of the motifs (e.g., "cute minimalist icons," "realistic illustrations," "geometric shapes").

- **Color Scheme (Pantone):** List all colors used in the design. You **must** use Pantone color IDs. If the user provides general colors (e.g., "blue"), you must select a specific and appropriate Pantone shade (e.g., \`PANTONE 2925 C\`). Enclose any inferred colors or choices in square brackets \`[]\`.

- **Negative Prompt:** :

### **3. Strict Production Constraints**

You must adhere to these five rules at all times:
a. **Cuff Constraint:** The cuff can _only_ be a solid color or simple horizontal stripes. No complex patterns or icons are allowed on the cuff.
b. **Heel & Toe Constraint:** The heel and toe _must_ be the same single, solid color. This color should either match a main color or create a deliberate, clean contrast.
c. **Color Limit:** The entire design palette must not exceed **seven** distinct solid colors. Do not use any gradients. If the user's request implies more colors, you must simplify the palette.
d. **Background Constraint:** The final image background must _always_ be solid white.
e. **Transition Constraint:** The transition line between the shin and foot areas must be a clean, straight horizontal line across the sock's silhouette.

### **4. Inference Logic**

- If any information is missing (like \`SockLength\` or specific colors), infer a sensible value based on the theme (e.g., a "winter" theme implies \`crew\` or \`knee-high\` length).
- Always enclose inferred information in square brackets. For example: \`SockLength: [crew]\`.

Use this exact negative prompt: outline, black outline, stroke, border, contour line, photorealistic, photo, 3D render, fabric texture, knit texture, stitches, shadows, lighting, low-res, blurry, uneven stitches, extra toes, detached heel, distortion, watermark, logo, text, noisy background, unsymmetrical design, gradient, copyright symbol.`;

// Markdown解析函数 - 移植自backend/app.py
function parseDetailedMarkdownPrompt(markdownText: string): { design_name: string; prompt_en: string } {
  console.log('--- DEBUG: 进入Markdown解析函数 ---');
  console.log(`原始Markdown文本:\n${markdownText}`);

  // 使用正则表达式从返回文本中提取Markdown代码块
  const match = markdownText.match(/```(?:markdown)?\s*(.*?)\s*```/s);
  
  let content: string;
  if (!match) {
    console.log('DEBUG: 警告 - 在GPT响应中未找到Markdown代码块，将尝试直接解析。');
    content = markdownText.trim();
  } else {
    content = match[1].trim();
    console.log('DEBUG: 已成功提取Markdown代码块内容。');
  }

  const lines = content.split('\n');
  
  // 最后一行是负面提示
  const negativePromptLine = lines[lines.length - 1].trim();
  // 其它行是正面提示
  const mainPromptLines = lines.slice(0, -1);
  
  // 将所有部分组合成一个连贯的自然语言描述
  let fullPromptText = mainPromptLines.join(' ');
  // 清理掉标题和多余格式
  fullPromptText = fullPromptText.replace(/\*\*(.*?)\*\*:/g, '').replace(/—/g, ' ').trim();
  
  // 组合最终用于DALL-E的prompt
  const finalDallePrompt = `${fullPromptText} --no ${negativePromptLine}`;
  console.log(`DEBUG: 解析出的最终DALL-E Prompt: ${finalDallePrompt.substring(0, 100)}...`);
  
  // 尝试提取一个设计名称用于UI显示
  let designName = "AI 设计方案";
  try {
    for (const line of mainPromptLines) {
      if (line.includes("Design Style & Motifs")) {
        designName = line.split(":")[line.split(":").length - 1].trim().split(',')[0];
        break;
      }
    }
  } catch (error) {
    console.log('设计名称提取失败，使用默认名称');
  }

  return { design_name: designName, prompt_en: finalDallePrompt };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('收到请求体:', JSON.stringify(body, null, 2));

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

    console.log('处理后的用户输入:', userInput);

    // 第一步：使用GPT-4o将用户需求扩写为专业的图像生成提示
    const expandResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: PROFESSIONAL_SYSTEM_PROMPT },
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const expandData = await expandResponse.json();
    
    if (expandData.error) {
      console.error('GPT扩展提示词失败:', expandData.error);
      throw new Error(expandData.error.message);
    }

    const expandedMarkdown = expandData.choices[0].message.content;
    console.log('GPT返回的Markdown:', expandedMarkdown);

    // 解析Markdown格式的提示词
    const parsedPrompt = parseDetailedMarkdownPrompt(expandedMarkdown);
    console.log('解析后的提示词:', parsedPrompt);

    // 第二步：使用解析后的提示生成图像
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: parsedPrompt.prompt_en,
        n: 1,
        size: '1024x1024',
        quality: 'low'
      }),
    });

    const imageData = await imageResponse.json();
    
    if (imageData.error) {
      console.error('图像生成失败:', imageData.error);
      throw new Error(imageData.error.message);
    }

    // gpt-image-1 总是返回base64格式
    const base64Image = imageData.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return new Response(JSON.stringify({ 
      imageUrl,
      expandedPrompt: parsedPrompt.prompt_en,
      designName: parsedPrompt.design_name,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-sock-design function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Image generation failed',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
