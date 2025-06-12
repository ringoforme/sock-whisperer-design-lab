# backend/app.py

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai # 导入 OpenAI 库

# --- 1. 初始化和配置 ---
app = Flask(__name__)
# 允许来自你的前端开发服务器的请求 (例如 http://localhost:5173)
# 在生产环境中，你应该把 "*" 替换成你的前端域名
CORS(app, resources={r"/*": {"origins": "*"}}) 

# --- 2. 配置 OpenAI 客户端 ---
# 从环境变量中安全地获取 API 密钥
try:
    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except TypeError:
    print("错误: 请确保你已经正确设置了 OPENAI_API_KEY 环境变量。")
    client = None

# --- 3. 定义 AI 核心功能函数 ---

def expand_prompt_with_gpt(user_idea):
    """
    第一步: 使用 GPT-4o 将用户的简单想法扩展成6个结构化的设计方案。
    """
    if not client:
        raise ValueError("OpenAI API 客户端未初始化。")

    # 这是指导AI进行创作的“元指令”，非常关键！
    instruction_prompt = f"""
    You are a top-tier sock designer for the trendy brand "SockLab".
    Your task is to take a core user idea and expand it into 6 unique, detailed, and stylistically diverse design proposals.
    Each proposal MUST be a JSON object with the following fields:
    - "design_name": An attractive design name in Chinese.
    - "sock_type": The type of sock (e.g., "船袜" for no-show, "及踝袜" for ankle, "中筒袜" for crew, "长筒袜" for knee-high).
    - "style": The overall style (e.g., "卡通可爱" for cartoon cute, "赛博朋克" for cyberpunk, "复古像素" for retro pixel, "极简主义" for minimalist, "水彩手绘" for watercolor).
    - "prompt_en": A highly detailed English prompt for an AI image generator. This prompt should integrate all design elements and be as descriptive as possible to generate a high-quality image.

    Now, based on the user's idea "{user_idea}", generate 6 design proposals.
    You MUST return your response strictly as a JSON array of these objects, with no other explanatory text or code blocks.
    """

    print("正在调用 GPT-4o 进行 prompt 扩展...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": instruction_prompt},
            {"role": "user", "content": f"The user's idea is: '{user_idea}'"}
        ],
        response_format={"type": "json_object"} # 强制要求返回 JSON 格式
    )
    print("GPT-4o 响应成功。")
    
    # 解析返回的 JSON 内容
    result_json = json.loads(response.choices[0].message.content)
    # 通常 GPT 会把数组包在一个 key 里，比如 "designs" 或 "proposals"
    # 我们需要找到那个包含数组的 key
    if isinstance(result_json, dict):
        for key in result_json:
            if isinstance(result_json[key], list):
                return result_json[key]
    # 如果直接就是数组
    elif isinstance(result_json, list):
         return result_json
    
    raise ValueError("无法从 GPT 的响应中解析出设计方案数组。")


def generate_images_with_dalle(structured_prompts):
    """
    第二步: 使用 DALL-E 3 根据详细的 prompts 生成图片。
    """
    if not client:
        raise ValueError("OpenAI API 客户端未初始化。")

    generated_designs = []
    
    for design_proposal in structured_prompts:
        image_prompt = design_proposal.get("prompt_en")
        if not image_prompt:
            continue
            
        print(f"正在为 prompt 生成图片: '{image_prompt[:50]}...'")
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=image_prompt,
                n=1,
                size="1024x1024", # DALL-E 3 支持的尺寸
                quality="standard", # 或者 "hd"
                response_format="url" # 获取图片 URL
            )
            image_url = response.data[0].url
            
            # 将生成的 URL 和原始信息组合在一起
            generated_designs.append({
                "url": image_url,
                "prompt_en": design_proposal.get("prompt_en", ""),
                "design_name": design_proposal.get("design_name", "未命名设计")
            })
            print("图片生成成功。")
        except Exception as e:
            print(f"DALL-E 图片生成失败: {e}")
            # 如果失败，可以添加一个占位符
            generated_designs.append({
                "url": "https://placehold.co/1024x1024/ff0000/ffffff?text=Generation+Failed",
                "prompt_en": design_proposal.get("prompt_en"),
                "design_name": design_proposal.get("design_name", "生成失败")
            })

    return generated_designs


# --- 4. 定义后端 API 路由 ---

@app.route('/generate_designs', methods=['POST'])
def handle_generate_designs():
    """
    主流程 API: 接收前端想法 -> 扩展 Prompts -> 生成图片 -> 返回结果
    """
    if not client:
        return jsonify({"error": "服务器 OpenAI 配置错误"}), 500
        
    data = request.get_json()
    if not data or 'idea' not in data:
        return jsonify({"error": "请求中缺少 'idea' 字段"}), 400

    user_idea = data['idea']

    try:
        # 第1步: 扩展成6个详细方案
        structured_prompts = expand_prompt_with_gpt(user_idea)
        
        # 第2步: 根据方案生成6张图片
        final_designs = generate_images_with_dalle(structured_prompts)
        
        # 将完整结果返回给前端
        return jsonify(final_designs)

    except Exception as e:
        print(f"处理 /generate_designs 时发生错误: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/regenerate_image', methods=['POST'])
def handle_regenerate_image():
    """
    次流程 API: 接收修改后的单个 prompt，重新生成一张图片
    """
    if not client:
        return jsonify({"error": "服务器 OpenAI 配置错误"}), 500

    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "请求中缺少 'prompt' 字段"}), 400

    image_prompt = data['prompt']
    
    # 这里我们复用图片生成函数，但只处理一个 prompt
    mock_proposal = [{"prompt_en": image_prompt, "design_name": "自定义修改"}]

    try:
        regenerated_design = generate_images_with_dalle(mock_proposal)
        if regenerated_design:
            # 返回单个结果对象
            return jsonify(regenerated_design[0])
        else:
            return jsonify({"error": "无法生成图片"}), 500
    except Exception as e:
        print(f"处理 /regenerate_image 时发生错误: {e}")
        return jsonify({"error": str(e)}), 500


# --- 5. 启动服务器 ---
if __name__ == '__main__':
    # 监听 5001 端口，并允许外部访问
    app.run(host='0.0.0.0', port=5001, debug=True)

