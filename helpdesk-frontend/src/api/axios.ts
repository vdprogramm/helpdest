import axios from 'axios';

import {
  destroyChatSocket,
} from '../socket/chat.socket';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL,

  headers: {
    'Content-Type':
      'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => {
    console.log('[Axios Response]', response.config.url, response.data);
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      const isPublicPage =
        window.location.pathname === '/' ||
        window.location.pathname === '/support' ||
        window.location.pathname === '/login';

      if (!isPublicPage) {
        destroyChatSocket();
        localStorage.removeItem('accessToken');
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default api;