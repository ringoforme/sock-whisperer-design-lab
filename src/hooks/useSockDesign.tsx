
import { useState, useCallback } from 'react';

type SockType = 'no-show' | 'crew' | 'knee-high';

type ThemeType = 'casual' | 'athletic' | 'festive' | 'halloween' | 'christmas' | 'summer' | 'winter' | 'spring' | 'fall';

type PatternType = 
  | 'solid' 
  | 'stripes' 
  | 'polka-dots' 
  | 'chevron' 
  | 'plaid'
  | 'pumpkins'
  | 'skulls'
  | 'bats'
  | 'candy-canes'
  | 'snowflakes'
  | 'hearts'
  | 'stars'
  | 'flowers';

interface SockDesign {
  type: SockType;
  baseColor: string;
  patternType: PatternType | null;
  patternColor: string;
  theme: ThemeType;
  description: string;
}

interface SockDesignHook {
  design: SockDesign;
  updateType: (type: SockType) => void;
  updateBaseColor: (color: string) => void;
  updatePattern: (pattern: PatternType | null) => void;
  updatePatternColor: (color: string) => void;
  updateTheme: (theme: ThemeType) => void;
  updateFromChatMessage: (message: string) => void;
  generateRandomDesign: () => void;
}

export function useSockDesign(): SockDesignHook {
  const [design, setDesign] = useState<SockDesign>({
    type: 'crew',
    baseColor: '#9b87f5', // Default purple
    patternType: 'polka-dots',
    patternColor: '#ffffff',
    theme: 'casual',
    description: 'A pair of purple crew socks with white polka dots'
  });

  const updateType = useCallback((type: SockType) => {
    setDesign(prev => ({ ...prev, type }));
  }, []);

  const updateBaseColor = useCallback((baseColor: string) => {
    setDesign(prev => ({ ...prev, baseColor }));
  }, []);

  const updatePattern = useCallback((patternType: PatternType | null) => {
    setDesign(prev => ({ ...prev, patternType }));
  }, []);

  const updatePatternColor = useCallback((patternColor: string) => {
    setDesign(prev => ({ ...prev, patternColor }));
  }, []);

  const updateTheme = useCallback((theme: ThemeType) => {
    setDesign(prev => ({ ...prev, theme }));
  }, []);

  const updateFromChatMessage = useCallback((message: string) => {
    // Simple parsing of user messages to extract design preferences
    // This is a basic implementation - a real system would use NLP
    const lowerMsg = message.toLowerCase();
    
    // Extract sock type
    if (lowerMsg.includes('no-show') || lowerMsg.includes('no show')) {
      updateType('no-show');
    } else if (lowerMsg.includes('knee') || lowerMsg.includes('knee-high') || lowerMsg.includes('knee high')) {
      updateType('knee-high');
    } else if (lowerMsg.includes('crew')) {
      updateType('crew');
    }
    
    // Extract colors
    if (lowerMsg.includes('purple')) {
      updateBaseColor('#9b87f5');
    } else if (lowerMsg.includes('blue')) {
      updateBaseColor('#D3E4FD');
    } else if (lowerMsg.includes('green')) {
      updateBaseColor('#F2FCE2');
    } else if (lowerMsg.includes('yellow')) {
      updateBaseColor('#FEF7CD');
    } else if (lowerMsg.includes('orange')) {
      updateBaseColor('#FEC6A1');
    } else if (lowerMsg.includes('pink')) {
      updateBaseColor('#FFDEE2');
    } else if (lowerMsg.includes('peach')) {
      updateBaseColor('#FDE1D3');
    } else if (lowerMsg.includes('gray') || lowerMsg.includes('grey')) {
      updateBaseColor('#F1F0FB');
    }
    
    // Extract patterns
    if (lowerMsg.includes('polka') || lowerMsg.includes('dots')) {
      updatePattern('polka-dots');
    } else if (lowerMsg.includes('stripe')) {
      updatePattern('stripes');
    } else if (lowerMsg.includes('chevron')) {
      updatePattern('chevron');
    } else if (lowerMsg.includes('plaid')) {
      updatePattern('plaid');
    } else if (lowerMsg.includes('solid')) {
      updatePattern(null);
    } else if (lowerMsg.includes('pumpkin')) {
      updatePattern('pumpkins');
    } else if (lowerMsg.includes('skull')) {
      updatePattern('skulls');
    } else if (lowerMsg.includes('bat')) {
      updatePattern('bats');
    } else if (lowerMsg.includes('candy') || lowerMsg.includes('candy cane')) {
      updatePattern('candy-canes');
    } else if (lowerMsg.includes('snowflake')) {
      updatePattern('snowflakes');
    } else if (lowerMsg.includes('heart')) {
      updatePattern('hearts');
    } else if (lowerMsg.includes('star')) {
      updatePattern('stars');
    } else if (lowerMsg.includes('flower')) {
      updatePattern('flowers');
    }
    
    // Extract themes
    if (lowerMsg.includes('halloween')) {
      updateTheme('halloween');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#6E59A5');  // Dark purple for Halloween
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('pumpkins');
      }
    } else if (lowerMsg.includes('christmas')) {
      updateTheme('christmas');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#E5DEFF');  // Light red for Christmas
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('candy-canes');
      }
    } else if (lowerMsg.includes('summer')) {
      updateTheme('summer');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#FEC6A1');  // Light orange for summer
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('flowers');
      }
    } else if (lowerMsg.includes('winter')) {
      updateTheme('winter');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#D3E4FD');  // Light blue for winter
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('snowflakes');
      }
    } else if (lowerMsg.includes('spring')) {
      updateTheme('spring');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#F2FCE2');  // Light green for spring
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('flowers');
      }
    } else if (lowerMsg.includes('fall') || lowerMsg.includes('autumn')) {
      updateTheme('fall');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#FEC6A1');  // Orange for fall
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('polka-dots');
      }
    } else if (lowerMsg.includes('athletic') || lowerMsg.includes('sport')) {
      updateTheme('athletic');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#F1F0FB');  // Gray for athletic
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('stripes');
      }
    } else if (lowerMsg.includes('festive')) {
      updateTheme('festive');
      if (!lowerMsg.includes('color')) {
        updateBaseColor('#FFDEE2');  // Pink for festive
      }
      if (!lowerMsg.includes('pattern')) {
        updatePattern('stars');
      }
    } else if (!lowerMsg.includes('theme')) {
      updateTheme('casual');
    }

    // Update description
    const typeText = design.type;
    const colorText = lowerMsg.includes('color') 
      ? lowerMsg.split('color')[1].split(' ')[1] || 'custom' 
      : design.baseColor === '#9b87f5' 
        ? 'purple' 
        : 'custom';
    const patternText = design.patternType || 'solid';

    setDesign(prev => ({
      ...prev,
      description: `A pair of ${colorText} ${typeText} socks with ${patternText} pattern`
    }));
  }, [design.type, design.baseColor, design.patternType]);

  const generateRandomDesign = useCallback(() => {
    const types: SockType[] = ['no-show', 'crew', 'knee-high'];
    const colors = ['#9b87f5', '#D3E4FD', '#F2FCE2', '#FEF7CD', '#FEC6A1', '#FFDEE2', '#FDE1D3', '#F1F0FB'];
    const patterns: (PatternType | null)[] = [
      null, 'polka-dots', 'stripes', 'chevron', 'plaid', 
      'pumpkins', 'skulls', 'bats', 'candy-canes', 'snowflakes', 
      'hearts', 'stars', 'flowers'
    ];
    const themes: ThemeType[] = [
      'casual', 'athletic', 'festive', 'halloween', 
      'christmas', 'summer', 'winter', 'spring', 'fall'
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    setDesign({
      type: randomType,
      baseColor: randomColor,
      patternType: randomPattern,
      patternColor: '#ffffff',
      theme: randomTheme,
      description: `A random pair of ${randomType} socks`
    });
  }, []);

  return {
    design,
    updateType,
    updateBaseColor,
    updatePattern,
    updatePatternColor,
    updateTheme,
    updateFromChatMessage,
    generateRandomDesign
  };
}
