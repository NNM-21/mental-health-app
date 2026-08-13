import { api } from './api';

// Shape confirmed live: [{ id, name, phone, description, hours, region }]
export async function getEmergencyContacts() {
  const { data } = await api.get('/api/emergency-contacts');
  return data;
}
