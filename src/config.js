// Determine API base URL based on environment
let API_BASE_URL = '';

if (process.env.NODE_ENV === 'production') {
  // Production: use AWS API Gateway URL
  API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    'https://qtuapovv23.execute-api.ap-south-1.amazonaws.com';
} else {
  // Development: use empty string to leverage proxy from package.json (http://localhost:8000)
  API_BASE_URL = '';
}

export { API_BASE_URL };
