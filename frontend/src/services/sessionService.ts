const SESSION_ID_KEY = 'ai_chat_session_id';
const USER_ID_KEY = 'ai_chat_user_id';

const createUuid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

export const sessionService = {
  createSessionId: (): string => createUuid(),

  getOrCreateSessionId: (): string => {
    const storage = getStorage();

    if (storage) {
      const existing = storage.getItem(SESSION_ID_KEY);
      if (existing) {
        return existing;
      }

      const created = createUuid();
      storage.setItem(SESSION_ID_KEY, created);
      return created;
    }

    return createUuid();
  },

  getOrCreateUserId: (): string => {
    const storage = getStorage();

    if (storage) {
      const existing = storage.getItem(USER_ID_KEY);
      if (existing) {
        return existing;
      }

      const created = `user_${createUuid()}`;
      storage.setItem(USER_ID_KEY, created);
      return created;
    }

    return `user_${createUuid()}`;
  },

  clearSession: (): void => {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(SESSION_ID_KEY);
      storage.removeItem(USER_ID_KEY);
    }
  },
};

export default sessionService;
