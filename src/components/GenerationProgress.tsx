
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
  const [phase, setPhase] = useState<'analyzing' | 'generating' | 'finalizing'>('analyzing');
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
      '优化设计细节...'
    ],
    finalizing: [
      '完善设计细节...',
      '最后的润色处理...',
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
          // Phase 1: 0-35% (线性增长，3-5秒)
          if (prev < 35) {
            const increment = Math.random() * 3 + 2; // 2-5% 随机增量
            const newProgress = Math.min(prev + increment, 35);
            if (newProgress >= 30 && phase === 'analyzing') {
              setPhase('generating');
            }
            return newProgress;
          }
          // Phase 2: 35-70% (线性增长，8-12秒)
          else if (prev < 70) {
            const increment = Math.random() * 2 + 1; // 1-3% 随机增量
            const newProgress = Math.min(prev + increment, 70);
            if (newProgress >= 65 && phase === 'generating') {
              setPhase('finalizing');
            }
            return newProgress;
          }
          // Phase 3: 70-95% (缓慢随机增长)
          else if (prev < 95) {
            const increment = Math.random() * 1 + 0.5; // 0.5-1.5% 缓慢增量
            return Math.min(prev + increment, 95);
          }
          // 保持在95%，等待真实完成信号
          return prev;
        });
      }, 200); // 每200ms更新一次

      // 文字轮换
      textInterval = setInterval(() => {
        const messages = phaseMessages[phase];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setPhaseText(randomMessage);
      }, 2000); // 每2秒更换一次文字
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
        style={{
          background: 'linear-gradient(90deg, #e5deff 0%, #d3e4fd 100%)'
        }}
      />
      
      <style jsx>{`
        .progress-bar {
          background: linear-gradient(90deg, var(--sock-purple), var(--sock-dark-purple));
        }
      `}</style>
    </div>
  );
};

export default GenerationProgress;
