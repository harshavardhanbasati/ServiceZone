const API_BASE = '/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('sz_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

  // Services
  getServices: (params = '') => apiRequest(`/services${params}`),
  getService: (slugOrId) => apiRequest(`/services/${slugOrId}`),

  // Slots & Public Tracking
  getAvailableSlots: (params = '') => apiRequest(`/slots/available${params}`),
  trackRepairPublic: (refCode) => apiRequest(`/public/track/${refCode}`),

  // Customer Bookings
  createBooking: (payload) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getMyBookings: (status = '') => apiRequest(`/bookings/my${status ? `?status_filter=${status}` : ''}`),
  getBookingDetail: (id) => apiRequest(`/bookings/${id}`),
  cancelBooking: (id, reason) => apiRequest(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  rescheduleBooking: (id, newSlotId) => apiRequest(`/bookings/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ new_slot_id: newSlotId }) }),
  getBookingUpdates: (id) => apiRequest(`/bookings/${id}/updates`),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Admin
  getDashboardMetrics: () => apiRequest('/admin/dashboard'),
  getAdminServices: () => apiRequest('/admin/services'),
  createAdminService: (payload) => apiRequest('/admin/services', { method: 'POST', body: JSON.stringify(payload) }),
  updateAdminService: (id, payload) => apiRequest(`/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getAdminSlots: (date = '') => apiRequest(`/admin/slots${date ? `?date=${date}` : ''}`),
  batchCreateSlots: (payload) => apiRequest('/admin/slots/batch', { method: 'POST', body: JSON.stringify(payload) }),
  toggleSlot: (id, isActive) => apiRequest(`/admin/slots/${id}?is_active=${isActive}`, { method: 'PATCH' }),
  getAdminBookings: (params = '') => apiRequest(`/admin/bookings${params}`),
  updateAppointmentStatus: (id, status, notes) => apiRequest(`/admin/bookings/${id}/appointment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ appointment_status: status, reason_or_notes: notes })
  }),
  updateRepairStatus: (id, repairStatus, note, quotedPrice = null, finalPrice = null) => apiRequest(`/admin/bookings/${id}/repair-status`, {
    method: 'PATCH',
    body: JSON.stringify({ repair_status: repairStatus, note, quoted_price: quotedPrice, final_price: finalPrice })
  }),
  getAdminCustomers: () => apiRequest('/admin/customers'),
  getAdminSettings: () => apiRequest('/admin/settings'),
};
