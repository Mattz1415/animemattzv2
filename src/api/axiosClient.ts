import axios, { AxiosError, AxiosResponse } from 'axios';

export const BASE_API_URL = 'https://www.sankavollerei.web.id';

// Event emitter listener for rate limiting & system alerts
type RateLimitListener = (message: string) => void;
const rateLimitListeners: Set<RateLimitListener> = new Set();

export const onRateLimitExceeded = (listener: RateLimitListener) => {
  rateLimitListeners.add(listener);
  return () => {
    rateLimitListeners.delete(listener);
  };
};

export const notifyRateLimitExceeded = (message: string) => {
  rateLimitListeners.forEach((listener) => listener(message));
};

export const axiosClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 7000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

let lastRateLimitWarning = 0;

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with 429 protection
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      const now = Date.now();
      // Throttle warning toast to once every 10 seconds to avoid spamming the user
      if (now - lastRateLimitWarning > 10000) {
        lastRateLimitWarning = now;
        const msg = 'API Rate limit exceeded (45 req/min cap). Please wait a few moments before requesting more content.';
        console.warn('[SankaVerse]', msg);
        notifyRateLimitExceeded(msg);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
