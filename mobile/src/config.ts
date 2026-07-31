// Base URL of the Laravel API. Set EXPO_PUBLIC_API_URL in mobile/.env.
// Expo inlines any variable prefixed with EXPO_PUBLIC_ at build time.
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api'
).replace(/\/$/, '');
