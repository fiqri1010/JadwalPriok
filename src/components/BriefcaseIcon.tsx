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
    const isVista = theme === 'vista';

    // Theme color palette definitions
    let bodyColor = '#5C3E38'; // Default brown leather
    let handleColor = '#462D28';
    let strapColor = '#ECB237'; // Default golden yellow
    let buckleColor = '#F7D059';
    let buckleHighlight = '#FFF282';
    let outlineColor = '#38221D';

    if (isWinamp) {
        bodyColor = '#002200';
        handleColor = '#00FF00';
        strapColor = '#00FF00';
        buckleColor = '#00FF00';
        buckleHighlight = '#00FF00';
        outlineColor = '#00FF00';
    } else if (isDark) {
        bodyColor = '#523B33';
        handleColor = '#36241E';
        strapColor = '#F59E0B'; // Bright golden amber
        buckleColor = '#FBBF24';
        buckleHighlight = '#FEF08A';
        outlineColor = '#1F1916';
    } else if (isVista) {
        bodyColor = '#1E3A8A'; // Vista Aero Dark Blue
        handleColor = '#0F172A';
        strapColor = '#38BDF8'; // Aero Sky Blue
        buckleColor = '#7DD3FC';
        buckleHighlight = '#E0F2FE';
        outlineColor = '#0284C7';
    }

    return (
        <svg
            viewBox="0 0 100 100"
            className={`inline-block shrink-0 ${className}`}
            style={style}
            xmlns="http://www.w3.org/2000/svg"
        >
            {title && <title>{title}</title>}
            {/* Top Handle */}
            <path
                d="M 35 25 C 35 12, 65 12, 65 25"
                fill="none"
                stroke={isWinamp ? '#00FF00' : handleColor}
                strokeWidth="7"
                strokeLinecap="round"
            />

            {/* Main Briefcase Body */}
            <rect
                x="6"
                y="24"
                width="88"
                height="68"
                rx="10"
                fill={bodyColor}
                stroke={isWinamp ? '#00FF00' : outlineColor}
                strokeWidth={isWinamp ? '3' : '2'}
            />

            {/* Top Flap Division Line */}
            <path
                d="M 6 48 L 94 48"
                stroke={isWinamp ? '#00FF00' : outlineColor}
                strokeWidth="2"
                opacity="0.4"
            />

            {/* Left Vertical Strap */}
            <rect
                x="20"
                y="24"
                width="14"
                height="68"
                fill={strapColor}
            />

            {/* Right Vertical Strap */}
            <rect
                x="66"
                y="24"
                width="14"
                height="68"
                fill={strapColor}
            />

            {/* Center Lock / Latch */}
            <rect
                x="41"
                y="52"
                width="18"
                height="8"
                rx="3"
                fill={buckleColor}
                stroke={outlineColor}
                strokeWidth="1.5"
            />

            {/* Left Buckle */}
            <rect
                x="17"
                y="57"
                width="20"
                height="18"
                rx="4"
                fill={buckleColor}
                stroke={outlineColor}
                strokeWidth="1.5"
            />
            <rect
                x="22"
                y="61"
                width="10"
                height="10"
                rx="2"
                fill={bodyColor}
            />
            {/* Left Buckle Prong */}
            <rect
                x="25"
                y="58"
                width="4"
                height="16"
                rx="1"
                fill={buckleHighlight}
            />

            {/* Right Buckle */}
            <rect
                x="63"
                y="57"
                width="20"
                height="18"
                rx="4"
                fill={buckleColor}
                stroke={outlineColor}
                strokeWidth="1.5"
            />
            <rect
                x="68"
                y="61"
                width="10"
                height="10"
                rx="2"
                fill={bodyColor}
            />
            {/* Right Buckle Prong */}
            <rect
                x="71"
                y="58"
                width="4"
                height="16"
                rx="1"
                fill={buckleHighlight}
            />
        </svg>
    );
};
