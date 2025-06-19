import { DesignExample } from '@/types/design';

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
}

export const designExamples: DesignExample[] = [
  {
    id: 1,
    imageUrl: '/design-examples/geometric.png',
    prompt: '设计一双现代几何图案的袜子，使用简洁的线条和形状',
    label: '几何图案'
  },
  {
    id: 2,
    imageUrl: '/design-examples/rainbow.png',
    prompt: '设计一双彩虹渐变色的袜子，颜色从红色到紫色平滑过渡',
    label: '彩虹渐变'
  },
  {
    id: 3,
    imageUrl: '/design-examples/minimalist.png',
    prompt: '设计一双极简主义风格的袜子，使用单色调和简单的线条',
    label: '极简风格'
  },
  {
    id: 4,
    imageUrl: '/design-examples/sports.png',
    prompt: '设计一双现代运动风格的袜子，适合日常运动穿着',
    label: '运动风格'
  }
];

export const quickPrompts = [
  {
    id: 'geometric',
    label: '几何图案',
    prompt: '设计一双现代几何图案的袜子，使用简洁的线条和形状'
  },
  {
    id: 'christmas',
    label: '圣诞节主题',
    prompt: '设计一双温馨的圣诞节主题袜子，包含雪花、圣诞树、铃铛等节日元素，使用红色、绿色、白色的经典圣诞配色'
  },
  {
    id: 'minimalist',
    label: '极简风格',
    prompt: '设计一双极简主义风格的袜子，使用单色调和简单的线条'
  },
  {
    id: 'sports',
    label: '运动风格',
    prompt: '设计一双现代运动风格的袜子，适合日常运动穿着'
  }
];
