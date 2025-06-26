const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Pupils API
export const getPupils = () => apiCall('/pupils');

export const getPupil = (id: number) => apiCall(`/pupils/${id}`);

export const createPupil = (pupil: any) => 
  apiCall('/pupils', {
    method: 'POST',
    body: JSON.stringify(pupil),
  });

export const updatePupil = (id: number, pupil: any) =>
  apiCall(`/pupils/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pupil),
  });

export const deletePupil = (id: number) =>
  apiCall(`/pupils/${id}`, { method: 'DELETE' });

// Absences API
export const getMonthlyAbsences = (year: number, month: number) =>
  apiCall(`/absences/month/${year}/${month}`);

export const getPupilAbsences = (pupilId: number) =>
  apiCall(`/absences/pupil/${pupilId}`);

export const updateAbsence = (absence: any) =>
  apiCall('/absences', {
    method: 'PUT',
    body: JSON.stringify(absence),
  });

export const getMonthlyStats = (year: number, month: number) =>
  apiCall(`/absences/stats/${year}/${month}`);

// Alerts API
export const getPupilAlerts = (pupilId: number) =>
  apiCall(`/alerts/pupil/${pupilId}`);

export const createAlert = (alert: any) =>
  apiCall('/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });

// Import/Export API
export const importPupils = (fileData: string) =>
  apiCall('/import/pupils', {
    method: 'POST',
    body: JSON.stringify({ fileData }),
  });

export const exportCSV = (year: number, month: number) => {
  window.open(`${API_BASE_URL}/export/csv/${year}/${month}`, '_blank');
};

export const exportPDF = (year: number, month: number) => {
  window.open(`${API_BASE_URL}/export/pdf/${year}/${month}`, '_blank');
};

// Email API
export const getEmailSettings = () => apiCall('/email/settings');

export const updateEmailSettings = (settings: any) =>
  apiCall('/email/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });

export const sendEmail = (emailData: any) =>
  apiCall('/email/send', {
    method: 'POST',
    body: JSON.stringify(emailData),
  });