const API_URL = import.meta.env.VITE_API_URL;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

export const apiRequestWithFormData = async (
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_URL}${endpoint}`;
  const headers = getAuthHeadersForFormData();
  
  return fetch(url, {
    ...options,
    method: "POST",
    headers,
    body: formData,
  });
};

export { API_URL }; 