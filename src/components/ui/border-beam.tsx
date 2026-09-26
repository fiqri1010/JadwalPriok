import React from 'react';

export type BorderBeamSize = 'sm' | 'md' | 'line' | 'pulse-outside' | 'pulse-inner' | number;
export type BorderBeamTheme = 'dark' | 'light' | 'auto';
export type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset' | 'forest' | 'candy' | 'ice' | 'gold';

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    size?: BorderBeamSize;
    colorVariant?: BorderBeamColorVariant;
    theme?: BorderBeamTheme;
    duration?: number;
    borderRadius?: number;
    borderWidth?: number;
    active?: boolean;
    strength?: number;
    glowSize?: number;
    className?: string;
    style?: React.CSSProperties;
}

const COLOR_GRADIENTS: Record<BorderBeamColorVariant, string> = {
    colorful: 'conic-gradient(from 0deg, #FF0080 0deg, #FF8C00 25deg, #40E0D0 50deg, transparent 95deg, transparent 180deg, #40E0D0 180deg, #FF8C00 205deg, #FF0080 230deg, transparent 275deg, transparent 360deg)',
    forest: 'conic-gradient(from 0deg, #00FF00 0deg, #22c55e 30deg, #10b981 60deg, transparent 100deg, transparent 180deg, #00FF00 180deg, #22c55e 210deg, #10b981 240deg, transparent 280deg, transparent 360deg)',
    ocean: 'conic-gradient(from 0deg, #00a2ff 0deg, #4facfe 30deg, #00f2fe 60deg, transparent 100deg, transparent 180deg, #0072ff 180deg, #00a2ff 210deg, #4facfe 240deg, transparent 280deg, transparent 360deg)',
    candy: 'conic-gradient(from 0deg, #D0BCFF 0deg, #FF0080 30deg, #381E72 60deg, transparent 100deg, transparent 180deg, #D0BCFF 180deg, #FF0080 210deg, #381E72 240deg, transparent 280deg, transparent 360deg)',
    sunset: 'conic-gradient(from 0deg, #FF4500 0deg, #FF8C00 30deg, #FFD700 60deg, transparent 100deg, transparent 180deg, #FF4500 180deg, #FF8C00 210deg, #FFD700 240deg, transparent 280deg, transparent 360deg)',
    ice: 'conic-gradient(from 0deg, #E0F7FA 0deg, #80DEEA 30deg, #26C6DA 60deg, transparent 100deg, transparent 180deg, #E0F7FA 180deg, #80DEEA 210deg, #26C6DA 240deg, transparent 280deg, transparent 360deg)',
    gold: 'conic-gradient(from 0deg, #FFE082 0deg, #FFD54F 30deg, #FFB300 60deg, transparent 100deg, transparent 180deg, #FFE082 180deg, #FFD54F 210deg, #FFB300 240deg, transparent 280deg, transparent 360deg)',
    mono: 'conic-gradient(from 0deg, #ffffff 0deg, #9ca3af 30deg, #4b5563 60deg, transparent 100deg, transparent 180deg, #ffffff 180deg, #9ca3af 210deg, #4b5563 240deg, transparent 280deg, transparent 360deg)',
};

export const BorderBeam = React.forwardRef<HTMLDivElement, BorderBeamProps>(({
    children,
    size = 'md',
    colorVariant = 'colorful',
    theme = 'dark',
    duration = 3.5,
    borderRadius = 8,
    borderWidth = 2,
    active = true,
    strength = 1,
    glowSize = 1,
    className = '',
    style = {},
    ...rest
}, ref) => {
    const gradient = COLOR_GRADIENTS[colorVariant] || COLOR_GRADIENTS.colorful;
    const animDuration = `${duration}s`;

    if (!children) {
        if (!active) return null;
        return (
            <div
                ref={ref}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
                style={{
                    borderRadius: `${borderRadius}px`,
                    padding: `${borderWidth}px`,
                    ...style,
                }}
                {...rest}
            >
                <div
                    className="absolute -inset-[150%] m-auto pointer-events-none animate-[spin_linear_infinite]"
                    style={{
                        background: gradient,
                        animationDuration: animDuration,
                        opacity: strength,
                    }}
                />
                <div
                    className="absolute -inset-[120%] m-auto pointer-events-none blur-[4px] animate-[spin_linear_infinite]"
                    style={{
                        background: gradient,
                        animationDuration: animDuration,
                        opacity: 0.6 * strength * glowSize,
                    }}
                />
            </div>
        );
    }

    if (!active) {
        return (
            <div ref={ref} className={className} style={style} {...rest}>
                {children}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden ${className}`}
            style={{
                borderRadius: `${borderRadius + borderWidth}px`,
                padding: `${borderWidth}px`,
                ...style,
            }}
            {...rest}
        >
            {/* Primary rotating sharp beam */}
            <div
                className="absolute -inset-[200%] w-[500%] h-[500%] m-auto pointer-events-none animate-[spin_linear_infinite] z-0"
                style={{
                    background: gradient,
                    animationDuration: animDuration,
                    opacity: strength,
                }}
                aria-hidden="true"
            />

            {/* Glowing bloom ambient layer */}
            <div
                className="absolute -inset-[150%] w-[400%] h-[400%] m-auto pointer-events-none blur-[5px] animate-[spin_linear_infinite] z-0"
                style={{
                    background: gradient,
                    animationDuration: animDuration,
                    opacity: 0.7 * strength * glowSize,
                }}
                aria-hidden="true"
            />

            {/* Inner child wrapper sitting above beam */}
            <div
                className="relative z-10 w-full h-full overflow-hidden"
                style={{
                    borderRadius: `${borderRadius}px`,
                }}
            >
                {children}
            </div>
        </div>
    );
});

BorderBeam.displayName = 'BorderBeam';

export default BorderBeam;
