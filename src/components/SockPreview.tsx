
import React from 'react';

interface SockPreviewProps {
  type: 'no-show' | 'crew' | 'knee-high';
  baseColor: string;
  patternType: string | null;
  patternColor: string;
}

const SockPreview: React.FC<SockPreviewProps> = ({
  type,
  baseColor,
  patternType,
  patternColor
}) => {
  // Generate pattern style based on pattern type
  const getPatternStyle = () => {
    if (!patternType) return {};
    
    switch (patternType) {
      case 'polka-dots':
        return {
          backgroundImage: `radial-gradient(${patternColor} 10%, transparent 11%), radial-gradient(${patternColor} 10%, transparent 11%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          opacity: 0.7
        };
      case 'stripes':
        return {
          backgroundImage: `linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 50%, ${patternColor} 50%, ${patternColor} 75%, transparent 75%, transparent)`,
          backgroundSize: '20px 20px',
          opacity: 0.7
        };
      case 'chevron':
        return {
          backgroundImage: `linear-gradient(135deg, ${patternColor} 25%, transparent 25%), linear-gradient(225deg, ${patternColor} 25%, transparent 25%), linear-gradient(315deg, ${patternColor} 25%, transparent 25%), linear-gradient(45deg, ${patternColor} 25%, transparent 25%)`,
          backgroundSize: '20px 20px',
          opacity: 0.7
        };
      case 'plaid':
        return {
          backgroundImage: `linear-gradient(90deg, transparent 50%, ${patternColor} 50%), linear-gradient(0deg, transparent 50%, ${patternColor} 50%)`,
          backgroundSize: '20px 20px',
          opacity: 0.5
        };
      case 'pumpkins':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23ff7b00'/%3E%3Cpath d='M30,40 L70,40 L65,20 L35,20 Z' fill='%23006400'/%3E%3Cpath d='M40,60 L45,55 L50,60 L55,55 L60,60 Z' fill='%23000'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'skulls':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23fff'/%3E%3Ccircle cx='40' cy='35' r='5' fill='%23000'/%3E%3Ccircle cx='60' cy='35' r='5' fill='%23000'/%3E%3Cpath d='M35,50 L65,50 Q50,70 35,50 Z' fill='%23000'/%3E%3Crect x='40' y='70' width='20' height='5' fill='%23fff'/%3E%3Crect x='45' y='75' width='10' height='5' fill='%23fff'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'bats':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Cpath d='M50,20 L30,40 L20,35 L25,45 L20,55 L35,50 L50,70 L65,50 L80,55 L75,45 L80,35 L70,40 Z' fill='%23000'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'candy-canes':
        return {
          backgroundImage: `linear-gradient(45deg, ${patternColor} 25%, transparent 25%, transparent 50%, ${patternColor} 50%, ${patternColor} 75%, transparent 75%, transparent)`,
          backgroundSize: '10px 10px',
          opacity: 0.7
        };
      case 'snowflakes':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Cpath d='M50,10 L50,90 M10,50 L90,50 M25,25 L75,75 M25,75 L75,25' stroke='%23fff' stroke-width='5'/%3E%3Ccircle cx='50' cy='50' r='5' fill='%23fff'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'hearts':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Cpath d='M50,80 L20,50 A20,20 0 0,1 50,20 A20,20 0 0,1 80,50 Z' fill='%23ff3366'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'stars':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Cpath d='M50,10 L61,39 L92,39 L67,57 L77,87 L50,70 L23,87 L33,57 L8,39 L39,39 Z' fill='%23ffcc00'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      case 'flowers':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='10' fill='%23ffcc00'/%3E%3Ccircle cx='30' cy='50' r='15' fill='%23ff6699'/%3E%3Ccircle cx='70' cy='50' r='15' fill='%23ff6699'/%3E%3Ccircle cx='50' cy='30' r='15' fill='%23ff6699'/%3E%3Ccircle cx='50' cy='70' r='15' fill='%23ff6699'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          opacity: 0.7
        };
      default:
        return {};
    }
  };

  return (
    <div className="sock-preview-container animate-fade-in">
      <div className={`sock sock-${type}`}>
        <div className="sock-body" style={{ backgroundColor: baseColor }}>
          {patternType && (
            <div
              className="sock-pattern"
              style={getPatternStyle()}
            />
          )}
          <div className="sock-elastic"></div>
          <div className="sock-toe"></div>
        </div>
      </div>
    </div>
  );
};

export default SockPreview;
