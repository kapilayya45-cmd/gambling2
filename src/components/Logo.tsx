// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-64 h-56" }) => {
  return (
    <div className={className + " relative"}>
      <img 
        src="/foxxy-neon-logo.svg" 
        alt="Foxxy Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
