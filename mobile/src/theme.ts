// Mobile theme tokens.
//
// These mirror the web design system in resources/css/app.css so the website
// and the downloadable app share one visual language: a charcoal-black brand
// on warm off-white paper, white cards, neutral borders, and pastel summary
// tiles. Hex values are sRGB conversions of the web's oklch() variables.
//
// Keep the key names stable — screens/components import these directly.
export const colors = {
  // Brand — deep charcoal/black, matching web --primary and the black sidebar.
  primary: '#111318',
  primaryDark: '#000000',
  // Subtle neutral fill behind icons/chips (web --secondary / --accent).
  primaryLight: '#f1f1f4',
  // Warm amber highlight, consistent with the web amber summary tile.
  accent: '#f59e0b',
  // Surfaces — warm off-white paper + white cards (web --background / --card).
  bg: '#fbfaf7',
  card: '#ffffff',
  border: '#e7e7ea',
  // Text (web --foreground / --muted-foreground).
  text: '#111318',
  textMuted: '#71717a',
  // Feedback (web --destructive + success).
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  success: '#16a34a',
  white: '#ffffff',
  // Pastel tile backgrounds mirroring the web summary cards (--tile-*).
  tileBlue: '#eef2ff',
  tileGreen: '#ecfdf3',
  tilePurple: '#f5f0ff',
  tileAmber: '#fef7e6',
  tileRose: '#fdf1f1',
};

export const spacing = (n: number) => n * 4;

// Matches the web --radius scale (0.75rem base): sm 8, md 10, lg 12, xl 16, 2xl 20.
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, xxl: 20, full: 999 };

export const font = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 };
