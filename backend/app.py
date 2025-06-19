
# backend/app.py

import os
import json
import time
import re # 导入正则表达式库
from dotenv import load_dotenv # 导入dotenv库
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

# --- 1. 初始化和配置 ---
load_dotenv() # 在程序启动时自动加载.env文件中的环境变量

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# 支持不同部署环境的端口配置
port = int(os.environ.get("PORT", 5001))

try:
    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    print("DEBUG: OpenAI客户端初始化成功。")
except Exception as e:
    print(f"DEBUG: OpenAI客户端初始化失败: {e}")
    client = None

# --- 2. 新的AI核心功能函数 ---

def parse_detailed_markdown_prompt(markdown_text: str) -> dict:
    """
    专门解析你提供的、高度结构化的Markdown格式的函数。
    """
    print("--- DEBUG: 进入Markdown解析函数 ---")
    print(f"原始Markdown文本:\n{markdown_text}")

    # 使用正则表达式从返回文本中提取Markdown代码块
    match = re.search(r'```(?:markdown)?\s*(.*?)\s*```', markdown_text, re.DOTALL)
    
    if not match:
        print("DEBUG: 警告 - 在GPT响应中未找到Markdown代码块，将尝试直接解析。")
        content = markdown_text.strip()
    else:
        content = match.group(1).strip()
        print("DEBUG: 已成功提取Markdown代码块内容。")

    lines = content.split('\n')
    
    # 最后一行是负面提示
    negative_prompt_line = lines[-1].strip()
    # 其它行是正面提示
    main_prompt_lines = lines[:-1]
    
    # 将所有部分组合成一个连贯的自然语言描述
    full_prompt_text = ' '.join(main_prompt_lines)
    # 清理掉标题和多余格式
    full_prompt_text = re.sub(r'\*\*(.*?)\*\*:', '', full_prompt_text).replace('—', ' ').strip()
    
    # 组合最终用于DALL-E的prompt
    final_dalle_prompt = f"{full_prompt_text} --no {negative_prompt_line}"
    print(f"DEBUG: 解析出的最终DALL-E Prompt: {final_dalle_prompt[:100]}...")
    
    # 尝试提取一个设计名称用于UI显示
    design_name = "AI 设计方案"
    try:
        for line in main_prompt_lines:
            if "Design Style & Motifs" in line:
                design_name = line.split(":")[-1].strip().split(',')[0]
                break
    except Exception: pass

    return {"design_name": design_name, "prompt_en": final_dalle_prompt}

def expand_prompt_with_gpt(user_idea):
    """
    使用你提供的新指令，循环4次来生成4个不同的详细方案。
    """
    if not client: raise ValueError("OpenAI API 客户端未初始化。")

    structured_prompts = []
    
    # 需求1：每次生成4张图
    for i in range(4):
        print(f"\n--- DEBUG: 正在生成第 {i+1}/4 个详细prompt ---")

        variation_instruction = f"This is variation {i+1} of 4. Please provide a unique stylistic interpretation."

        # 需求5：改变prompt模板
        instruction_prompt = f"""
        You are "Prompt Expander – Sock Design"; your sole task is to turn a user's minimal idea into a production-ready image prompt for GPT-4o. Accept input as ShortDescription: <idea> plus optional ColorPalette, AccentColors, and SockLength (view is always a flat-lay). Return one Markdown code block with five titled sections—Subject & Layout, Background, Design Zones, Design Style & Motifs, Color Scheme (Pantone)—followed by a single line with the negative prompt. In Subject & Layout always write: "Realistic vector-style {{SockLength}} sock, flat-lay view showing a single side, vertically centered, occupying full height with ~5 % top-bottom margin." In Background always output exactly: "solid white." Map motifs, colours, and knit textures across the six areas (Upper, Shin, Foot, Arch/instep, Heel & Toe, Cuff); for unspecified zones use "solid <Colour>" or "plain knit." Production constraints: (1) the cuff may be only solid colour or simple horizontal stripes—no icons or complex patterns; (2) heel and toe must share one identical colour, either matching the body's main colour or forming a deliberate contrast; (3) the entire palette must contain no more than seven distinct solid colours and must never include gradients—merge or drop hues if necessary; (4) the background must always remain solid white; (5) the transition between the shin area and the foot section must be a clean, straight horizontal line across the sock silhouette—no curves, waves, or angled cuts. Prefer Pantone IDs; if any field is missing, infer a sensible value and wrap it in square brackets. If the request is ambiguous, ask at most one clarifying question; otherwise respond directly, concisely, and without explanations. Use this exact negative prompt: low-res, blurry, uneven stitches, extra toes, detached heel, distortion, watermark, logo, text, noisy background, unsymmetrical design, gradient, copyright symbol.
        """
        
        final_user_content = f"{variation_instruction}\n\nShortDescription: {user_idea}"

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": instruction_prompt}, {"role": "user", "content": final_user_content}]
        )
        
        markdown_response = response.choices[0].message.content
        parsed_prompt_data = parse_detailed_markdown_prompt(markdown_response)
        structured_prompts.append(parsed_prompt_data)
        
        # 需求2：加固后端，防止速率超限
        time.sleep(1)

    return structured_prompts

