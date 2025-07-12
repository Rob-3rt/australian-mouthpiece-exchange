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
  console.log('Making request to:', url);
  try {
    const res = await api.get(url);
    console.log('Response received:', res);
    console.log('Response data:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getListings:', error);
    console.error('Error response:', error.response);
    throw error;
  }
} 