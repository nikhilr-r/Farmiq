// Central API configuration
// Uses environment variable in production, fallback to localhost in dev
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export default API_BASE;

