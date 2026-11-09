/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact';
  theme?: 'dark' | 'light';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  size = 'md',
}) => {
  // Official Standalone M Icon Asset
  if (variant === 'icon') {
    const iconSizes = {
      sm: 'w-7 h-7',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    };

    return (
      <div className={`relative inline-flex items-center justify-center ${iconSizes[size]} ${className}`}>
        <img
          src="/assets/aistudio/Made_For_You_Logo_Standalone_M_2647b9d4.png"
          alt="Made For You Music (M4UM) Icon"
          className="w-full h-full object-contain rounded-2xl shadow-sm"
        />
      </div>
    );
  }

  // Compact Placement: Standalone M icon + text badge
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <img
          src="/assets/aistudio/Made_For_You_Logo_Standalone_M_2647b9d4.png"
          alt="Made For You Music"
          className="w-8 h-8 object-contain rounded-lg shadow-xs"
        />
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-[#421078]'}`}>
            Made For You Music
          </span>
          <span className={`text-[10px] font-semibold mt-0.5 ${theme === 'dark' ? 'text-pink-300' : 'text-[#F51B91]'}`}>
            M4UM · By TMG®
          </span>
        </div>
      </div>
    );
  }

  // Official Full Wordmark Asset: "Made For You Music" with musical burst
  const logoHeights = {
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative flex items-center ${logoHeights[size]}`}>
        <img
          src="/assets/aistudio/Made_For_You_Music_Logo_Large_57b3dfcd.png"
          alt="Made For You Music · M4UM"
          className="h-full w-auto object-contain drop-shadow-xs"
        />
      </div>
      <div className="hidden sm:flex flex-col border-l border-purple-200/60 pl-2.5 leading-tight">
        <span className={`text-[10px] font-bold tracking-wider uppercase ${theme === 'dark' ? 'text-pink-300' : 'text-[#F51B91]'}`}>
          By TMG®
        </span>
        <span className={`text-[9px] font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-slate-500'}`}>
          M4UM · Aotearoa NZ
        </span>
      </div>
    </div>
  );
};
