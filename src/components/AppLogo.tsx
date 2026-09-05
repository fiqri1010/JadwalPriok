import React, { useState } from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  showFallbackOnly?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = 'h-8 w-8', 
  size,
  showFallbackOnly = false 
}) => {
  const [imgError, setImgError] = useState(false);

  // If user dropped /logo.png or /logo.jpeg in their project, display it
  if (!showFallbackOnly && !imgError) {
    return (
      <img
        src="/logo.png"
        alt="JadwalPriok Logo"
        onError={() => setImgError(true)}
        className={`object-contain rounded-lg shrink-0 ${className}`}
        style={size ? { width: size, height: size } : undefined}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Exact vector illustration of the uploaded Desk Flip Calendar icon
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="JadwalPriok Calendar Logo"
    >
      <defs>
        {/* Soft background glow */}
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7AD1E8" />
          <stop offset="50%" stopColor="#F7B267" />
          <stop offset="100%" stopColor="#F4845F" />
        </linearGradient>

        {/* Calendar Page Gradient */}
        <linearGradient id="pageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2F3FC" />
          <stop offset="35%" stopColor="#F9F5EA" />
          <stop offset="75%" stopColor="#FCD5A4" />
          <stop offset="100%" stopColor="#F9A06C" />
        </linearGradient>

        {/* Top Header Bars */}
        <linearGradient id="redHeader" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="100%" stopColor="#E63946" />
        </linearGradient>
        <linearGradient id="cyanHeader" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2EC4B6" />
          <stop offset="100%" stopColor="#20A4F3" />
        </linearGradient>

        {/* Stand Gradient */}
        <linearGradient id="standGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2F2A4A" />
          <stop offset="50%" stopColor="#211A36" />
          <stop offset="100%" stopColor="#151024" />
        </linearGradient>

        {/* Ring Metallic Gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6C757D" />
          <stop offset="40%" stopColor="#CED4DA" />
          <stop offset="70%" stopColor="#495057" />
          <stop offset="100%" stopColor="#212529" />
        </linearGradient>

        {/* House Roof Gradient */}
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2EC4B6" />
          <stop offset="100%" stopColor="#1D8A7F" />
        </linearGradient>

        <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Rounded Squircle */}
      <rect x="4" y="4" width="120" height="120" rx="28" fill="#011627" />
      <rect x="5" y="5" width="118" height="118" rx="27" fill="url(#skyGrad)" opacity="0.18" />
      <rect x="4.5" y="4.5" width="119" height="119" rx="27.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {/* Base / Easel Stand (Triangular 3D Calendar Body) */}
      <g filter="url(#logoShadow)">
        {/* Left deep spine & back support */}
        <polygon points="20,40 40,24 104,24 108,102 18,102" fill="url(#standGrad)" />
        <polygon points="18,102 24,34 38,24 32,96" fill="#171228" opacity="0.6" />

        {/* Front Flip Sheet in 3D Perspective */}
        <path
          d="M 28 26 L 102 26 C 105 26 108 28 108 32 L 102 98 C 102 101 99 104 95 104 L 32 104 C 28 104 26 101 26 98 L 26 30 C 26 27 28 26 28 26 Z"
          fill="url(#pageGrad)"
          stroke="#1E1B2E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Top Header 1: Red Band */}
        <path
          d="M 26.5 29 C 26.5 27 28 26 30 26 L 100 26 C 102 26 103.5 27 103.5 29 L 102.5 39 L 26.5 39 Z"
          fill="url(#redHeader)"
        />
        {/* Top Header 2: Cyan/Teal Band */}
        <rect x="26.5" y="39" width="76" height="8" fill="url(#cyanHeader)" />

        {/* Calendar Grid Lines */}
        <g stroke="#3A405A" strokeWidth="0.8" strokeOpacity="0.35">
          {/* Horizontal lines */}
          <line x1="28" y1="56" x2="102" y2="56" />
          <line x1="29" y1="67" x2="101" y2="67" />
          <line x1="30" y1="78" x2="100" y2="78" />
          <line x1="31" y1="89" x2="98" y2="89" />

          {/* Vertical lines */}
          <line x1="42" y1="47" x2="43" y2="102" />
          <line x1="57" y1="47" x2="57" y2="102" />
          <line x1="72" y1="47" x2="72" y2="101" />
          <line x1="87" y1="47" x2="87" y2="100" />
        </g>

        {/* Grid Cells (Dots & numbers) */}
        {/* Selected date highlight (blue stamp) */}
        <rect x="31" y="49" width="8.5" height="5.5" rx="1.5" fill="#20A4F3" />
        {/* Little calendar day dots */}
        <circle cx="49.5" cy="52" r="1.4" fill="#011627" opacity="0.75" />
        <circle cx="64.5" cy="52" r="1.4" fill="#011627" opacity="0.75" />
        <circle cx="79.5" cy="52" r="1.4" fill="#011627" opacity="0.75" />
        <circle cx="94.5" cy="52" r="1.4" fill="#011627" opacity="0.75" />

        <circle cx="35" cy="61.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="49.5" cy="61.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="64.5" cy="61.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="79.5" cy="61.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="94.5" cy="61.5" r="1.4" fill="#011627" opacity="0.65" />

        <circle cx="35" cy="72.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="49.5" cy="72.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="64.5" cy="72.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="79.5" cy="72.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="94.5" cy="72.5" r="1.4" fill="#011627" opacity="0.65" />

        <circle cx="35" cy="83.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="49.5" cy="83.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="64.5" cy="83.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="79.5" cy="83.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="94.5" cy="83.5" r="1.4" fill="#011627" opacity="0.65" />

        <circle cx="35" cy="94.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="49.5" cy="94.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="64.5" cy="94.5" r="1.4" fill="#011627" opacity="0.65" />
        <circle cx="79.5" cy="94.5" r="1.4" fill="#011627" opacity="0.65" />

        {/* 3 Top Spiral Rings */}
        {/* Ring 1 */}
        <ellipse cx="44" cy="27" rx="3.5" ry="1.5" fill="#1A1828" />
        <path d="M 41 27 C 41 17 48 17 48 27" stroke="url(#ringGrad)" strokeWidth="3.2" strokeLinecap="round" />

        {/* Ring 2 */}
        <ellipse cx="65" cy="27" rx="3.5" ry="1.5" fill="#1A1828" />
        <path d="M 62 27 C 62 17 69 17 69 27" stroke="url(#ringGrad)" strokeWidth="3.2" strokeLinecap="round" />

        {/* Ring 3 */}
        <ellipse cx="86" cy="27" rx="3.5" ry="1.5" fill="#1A1828" />
        <path d="M 83 27 C 83 17 90 17 90 27" stroke="url(#ringGrad)" strokeWidth="3.2" strokeLinecap="round" />

        {/* Miniature House at Bottom-Left Corner */}
        <g id="miniatureHouse" transform="translate(10, 80)">
          {/* House Base / Ground */}
          <ellipse cx="14" cy="30" rx="12" ry="4" fill="#152B1E" opacity="0.6" />
          {/* Little green shrub */}
          <circle cx="5" cy="28" r="4" fill="#2A7B4C" />
          <circle cx="23" cy="29" r="3.5" fill="#2EC4B6" />

          {/* House Walls */}
          <rect x="7" y="15" width="14" height="13" rx="1" fill="#C25953" stroke="#3D1C1B" strokeWidth="1" />
          {/* Door */}
          <rect x="11.5" y="20" width="5" height="8" rx="1" fill="#201A18" />

          {/* House Roof (Cyan/Teal gable) */}
          <polygon points="5,16 14,7 23,16" fill="url(#roofGrad)" stroke="#114B44" strokeWidth="1" />
          {/* Roof Ridge Peak */}
          <line x1="14" y1="7" x2="14" y2="4" stroke="#2EC4B6" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};
