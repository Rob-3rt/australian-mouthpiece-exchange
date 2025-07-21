import api from './axios.js';
 
export async function getListings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  const url = `/api/listings${params.toString() ? '?' + params.toString() : ''}`;
  return api.get(url).then(res => res.data);
} 