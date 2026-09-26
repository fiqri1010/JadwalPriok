import { ShiftItemConfig } from '../types';

/**
 * Convert RGB/Hex color string to RGB numbers
 */
export function hexOrRgbToRgb(colorStr: string): { r: number; g: number; b: number } | null {
    if (!colorStr) return null;
    const clean = colorStr.trim().toLowerCase();

    // Check RGB format: rgb(r, g, b)
    const rgbMatch = clean.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
        };
    }

    // Check Hex format: #RRGGBB or #RGB
    let hex = clean.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
        };
    }

    return null;
}

/**
 * Calculate Euclidean color distance between two RGB colors (0 to ~441)
 */
export function calculateColorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

/**
 * Find closest matching shift given a cell color hex/rgb and tolerance threshold
 */
export function findClosestShiftByColor(
    cellColorStr: string,
    availableShifts: ShiftItemConfig[],
    maxTolerance = 65
): ShiftItemConfig | null {
    const targetRgb = hexOrRgbToRgb(cellColorStr);
    if (!targetRgb) return null;

    let closestShift: ShiftItemConfig | null = null;
    let minDistance = Infinity;

    for (const shift of availableShifts) {
        const shiftHex = shift.visual.solidColor || shift.visual.colorStops[0]?.color;
        const shiftRgb = hexOrRgbToRgb(shiftHex);
        if (!shiftRgb) continue;

        const dist = calculateColorDistance(targetRgb, shiftRgb);
        if (dist < minDistance && dist <= maxTolerance) {
            minDistance = dist;
            closestShift = shift;
        }
    }

    return closestShift;
}
