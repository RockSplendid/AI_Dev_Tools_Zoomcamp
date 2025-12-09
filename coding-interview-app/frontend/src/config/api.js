// API configuration - use empty string for same origin in production, localhost for dev
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
const WS_BASE_URL = process.env.REACT_APP_WS_URL || API_BASE_URL;

export { API_BASE_URL, WS_BASE_URL };
