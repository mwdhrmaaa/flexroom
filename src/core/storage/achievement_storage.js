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
    typeof item.game === 'string' &&
    typeof item.title === 'string'
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
 * Saves a new achievement to the beginning of the list.
 * @param {object} payload
 * @param {Storage} [storage=window.localStorage]
 * @returns {Array<object>} Updated list
 */
export function saveAchievement(payload, storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  const current = getAllAchievements(storage);
  const newRecord = {
    id: payload.id || Date.now(),
    game: String(payload.game || '').trim(),
    title: String(payload.title || '').trim(),
    image: payload.image || '',
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
