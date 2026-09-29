import React from 'react';
import { AppTheme } from '../types';
import { Tooltip } from './Tooltip';

interface HamburgerMenuButtonProps {
    isOpen: boolean;
    onToggle: () => void;
    theme: AppTheme;
    className?: string;
    title?: string;
    id?: string;
}

export const HamburgerMenuButton: React.FC<HamburgerMenuButtonProps> = ({
    isOpen,
    onToggle,
    theme,
    className = '',
    title,
    id,
}) => {
    const isWinamp = theme === 'winamp';
    const tooltipText = title || (isOpen ? 'Sembunyikan Menu Samping' : 'Tampilkan Menu Samping');
    const inputId = id || 'burger-nav-checkbox';

    if (isWinamp) {
        return (
            <Tooltip
                content={<span><strong>{tooltipText}</strong></span>}
                placement="bottom"
                containerClassName={`flex items-center ${className}`}
            >
                <label
                    className="custom-ui-switch cursor-pointer"
                    aria-label="Toggle Menu Samping"
                >
                    <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={onToggle}
                        aria-label="Toggle Sidebar Switch"
                    />
                    <div className="custom-ui-slider">
                        <div className="custom-ui-lights">
                            <span className="custom-ui-light-off" />
                            <span className="custom-ui-light-on" />
                        </div>
                    </div>
                </label>
            </Tooltip>
        );
    }

    return (
        <Tooltip
            content={<span><strong>{tooltipText}</strong></span>}
            placement="bottom"
            containerClassName={`flex items-center justify-center ${className}`}
        >
            <button
                type="button"
                id={inputId}
                onClick={onToggle}
                className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer select-none focus:outline-none hover:bg-black/5 dark:hover:bg-white/10 ${
                    theme === 'technical'
                        ? 'border border-[#111113] rounded-none bg-[#FFFFFF]'
                        : theme === 'paperSketch'
                        ? 'border border-[#2b2b2b]/40 shadow-[1px_1px_0px_#2b2b2b] bg-white'
                        : ''
                }`}
                aria-label={tooltipText}
                aria-expanded={isOpen}
            >
                <div
                    className={`burger ${isOpen ? 'is-active' : ''} ${
                        theme === 'technical'
                            ? 'burger-technical'
                            : theme === 'vista'
                            ? 'burger-vista'
                            : theme === 'dark'
                            ? 'burger-dark'
                            : theme === 'paperSketch'
                            ? 'burger-sketch'
                            : 'burger-default'
                    }`}
                >
                    <span />
                    <span />
                    <span />
                </div>
            </button>
        </Tooltip>
    );
};
