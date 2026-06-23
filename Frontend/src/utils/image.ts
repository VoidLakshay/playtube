const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BASE_UPLOADS_URL = BASE_URL.replace('/api', '');

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) {
    // Return a fallback avatar
    return 'https://via.placeholder.com/32?text=User';
  }
  // If it's already a full URL (starts with http or https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // If it's a relative path, prepend the base uploads URL
  if (url.startsWith('/')) {
    return `${BASE_UPLOADS_URL}${url}`;
  }
  return `${BASE_UPLOADS_URL}/${url}`;
};

export const getFallbackAvatar = (): string => {
  return 'https://via.placeholder.com/32?text=User';
};
