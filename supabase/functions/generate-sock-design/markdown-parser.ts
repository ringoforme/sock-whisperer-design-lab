
// Markdown parsing utilities for sock design prompts
export interface ParsedPrompt {
  design_name: string;
  prompt_en: string;
}

export function parseDetailedMarkdownPrompt(markdownText: string): ParsedPrompt {
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
