// Expo inlines EXPO_PUBLIC_ variables at build time. A store build must
// receive this through the EAS "production" environment, not localhost.
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredApiUrl ? configuredApiUrl.replace(/\/$/, '') : '';

export function requireApiUrl(): string {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured for this build.');
  }

  return API_URL;
}
