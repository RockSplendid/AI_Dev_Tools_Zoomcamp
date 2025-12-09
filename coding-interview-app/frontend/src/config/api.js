// API configuration for production builds (Render uses env at build time)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || API_BASE_URL;

export { API_BASE_URL, WS_BASE_URL };
