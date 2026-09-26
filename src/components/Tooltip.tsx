import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    placement?: TooltipPlacement;
    disabled?: boolean;
    delay?: number;
}

const VIEWPORT_MARGIN = 8;
const GAP = 8;

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    className = '',
    containerClassName = '',
    placement,
    disabled = false,
    delay = 0,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPositioned, setIsPositioned] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipId = useId();

    // Determine initial preferred placement from prop or class
    const initialPlacement: TooltipPlacement = placement
        ? placement
        : className.includes('tooltip-right')
        ? 'right'
        : className.includes('tooltip-bottom')
        ? 'bottom'
        : className.includes('tooltip-left')
        ? 'left'
        : 'top';

    const [coords, setCoords] = useState<{
        top: number;
        left: number;
        actualPlacement: TooltipPlacement;
    }>({
        top: 0,
        left: 0,
        actualPlacement: initialPlacement,
    });

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        if (triggerRect.width === 0 && triggerRect.height === 0) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;

        // Get actual rendered dimensions of tooltip if mounted
        const tooltipEl = tooltipRef.current;
        const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 140;
        const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 36;

        let targetPlacement: TooltipPlacement = initialPlacement;

        if (isMobile) {
            // On mobile, prefer top unless too close to top edge
            targetPlacement = triggerRect.top < 65 ? 'bottom' : 'top';
        } else {
            // Smart auto-flip detection
            if (targetPlacement === 'top' && triggerRect.top - tooltipHeight - GAP < VIEWPORT_MARGIN) {
                targetPlacement = 'bottom';
            } else if (targetPlacement === 'bottom' && triggerRect.bottom + tooltipHeight + GAP > viewportHeight - VIEWPORT_MARGIN) {
                targetPlacement = 'top';
            } else if (targetPlacement === 'right' && triggerRect.right + tooltipWidth + GAP > viewportWidth - VIEWPORT_MARGIN) {
                targetPlacement = triggerRect.left - tooltipWidth - GAP >= VIEWPORT_MARGIN ? 'left' : 'bottom';
            } else if (targetPlacement === 'left' && triggerRect.left - tooltipWidth - GAP < VIEWPORT_MARGIN) {
                targetPlacement = triggerRect.right + tooltipWidth + GAP <= viewportWidth - VIEWPORT_MARGIN ? 'right' : 'bottom';
            }
        }

        let calculatedLeft = 0;
        let calculatedTop = 0;

        switch (targetPlacement) {
            case 'top':
                calculatedLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
                calculatedTop = triggerRect.top - tooltipHeight - GAP;
                break;
            case 'bottom':
                calculatedLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
                calculatedTop = triggerRect.bottom + GAP;
                break;
            case 'right':
                calculatedLeft = triggerRect.right + GAP;
                calculatedTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
                break;
            case 'left':
                calculatedLeft = triggerRect.left - tooltipWidth - GAP;
                calculatedTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
                break;
        }

        // Viewport Collision Detection & Boundary Clamping (X & Y Axis)
        // Ensure tooltip never extends outside the viewport on any side
        const minLeft = VIEWPORT_MARGIN;
        const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - tooltipWidth - VIEWPORT_MARGIN);
        const clampedLeft = Math.min(Math.max(calculatedLeft, minLeft), maxLeft);

        const minTop = VIEWPORT_MARGIN;
        const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - tooltipHeight - VIEWPORT_MARGIN);
        const clampedTop = Math.min(Math.max(calculatedTop, minTop), maxTop);

        setCoords({
            left: Math.round(clampedLeft),
            top: Math.round(clampedTop),
            actualPlacement: targetPlacement,
        });
        setIsPositioned(true);
    }, [initialPlacement]);

    // Use useLayoutEffect before paint to measure and position without any visible flicker
    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
        } else {
            setIsPositioned(false);
        }
    }, [isOpen, updatePosition]);

    const showTooltip = useCallback(() => {
        if (disabled || !content) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsOpen(true);
            }, delay);
        } else {
            setIsOpen(true);
        }
    }, [disabled, content, delay]);

    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        setIsOpen(false);
        setIsPositioned(false);
    }, []);

    // Auto-hide and window resize/scroll event listeners
    useEffect(() => {
        if (!isOpen) return;

        // 2-second maximum display UX duration
        autoHideRef.current = setTimeout(() => {
            setIsOpen(false);
            setIsPositioned(false);
        }, 2000);

        const handleScroll = () => {
            updatePosition();
        };

        const handleResize = () => {
            updatePosition();
        };

        const handleGlobalClick = () => {
            setIsOpen(false);
            setIsPositioned(false);
        };

        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('click', handleGlobalClick, { capture: true });

        return () => {
            if (autoHideRef.current) clearTimeout(autoHideRef.current);
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleGlobalClick, { capture: true });
        };
    }, [isOpen, updatePosition]);

    if (!content) return <>{children}</>;

    const placementClass =
        coords.actualPlacement === 'bottom'
            ? 'tooltip-bottom'
            : coords.actualPlacement === 'right'
            ? 'tooltip-right'
            : coords.actualPlacement === 'left'
            ? 'tooltip-left'
            : '';

    return (
        <>
            <div
                ref={triggerRef}
                className={`tooltip-container ${containerClassName}`}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                aria-describedby={isOpen ? tooltipId : undefined}
            >
                {children}
            </div>

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        id={tooltipId}
                        role="tooltip"
                        className={`portal-tooltip-root fixed z-[99999] pointer-events-none select-none transition-opacity duration-150 ease-out ${
                            isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            willChange: 'transform, opacity',
                        }}
                    >
                        <div
                            className={`tooltip ${placementClass} ${className}`}
                            style={{
                                opacity: 1,
                                visibility: 'visible',
                                position: 'relative',
                                top: 'auto',
                                bottom: 'auto',
                                left: 'auto',
                                right: 'auto',
                                transform: 'none',
                                margin: 0,
                                animation: 'none',
                            }}
                        >
                            {content}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};
