
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'analyzing' | 'generating' | 'optimizing' | 'finalizing'>('analyzing');
  const [phaseText, setPhaseText] = useState('分析您的设计需求...');

  const phaseMessages = {
    analyzing: [
      '分析您的设计需求...',
      '理解您的创意想法...',
      '准备设计元素...'
    ],
    generating: [
      '正在生成设计图案...',
      '创建独特的袜子设计...',
      '调配色彩和图案...',
      '构建设计框架...'
    ],
    optimizing: [
      '优化设计细节...',
      '调整色彩平衡...',
      '完善图案质量...',
      '精细化处理...'
    ],
    finalizing: [
      '最后的润色处理...',
      '质量检查中...',
      '即将完成...'
    ]
  };

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setPhase('analyzing');
      setPhaseText('分析您的设计需求...');
      return;
    }

    let interval: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;

    const startProgress = () => {
      interval = setInterval(() => {
        setProgress(prev => {
          // Phase 1: 0-25% (4-6秒，分析阶段)
          if (prev < 25) {
            const increment = Math.random() * 2 + 1.5; // 1.5-3.5% 增量
            const newProgress = Math.min(prev + increment, 25);
            if (newProgress >= 20 && phase === 'analyzing') {
              setPhase('generating');
            }
            return newProgress;
          }
          // Phase 2: 25-60% (10-15秒，主要生成阶段)
          else if (prev < 60) {
            const increment = Math.random() * 1.5 + 0.8; // 0.8-2.3% 增量
            const newProgress = Math.min(prev + increment, 60);
            if (newProgress >= 55 && phase === 'generating') {
              setPhase('optimizing');
            }
            return newProgress;
          }
          // Phase 3: 60-85% (17-21秒，优化阶段)
          else if (prev < 85) {
            const increment = Math.random() * 1 + 0.4; // 0.4-1.4% 增量
            const newProgress = Math.min(prev + increment, 85);
            if (newProgress >= 80 && phase === 'optimizing') {
              setPhase('finalizing');
            }
            return newProgress;
          }
          // Phase 4: 85-98% (持续缓慢增长，不卡住)
          else if (prev < 98) {
            const increment = Math.random() * 0.6 + 0.2; // 0.2-0.8% 缓慢增量
            return Math.min(prev + increment, 98);
          }
          // 保持在98%，等待真实完成信号
          return prev;
        });
      }, 300); // 每300ms更新一次，稍微放慢节奏

      // 文字轮换 - 每5秒更换一次，降低频率
      textInterval = setInterval(() => {
        const messages = phaseMessages[phase];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setPhaseText(randomMessage);
      }, 5000);
    };

    startProgress();

    return () => {
      if (interval) clearInterval(interval);
      if (textInterval) clearInterval(textInterval);
    };
  }, [isGenerating, phase]);

  // 当外部传递完成信号时，立即跳到100%
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      setProgress(100);
      setPhaseText('设计生成完成！');
      
      // 延迟500ms后回调
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, progress, onComplete]);

  if (progress === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="text-center">
        <div className="text-sm font-medium text-gray-700 mb-2">
          {phaseText}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(progress)}% 完成
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2 bg-gray-200"
      />
    </div>
  );
};

export default GenerationProgress;
