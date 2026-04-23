// Configuration for Backend URL
// For development, use relative path. 
// For production split setup, use the full URL of your local VPS API.

export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://billing-api.ifastx.in' 
  : ''; // Relative in dev
