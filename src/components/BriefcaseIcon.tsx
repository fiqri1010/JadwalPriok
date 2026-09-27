import React from 'react';
import { AppTheme } from '../types';

interface BriefcaseIconProps {
    theme?: string | AppTheme;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
}

export const BriefcaseIcon: React.FC<BriefcaseIconProps> = ({
    theme = 'default',
    className = 'w-4 h-4',
    style,
    title,
}) => {
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark' || theme === 'darkFluid';

    // Black and White Line Art Palette
    // Light mode: Crisp black lines with solid white backing
    // Dark mode: Crisp white lines with deep black backing
    const strokeColor = isWinamp ? '#00FF00' : isDark ? '#FFFFFF' : '#18181B';
    const fillColor = isWinamp ? '#000000' : isDark ? '#121212' : '#FFFFFF';

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`inline-block shrink-0 ${className}`}
            style={style}
            xmlns="http://www.w3.org/2000/svg"
        >
            {title && <title>{title}</title>}

            {/* Top Handle */}
            <path
                d="M8 6.5V4.5C8 3.67157 8.67157 3 9.5 3H14.5C15.3284 3 16 3.67157 16 4.5V6.5"
                stroke={strokeColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Main Briefcase Body with B&W Fill & Crisp Line */}
            <rect
                x="2.5"
                y="6.5"
                width="19"
                height="14"
                rx="2.5"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="1.8"
                strokeLinejoin="round"
            />

            {/* Horizontal Flap Separation Line */}
            <path
                d="M2.5 12H21.5"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Vertical Accent Straps */}
            <path
                d="M7 6.5V20.5M17 6.5V20.5"
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
                opacity="0.8"
            />

            {/* Center Lock Clasp */}
            <rect
                x="10.5"
                y="10.5"
                width="3"
                height="3"
                rx="0.6"
                fill={strokeColor}
                stroke={fillColor}
                strokeWidth="0.5"
            />
        </svg>
    );
};
