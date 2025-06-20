
import React from 'react';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = "SoxLab工作室", children }) => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-8 h-8 rounded-md mr-2"></div>
        <h1 className="text-2xl font-bold text-sock-purple">{title}</h1>
      </Link>
      {children}
    </div>
  );
};

export default AppHeader;
