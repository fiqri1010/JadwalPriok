import React from 'react';
import { AppTheme } from '../types';

interface OffRelaxIconProps {
    theme?: string | AppTheme;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
}

export const OffRelaxIcon: React.FC<OffRelaxIconProps> = ({
    theme = 'default',
    className = 'w-4 h-4',
    style,
    title,
}) => {
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark' || theme === 'darkFluid';
    const isVista = theme === 'vista';

    // Theme adaptive colors
    let strokeColor = '#1F2937'; // Slate 800 for default light
    let pillowFill = '#FFFFFF';
    let bodyFill = '#F8FAFC';
    let accentStroke = '#1F2937';

    if (isWinamp) {
        strokeColor = '#00FF00';
        pillowFill = '#001A00';
        bodyFill = '#002B00';
        accentStroke = '#00FF00';
    } else if (isDark) {
        strokeColor = '#F8FAFC'; // Clean white for dark mode
        pillowFill = '#1E293B';
        bodyFill = '#334155';
        accentStroke = '#F8FAFC';
    } else if (isVista) {
        strokeColor = '#0F172A';
        pillowFill = '#E0F2FE'; // Vista sky blue tint
        bodyFill = '#BAE6FD';
        accentStroke = '#0284C7';
    }

    return (
        <svg
            viewBox="0 0 512 512"
            className={`inline-block shrink-0 ${className}`}
            style={style}
            xmlns="http://www.w3.org/2000/svg"
        >
            {title && <title>{title}</title>}

            {/* Pillow (Background Fluffy Rectangle) */}
            <path
                d="M 52 32 C 160 52, 352 52, 460 32 C 488 28, 498 62, 478 95 C 462 160, 462 230, 478 295 C 498 328, 468 338, 440 318 C 352 292, 160 292, 72 318 C 44 338, 14 328, 34 295 C 50 230, 50 160, 34 95 C 14 62, 24 28, 52 32 Z"
                fill={pillowFill}
                stroke={accentStroke}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Torso / Blanket (Bottom Rect) */}
            <path
                d="M 105 290 L 105 465 C 105 482, 120 492, 140 492 L 372 492 C 392 492, 407 482, 407 465 L 407 290 Z"
                fill={bodyFill}
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Left Arm Outer & Hand Loop */}
            <path
                d="M 105 290 L 40 185 C 32 168, 45 135, 75 125 L 182 85 C 195 80, 210 92, 202 105 L 175 145"
                fill="none"
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Left Arm Inner Triangle Hole */}
            <polygon
                points="170,145 90,185 170,225"
                fill={pillowFill}
                stroke={strokeColor}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Right Arm Outer & Hand Loop */}
            <path
                d="M 407 290 L 472 185 C 480 168, 467 135, 437 125 L 330 85 C 317 80, 302 92, 310 105 L 337 145"
                fill="none"
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Right Arm Inner Triangle Hole */}
            <polygon
                points="342,145 422,185 342,225"
                fill={pillowFill}
                stroke={strokeColor}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Ears (Left & Right) */}
            <path
                d="M 172 205 C 154 205, 154 228, 172 228"
                fill="none"
                stroke={strokeColor}
                strokeWidth="20"
                strokeLinecap="round"
            />
            <path
                d="M 340 205 C 358 205, 358 228, 340 228"
                fill="none"
                stroke={strokeColor}
                strokeWidth="20"
                strokeLinecap="round"
            />

            {/* Head Circle/Oval */}
            <path
                d="M 172 175 C 172 105, 210 65, 256 65 C 302 65, 340 105, 340 175 C 340 240, 302 272, 256 272 C 210 272, 172 240, 172 175 Z"
                fill={pillowFill}
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Hairline across forehead */}
            <path
                d="M 180 152 C 205 120, 230 112, 256 128 C 282 112, 307 120, 332 152"
                fill="none"
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
            />

            {/* Sleeping Closed Eyes (Arcs) */}
            <path
                d="M 202 202 C 210 220, 228 220, 236 202"
                fill="none"
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
            />
            <path
                d="M 276 202 C 284 220, 302 220, 310 202"
                fill="none"
                stroke={strokeColor}
                strokeWidth="22"
                strokeLinecap="round"
            />
        </svg>
    );
};

export const FishingIcon = OffRelaxIcon;
