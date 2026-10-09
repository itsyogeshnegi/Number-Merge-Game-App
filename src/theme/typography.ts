export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};

/**
 * Computes exact font size for a tile number based on digit count and cell dimensions
 */
export function getTileFontSize(value: number, tileSize: number): number {
  const digits = value.toString().length;
  if (digits <= 1) return Math.round(tileSize * 0.46);
  if (digits === 2) return Math.round(tileSize * 0.40);
  if (digits === 3) return Math.round(tileSize * 0.33);
  if (digits === 4) return Math.round(tileSize * 0.27);
  if (digits === 5) return Math.round(tileSize * 0.22);
  return Math.round(tileSize * 0.18);
}
