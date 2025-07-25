// 优秀设计样例数据
export interface DesignExample {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  tags: string[];
  style: 'casual' | 'business' | 'sport' | 'artistic' | 'festive';
}

export const designExamples: DesignExample[] = [
  {
    id: 1,
    title: "万圣节蝙蝠主题",
    description: "神秘的蝙蝠图案，完美的万圣节装扮",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/1E180046-2710-4A52-BF5A.PNG",
    prompt: "创作万圣节主题的黄色中筒袜，配上蝙蝠图案，神秘又时尚",
    tags: ["万圣节", "蝙蝠", "黑色", "紫色"],
    style: "festive"
  },
  {
    id: 2,
    title: "苹果彩虹渐变运动袜",
    description: "活力四射的彩虹渐变，运动时尚的完美选择",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/rainbowApple.png",
    prompt: "设计一双彩虹渐变的中筒运动袜，从脚踝到小腿呈现七彩过渡效果",
    tags: ["彩虹", "渐变", "运动", "中筒"],
    style: "sport"
  },
  {
    id: 3,
    title: "几何拼色人物肖像",
    description: "采用立体派风格绘制的多女性面孔图案，色彩鲜艳，视觉冲击力强，展现艺术与时尚的融合",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/53601751198880_.pic.jpg",
    prompt: "创作黑白相间的细条纹商务袜，简约优雅适合正式场合",
    tags: ["立体派", "抽象", "人物肖像", "艺术风格", "红蓝黄"],
    style: "casual"
  },
  {
    id: 4,
    title: "可爱小熊图案",
    description: "萌萌的小熊图案，少女心满满的可爱设计",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/2025-06-27T22-15-04.png",
    prompt: "设计米色背景的船袜，上面有小熊图案",
    tags: ["小熊", "棕色", "可爱", "爱心"],
    style: "casual"
  },
  {
    id: 5,
    title: "星空夜景主题",
    description: "深蓝星空配金色星星，浪漫的夜景主题",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/night_stars.jpg",
    prompt: "创作深蓝色长筒袜，装饰金色星星和银色月亮，营造浪漫星空效果",
    tags: ["星空", "蓝色", "星星", "浪漫"],
    style: "casual"
  },
  {
    id: 6,
    title: "几何拼接艺术",
    description: "现代几何图案拼接，艺术感十足的设计",
    imageUrl: "https://raw.githubusercontent.com/ringoforme/sock-whisperer-design-lab/main/src/image/22FC413F-55A9-4191-BF5B-514548D6DDF1.jpg",
    prompt: "设计现代几何拼接图案的袜子，使用多种颜色和形状组合",
    tags: ["几何", "拼接", "现代", "艺术"],
    style: "casual"
  }
];

// 常用prompt快捷按钮数据
export const quickPrompts = [
  {
    id: 1,
    label: "❤️ 情人节主题",
    prompt: "一双情人节主题的艺术风格袜子，主色调为温暖的橙色与柔和的粉色，整体图案浪漫而富有节日氛围。袜面布满手绘风格的爱心图案、信封、玫瑰花朵和丝带图形，呈现出轻快的节奏和对称的美感。图案以橙色和粉色为主，辅以少量奶油白和金色点缀，构成明亮甜美的视觉效果。设计风格融合了现代插画与复古卡片元素，整体视觉柔和圆润。袜口为浅粉色罗纹，袜子平铺展开如一幅节日贺卡般温馨浪漫，适合情人节送礼或穿搭。",
    category: "festive"
  },
  {
    id: 2,
    label: "🎨 鲜艳野兽派",
    prompt: "一双艺术风格的袜子，灵感来自马蒂斯的野兽派绘画，色彩极为鲜艳，大胆使用非自然的对比色块，如橙、绿、紫、蓝。图案为自由流动的女性剪影和植物图形，构图不对称但动感强烈，袜口为明亮的绿色。",
    category: "colorful"
  },
  {
    id: 3,
    label: "🏃‍♀️ 运动风格",
    prompt: "一双现代运动风格的袜子，图案由动感的线条与锐利几何图形组成，线条呈现出速度感和流动感，如斜向加速的条纹、箭头、波浪或断裂线。配色以黑、白、电光蓝和荧光绿为主，形成强烈的运动氛围。袜子整体设计贴合健身和跑步使用，袜口为罗纹设计，图案呈现流线型分布，视觉上具冲击力与动势。",
    category: "sport"
  },
  {
    id: 4,
    label: "🪩 Vaporwave霓虹",
    prompt: "一双Vaporwave风格的艺术袜子，图案充满复古赛博美学元素，如解构的人脸雕塑、像素太阳、棕榈树剪影、3D网格地面和CRT电视信号图形。整体色调以霓虹粉、薄荷绿、电光蓝、薰衣草紫和淡黄色为主，营造出梦幻、虚拟又怀旧的电音氛围。图案呈非对称排布，模拟早期电脑界面与错乱的视觉图像。袜口为渐变色罗纹设计，整体风格带有迷幻感和数字空间感，适合电子音乐爱好者、潮流玩家或沉浸式夜生活穿搭。",
    category: "colorful"
  }
];
