import { apiRequest } from "./api";

export interface CrudOptions<T> {
  endpoint: string;
  onSuccess?: (data: T[]) => void;
  onError?: (error: string) => void;
  setLoading?: (loading: boolean) => void;
  setError?: (error: string) => void;
}

export const fetchItems = async <T>({
  endpoint,
  onSuccess,
  onError,
  setLoading,
  setError,
}: CrudOptions<T>): Promise<T[] | null> => {
  try {
    if (setLoading) setLoading(true);
    
    const response = await apiRequest(endpoint);
    
    if (response.ok) {
      const data = await response.json();
      if (onSuccess) onSuccess(data);
      if (setError) setError("");
      return data;
    } else {
      const errorMessage = "Failed to fetch data";
      if (onError) onError(errorMessage);
      if (setError) setError(errorMessage);
      return null;
    }
  } catch (err) {
    const errorMessage = "Network error";
    if (onError) onError(errorMessage);
    if (setError) setError(errorMessage);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const createItem = async <T, U>(
  endpoint: string,
  data: U,
  onSuccess?: () => void,
  onError?: (error: string) => void,
  setError?: (error: string) => void
): Promise<T | null> => {
  try {
    const response = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      if (onSuccess) onSuccess();
      if (setError) setError("");
      return result;
    } else {
      const errorMessage = "Failed to create item";
      if (onError) onError(errorMessage);
      if (setError) setError(errorMessage);
      return null;
    }
  } catch (err) {
    const errorMessage = "Network error";
    if (onError) onError(errorMessage);
    if (setError) setError(errorMessage);
    return null;
  }
};

export const updateItem = async <T, U>(
  endpoint: string,
  id: number,
  data: U,
  onSuccess?: () => void,
  onError?: (error: string) => void,
  setError?: (error: string) => void
): Promise<T | null> => {
  try {
    const response = await apiRequest(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      if (onSuccess) onSuccess();
      if (setError) setError("");
      return result;
    } else {
      const errorMessage = "Failed to update item";
      if (onError) onError(errorMessage);
      if (setError) setError(errorMessage);
      return null;
    }
  } catch (err) {
    const errorMessage = "Network error";
    if (onError) onError(errorMessage);
    if (setError) setError(errorMessage);
    return null;
  }
};

export const deleteItem = async (
  endpoint: string,
  id: number,
  onSuccess?: () => void,
  onError?: (error: string) => void,
  setError?: (error: string) => void
): Promise<boolean> => {
  try {
    const response = await apiRequest(`${endpoint}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      if (onSuccess) onSuccess();
      if (setError) setError("");
      return true;
    } else {
      const errorMessage = "Failed to delete item";
      if (onError) onError(errorMessage);
      if (setError) setError(errorMessage);
      return false;
    }
  } catch (err) {
    const errorMessage = "Network error";
    if (onError) onError(errorMessage);
    if (setError) setError(errorMessage);
    return false;
  }
};

export const confirmDelete = (itemName: string = "this item"): boolean => {
  return confirm(`Are you sure you want to delete ${itemName}?`);
}; 