// Configuration for Backend URL
// For development, use relative path. 
// For production split setup, use the full URL of your local VPS API.

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocal ? '' : 'https://billing-api.ifastx.in';
