const STORAGE_KEY = 'flexroom_achievements';

/**
 * Validates whether an object complies with the Achievement schema.
 * @param {unknown} item
 * @returns {boolean}
 */
export function isValidAchievement(item) {
  if (!item || typeof item !== 'object') return false;
  return (
    typeof item.id === 'number' &&
    !Number.isNaN(item.id) &&
    typeof item.game === 'string' &&
    item.game.trim().length > 0 &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0
  );
}

/**
 * Retrieves all achievements safely from localStorage.
 * @param {Storage} [storage=window.localStorage]
 * @returns {Array<object>}
 */
export function getAllAchievements(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidAchievement);
  } catch (error) {
    console.warn('[AchievementStorage] Failed to read achievements from storage:', error);
    return [];
  }
}

/**
 * Retrieves a single achievement by ID.
 * @param {number} id
 * @param {Storage} [storage=window.localStorage]
 * @returns {object|null}
 */
export function getAchievementById(id, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const list = getAllAchievements(storage);
  const numericId = Number(id);
  return list.find((item) => item.id === numericId) || null;
}

/**
 * Saves a new achievement to the beginning of the list.
 * @param {object} payload
 * @param {Storage} [storage=window.localStorage]
 * @returns {Array<object>} Updated list
 */
export function saveAchievement(payload, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Achievement payload must be a valid object.');
  }

  const trimmedGame = String(payload.game || '').trim();
  const trimmedTitle = String(payload.title || '').trim();

  if (!trimmedGame || !trimmedTitle) {
    throw new Error('Game title and achievement name cannot be empty.');
  }

  const current = getAllAchievements(storage);
  const newRecord = {
    id: typeof payload.id === 'number' && !Number.isNaN(payload.id) ? payload.id : Date.now(),
    game: trimmedGame,
    title: trimmedTitle,
    image: String(payload.image || '').trim(),
    description: String(payload.description || '').trim(),
    date: payload.date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };

  const updated = [newRecord, ...current];
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[AchievementStorage] Failed to persist achievement:', error);
    }
  }
  return updated;
}

/**
 * Deletes an achievement by ID.
 * @param {number} id
 * @param {Storage} [storage=window.localStorage]
 * @returns {Array<object>} Updated list
 */
export function deleteAchievementById(id, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const current = getAllAchievements(storage);
  const updated = current.filter((item) => item.id !== id);
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[AchievementStorage] Failed to update storage after deletion:', error);
    }
  }
  return updated;
}
