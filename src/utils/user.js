const USER_ID_STORAGE_KEY = 'userId';

function createUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getUserId() {
  if (typeof window === 'undefined') {
    return 'local-user';
  }

  const existingUserId = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existingUserId) {
    return existingUserId;
  }

  const nextUserId = createUuid();
  window.localStorage.setItem(USER_ID_STORAGE_KEY, nextUserId);
  return nextUserId;
}
