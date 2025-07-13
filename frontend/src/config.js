// API Configuration
export const API_CONFIG = {
  // Production backend URL
  PRODUCTION_URL: 'https://api.mouthpieceexchange.org',
  // Local development URL
  LOCAL_URL: 'http://localhost:4000',
  // Get the appropriate URL based on environment
  getBaseURL: () => {
    // Check if we're in production (custom domain or Vercel)
    if (window.location.hostname === 'mouthpieceexchange.org' || 
        window.location.hostname === 'www.mouthpieceexchange.org' ||
        window.location.hostname === 'australian-mouthpiece-exchange.vercel.app') {
      return API_CONFIG.PRODUCTION_URL;
    }
    // Check for environment variable first
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Fallback to local for development
    return API_CONFIG.LOCAL_URL;
  }
}; 