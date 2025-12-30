import { STORAGE_KEY } from './constants';

export const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return null;
  }
};

export const saveToStorage = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    lastSaved: new Date().toISOString()
  }));
};
