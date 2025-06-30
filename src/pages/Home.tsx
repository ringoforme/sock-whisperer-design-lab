
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHeader from '@/components/HomeHeader';
import HeroSection from '@/components/HeroSection';
import DesignExamples from '@/components/DesignExamples';
import ApiKeyConfig from '@/components/ApiKeyConfig';
import { DesignExample } from '@/data/designExamples';

const Home = () => {
  const [showApiConfig, setShowApiConfig] = useState(false);
  const navigate = useNavigate();

  const handleExampleClick = (example: DesignExample) => {
    const params = new URLSearchParams({
      prompt: example.prompt,
      example: example.id.toString()
    });
    navigate(`/design?${params.toString()}`);
  };

  if (showApiConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50 flex items-center justify-center p-4">
        <ApiKeyConfig onConfigured={() => setShowApiConfig(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-red-50">
      <HomeHeader />

      <main>
        <HeroSection 
          showApiConfig={showApiConfig}
          setShowApiConfig={setShowApiConfig}
        />
        
        <DesignExamples onExampleClick={handleExampleClick} />
      </main>

      <footer className="py-8 px-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© 2025 Sox Lab. 由Sox Lab Studio提供支持。</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
