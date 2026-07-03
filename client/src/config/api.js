// Central API configuration
// Uses environment variable in production, fallback to localhost in dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;

