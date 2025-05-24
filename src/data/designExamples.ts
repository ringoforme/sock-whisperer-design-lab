
// 优秀设计样例数据
export interface DesignExample {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  prompt: string;
  tags: string[];
  style: 'casual' | 'business' | 'sport' | 'festive';
}

export const designExamples: DesignExample[] = [
  {
    id: 1,
    title: "万圣节蝙蝠主题",
    description: "神秘的黑紫色蝙蝠图案，完美的万圣节装扮",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "创作万圣节主题的黑色船袜，配上紫色蝙蝠图案，神秘又时尚",
    tags: ["万圣节", "蝙蝠", "黑色", "紫色"],
    style: "festive"
  },
  {
    id: 2,
    title: "彩虹渐变运动袜",
    description: "活力四射的彩虹渐变，运动时尚的完美选择",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "设计一双彩虹渐变的中筒运动袜，从脚踝到小腿呈现七彩过渡效果",
    tags: ["彩虹", "渐变", "运动", "中筒"],
    style: "sport"
  },
  {
    id: 3,
    title: "简约商务条纹",
    description: "经典的黑白细条纹，商务场合的优雅选择",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "创作黑白相间的细条纹商务袜，简约优雅适合正式场合",
    tags: ["条纹", "商务", "黑白", "简约"],
    style: "business"
  },
  {
    id: 4,
    title: "可爱猫咪图案",
    description: "萌萌的小猫咪图案，少女心满满的可爱设计",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "设计粉色背景的船袜，上面有白色小猫咪图案和爱心装饰",
    tags: ["猫咪", "粉色", "可爱", "爱心"],
    style: "casual"
  },
  {
    id: 5,
    title: "星空夜景主题",
    description: "深蓝星空配金色星星，浪漫的夜景主题",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "创作深蓝色长筒袜，装饰金色星星和银色月亮，营造浪漫星空效果",
    tags: ["星空", "蓝色", "星星", "浪漫"],
    style: "casual"
  },
  {
    id: 6,
    title: "几何拼接艺术",
    description: "现代几何图案拼接，艺术感十足的设计",
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    prompt: "设计几何拼接图案的中筒袜，使用蓝色、橙色、白色三角形拼接",
    tags: ["几何", "拼接", "现代", "艺术"],
    style: "casual"
  }
];

// 常用prompt快捷按钮数据
export const quickPrompts = [
  {
    id: 1,
    label: "🎃 万圣节主题",
    prompt: "创作万圣节主题的袜子，包含南瓜、蝙蝠或骷髅图案，使用橙色和黑色配色",
    category: "festive"
  },
  {
    id: 2,
    label: "🌈 彩虹渐变",
    prompt: "设计一双彩虹渐变效果的袜子，颜色从红色过渡到紫色，充满活力",
    category: "colorful"
  },
  {
    id: 3,
    label: "⚡ 运动风格",
    prompt: "创作运动风格的袜子，使用动感条纹或几何图案，适合健身和跑步",
    category: "sport"
  },
  {
    id: 4,
    label: "💼 商务简约",
    prompt: "设计简约商务风格的袜子，使用经典颜色和低调图案，适合正式场合",
    category: "business"
  }
];
