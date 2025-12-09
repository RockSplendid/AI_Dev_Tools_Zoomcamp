// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin.replace(':3000', ':5000');
const WS_BASE_URL = process.env.REACT_APP_WS_URL || API_BASE_URL;

export { API_BASE_URL, WS_BASE_URL };
