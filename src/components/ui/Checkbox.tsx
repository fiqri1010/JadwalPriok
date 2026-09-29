import React from 'react';
import styled from 'styled-components';
import { AppTheme } from '../../types';

// ==========================================
// 1. TEMA DEFAULT & DARK: ANIMATED SVG CHECKBOX
// ==========================================
interface SvgWrapperProps {
    $theme: 'default' | 'dark';
    $size?: string;
    $disabled?: boolean;
}

const StyledSvgWrapper = styled.div<SvgWrapperProps>`
  display: inline-flex;
  align-items: center;
  user-select: none;
  opacity: ${(props) => (props.$disabled ? 0.45 : 1)};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};

  .container {
    cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: middle;
    line-height: 1;
    min-width: 24px;
    min-height: 24px;
    touch-action: manipulation;
  }

  .container input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: pointer;
  }

  .container svg {
    overflow: visible;
    width: ${(props) => props.$size || '1.35em'};
    height: ${(props) => props.$size || '1.35em'};
    display: block;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .container:hover:not(:has(input:disabled)) svg {
    transform: scale(1.08);
  }

  .container:active:not(:has(input:disabled)) svg {
    transform: scale(0.92);
  }

  .container:focus-within:not(:has(input:disabled)) svg {
    filter: drop-shadow(0 0 3px ${(props) => (props.$theme === 'dark' ? '#2dd4bf' : '#0d9488')});
  }

  .path {
    fill: none;
    stroke: ${(props) => (props.$theme === 'dark' ? '#a1a1aa' : '#64748b')};
    stroke-width: 6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease, stroke 0.3s ease;
    stroke-dasharray: 241 9999999;
    stroke-dashoffset: 0;
  }

  .container:hover:not(:has(input:disabled)) .path {
    stroke: ${(props) => (props.$theme === 'dark' ? '#e4e4e7' : '#334155')};
  }

  .container input:checked ~ svg .path {
    stroke: ${(props) => (props.$theme === 'dark' ? '#2dd4bf' : '#0d9488')};
    stroke-dasharray: 70.5096664428711 9999999;
    stroke-dashoffset: -262.2723388671875;
  }

  .container:hover:not(:has(input:disabled)) input:checked ~ svg .path {
    stroke: ${(props) => (props.$theme === 'dark' ? '#5eead4' : '#0f766e')};
  }
`;

// ==========================================
// 2. TEMA PAPER SKETCH / PENCILSKETCH CHECKBOX
// ==========================================
interface SketchWrapperProps {
    $size?: string;
    $disabled?: boolean;
}

const StyledSketchWrapper = styled.div<SketchWrapperProps>`
  display: inline-flex;
  align-items: center;
  user-select: none;
  opacity: ${(props) => (props.$disabled ? 0.45 : 1)};
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};

  /*checkbox container */
  .container {
    display: inline-block;
    position: relative;
    cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
    font-size: ${(props) => props.$size || '11px'};
    user-select: none;
    width: 1.35em;
    height: 1.35em;
    vertical-align: middle;
  }

  .container input {
    position: absolute;
    opacity: 0;
    cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
    width: 100%;
    height: 100%;
    margin: 0;
    z-index: 2;
  }

  .container .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 1.35em;
    width: 1.35em;
    background-color: #fdfcf0;
    border: 2.5px solid #1a1a1a;
    border-radius: 8% 92% 12% 88% / 87% 11% 89% 13%;
    box-shadow: 2.5px 2.5px 0px #1a1a1a;
    transition:
      transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
      box-shadow 0.2s;
  }

  .container:hover:not(:has(input:disabled)) .checkmark {
    transform: scale(1.05) rotate(2deg);
  }

  .container input:checked ~ .checkmark {
    background-color: #ff5722;
    border-radius: 92% 8% 88% 12% / 11% 87% 13% 89%;
    transform: scale(1.08) rotate(-2deg);
  }

  .container .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 0.32em;
    top: 0.08em;
    width: 0.28em;
    transform: translate(-50%, -50%) rotate(40deg);
    height: 0.58em;
    border: solid #1a1a1a;
    border-width: 0 0.22em 0.22em 0;
    border-radius: 1.5px;
  }

  /* checked */
  .container input:checked ~ .checkmark:after {
    display: block;
    animation: splash 0.3s forwards;
  }

  .container:focus-within:not(:has(input:disabled)) .checkmark {
    outline: 2px dashed #ff5722;
    outline-offset: 3px;
  }

  .container:active:not(:has(input:disabled)) .checkmark {
    transform: scale(0.9) translateY(4px);
    box-shadow: 0px 0px 0px #1a1a1a;
  }

  @keyframes splash {
    0% {
      transform: scale(0) rotate(40deg);
      opacity: 0;
    }
    70% {
      transform: scale(1.2) rotate(40deg);
    }
    100% {
      transform: scale(1) rotate(40deg);
      opacity: 1;
    }
  }
`;

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    theme?: AppTheme;
    size?: string;
    label?: React.ReactNode;
    containerClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = React.memo(({
    theme = 'default',
    size,
    label,
    containerClassName = '',
    checked,
    onChange,
    disabled,
    className = '',
    id,
    ...restProps
}) => {
    // 1. Tema Pencil Sketch / Paper Sketch
    if (theme === 'paperSketch') {
        return (
            <StyledSketchWrapper
                $size={size || '15px'}
                $disabled={disabled}
                className={containerClassName}
            >
                <label className="container" htmlFor={id}>
                    <input
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        className={className}
                        {...restProps}
                    />
                    <div className="checkmark" />
                </label>
                {label && <span className="ml-2.5 font-['Gochi_Hand'] text-base tracking-wide text-[#2b2b2b]">{label}</span>}
            </StyledSketchWrapper>
        );
    }

    // 2. Tema Default dan Dark: Animated SVG Checkbox
    if (theme === 'default' || theme === 'dark') {
        return (
            <StyledSvgWrapper
                $theme={theme === 'dark' ? 'dark' : 'default'}
                $size={size || '1.35em'}
                $disabled={disabled}
                className={containerClassName}
            >
                <label className="container" htmlFor={id}>
                    <input
                        type="checkbox"
                        id={id}
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        className={className}
                        {...restProps}
                    />
                    <svg viewBox="0 0 64 64">
                        <path
                            d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                            pathLength="575.0541381835938"
                            className="path"
                        />
                    </svg>
                    {label && <span className="ml-2 text-inherit">{label}</span>}
                </label>
            </StyledSvgWrapper>
        );
    }

    // 3. Fallback Tema Lain (Winamp, Vista)
    return (
        <label className={`inline-flex items-center gap-1.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${containerClassName}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                id={id}
                className={`cursor-pointer rounded transition-colors ${className}`}
                {...restProps}
            />
            {label && <span>{label}</span>}
        </label>
    );
});

export default Checkbox;
