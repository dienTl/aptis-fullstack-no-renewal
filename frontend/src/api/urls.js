function defaultApiUrl() {
  if (typeof window === 'undefined') return 'http://localhost:8080/api';
  return `http://${window.location.hostname}:8080/api`;
}

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl();

export function backendOrigin() {
  return API_URL.replace(/\/api\/?$/, '');
}

export function socketUrl() {
  return `${backendOrigin()}/ws`;
}

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${backendOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}