def generate_images_with_dalle(structured_prompts):
    if not client: raise ValueError("OpenAI API 客户端未初始化。")

    generated_designs = []
    
    for design_proposal in structured_prompts:
        image_prompt = design_proposal.get("prompt_en")
        if not image_prompt: continue
            
        print(f"--- DEBUG: 正在为prompt生成图片: '{image_prompt[:70]}...'")
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=image_prompt,
                n=1, size="1024x1024", quality="standard", response_format="url"
            )
            image_url = response.data[0].url
            
            generated_designs.append({
                "url": image_url,
                "prompt_en": design_proposal.get("prompt_en", ""),
                "design_name": design_proposal.get("design_name", "未命名设计")
            })
            print("DEBUG: 图片生成成功。")
        except Exception as e:
            print(f"DEBUG: DALL-E 图片生成失败: {e}")
            generated_designs.append({
                "url": "https://placehold.co/1024x1024/f87171/ffffff?text=Generation+Failed",
                "prompt_en": design_proposal.get("prompt_en"),
                "design_name": "生成失败", "error": str(e)
            })
        
        time.sleep(1)

    return generated_designs

# --- 3. API 路由 (无变化) ---
@app.route('/generate_designs', methods=['POST'])
def handle_generate_designs():
    print("\n--- DEBUG: 收到 /generate_designs 请求 ---")
    if not client: return jsonify({"error": "服务器OpenAI配置错误"}), 500
    data = request.get_json()
    if not data or 'idea' not in data: return jsonify({"error": "请求中缺少 'idea' 字段"}), 400
    user_idea = data['idea']
    print(f"DEBUG: 用户想法: {user_idea}")
    try:
        structured_prompts = expand_prompt_with_gpt(user_idea)
        final_designs = generate_images_with_dalle(structured_prompts)
        print("--- DEBUG: /generate_designs 请求处理完成，正在返回结果 ---")
        return jsonify(final_designs)
    except Exception as e:
        print(f"--- DEBUG: /generate_designs 发生严重错误: {e} ---")
        return jsonify({"error": str(e)}), 500

# regenerate_image 和服务器启动部分无变化
@app.route('/regenerate_image', methods=['POST'])
def handle_regenerate_image():
    # ... (此函数内容无变化)
    print("\n--- DEBUG: 收到 /regenerate_image 请求 ---")
    if not client: return jsonify({"error": "服务器OpenAI配置错误"}), 500
    data = request.get_json()
    if not data or 'prompt' not in data: return jsonify({"error": "请求中缺少 'prompt' 字段"}), 400
    image_prompt = data['prompt']
    print(f"DEBUG: 自定义Prompt: {image_prompt[:100]}...")
    mock_proposal = [{"prompt_en": image_prompt, "design_name": "自定义修改"}]
    try:
        regenerated_design = generate_images_with_dalle(mock_proposal)
        if regenerated_design:
            print("--- DEBUG: /regenerate_image 请求处理完成 ---")
            return jsonify(regenerated_design[0])
        else: return jsonify({"error": "无法生成图片"}), 500
    except Exception as e:
        print(f"--- DEBUG: /regenerate_image 发生错误: {e} ---")
        return jsonify({"error": str(e)}), 500

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Sox Lab Backend is running"})

if __name__ == '__main__':
    print("--- DEBUG: 启动Flask服务器 ---")
    app.run(host='0.0.0.0', port=port, debug=True)
