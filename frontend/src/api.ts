import axios from 'axios';
import { runClassification } from './mockClassifier';

const isStatic = import.meta.env.VITE_STATIC_BUILD === 'true' || !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API for static builds (GitHub Pages)
if (isStatic) {
  // Override axios post for /classify
  const originalPost = api.post;
  api.post = async (url: string, data: any) => {
    if (url === '/classify') {
      const result = runClassification(data);
      return { data: result } as any;
    }
    return originalPost(url, data);
  };
}

export const isMockMode = isStatic;
export default api;
