// 导入我们刚刚定义的类型
import type { DesignData } from "../types/design";

// 从环境变量中安全地获取后端API的基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * 主流程：发送初始想法到后端，获取6个设计方案
 * @param idea - 用户输入的灵感字符串
 * @returns - 返回一个包含6个设计方案的数组
 */
export async function generateDesigns(idea: string): Promise<DesignData[]> {
  const response = await fetch(`${API_BASE_URL}/generate_designs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate designs.");
  }
  return response.json();
}

/**
 * 次流程：发送修改后的单个Prompt，重新生成一张图片
 * @param prompt - 修改后的英文Prompt
 * @returns - 返回单个新的设计方案数据
 */
export async function regenerateImage(prompt: string): Promise<DesignData> {
  const response = await fetch(`${API_BASE_URL}/regenerate_image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to regenerate image.");
  }
  return response.json();
}
