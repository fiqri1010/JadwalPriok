import React from 'react';
import { AppTheme } from '../types';
import { Tooltip } from './Tooltip';

interface HamburgerMenuButtonProps {
    isOpen: boolean;
    onToggle: () => void;
    theme: AppTheme;
    className?: string;
    title?: string;
}

export const HamburgerMenuButton: React.FC<HamburgerMenuButtonProps> = ({
    isOpen,
    onToggle,
    theme,
    className = '',
    title,
}) => {
    const isWinamp = theme === 'winamp';
    const tooltipText = title || (isOpen ? 'Sembunyikan Menu Samping' : 'Tampilkan Menu Samping');

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
            <label
                className={`burger p-2 -m-2 rounded-full transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 ${
                    theme === 'vista'
                        ? 'burger-vista'
                        : theme === 'dark' || theme === 'darkFluid'
                        ? 'burger-dark'
                        : 'burger-default'
                }`}
                htmlFor="burger-nav-checkbox"
                aria-label="Toggle Menu Samping"
            >
                <input
                    type="checkbox"
                    id="burger-nav-checkbox"
                    checked={isOpen}
                    onChange={onToggle}
                />
                <span />
                <span />
                <span />
            </label>
        </Tooltip>
    );
};
