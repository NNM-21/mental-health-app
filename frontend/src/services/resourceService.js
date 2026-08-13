import { api } from './api';

// Shape confirmed live: [{ id, title, type, url, category, created_at }]
export async function listResources(category) {
  const { data } = await api.get('/api/resources', {
    params: category ? { category } : {},
  });
  return data;
}
