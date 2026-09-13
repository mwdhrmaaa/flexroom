import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidAchievement,
  getAllAchievements,
  getAchievementById,
  saveAchievement,
  deleteAchievementById
} from '../src/core/storage/achievement_storage.js';

class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}

describe('AchievementStorage Module', () => {
  it('should validate achievement schemas correctly', () => {
    assert.strictEqual(isValidAchievement({ id: 1, game: 'Elden Ring', title: 'Lord' }), true);
    assert.strictEqual(isValidAchievement({ id: 'bad', game: 'Elden Ring', title: 'Lord' }), false);
    assert.strictEqual(isValidAchievement({ id: 1, game: '   ', title: 'Lord' }), false);
    assert.strictEqual(isValidAchievement({ id: 1, game: 'Elden Ring', title: '   ' }), false);
    assert.strictEqual(isValidAchievement(null), false);
    assert.strictEqual(isValidAchievement({}), false);
  });

  it('should return empty list on empty or corrupted storage', () => {
    const storage = new MockStorage();
    assert.deepStrictEqual(getAllAchievements(storage), []);

    storage.setItem('flexroom_achievements', '{bad_json}');
    assert.deepStrictEqual(getAllAchievements(storage), []);
  });

  it('should save achievements and prepend new entries', () => {
    const storage = new MockStorage();
    const first = saveAchievement(
      { id: 101, game: 'Hades', title: 'Escaped', description: 'Beat the game' },
      storage
    );
    assert.strictEqual(first.length, 1);
    assert.strictEqual(first[0].title, 'Escaped');

    const second = saveAchievement(
      { id: 102, game: 'Sekiro', title: 'Immortal Severance', description: 'Finished' },
      storage
    );
    assert.strictEqual(second.length, 2);
    assert.strictEqual(second[0].id, 102);
    assert.strictEqual(second[1].id, 101);
  });

  it('should throw error when saving payload with empty game or title', () => {
    const storage = new MockStorage();
    assert.throws(() => saveAchievement({ game: '', title: 'Title' }, storage), /Game title and achievement name cannot be empty/);
    assert.throws(() => saveAchievement({ game: 'Game', title: '  ' }, storage), /Game title and achievement name cannot be empty/);
    assert.throws(() => saveAchievement(null, storage), /Achievement payload must be a valid object/);
  });

  it('should retrieve single achievement by id using getAchievementById', () => {
    const storage = new MockStorage();
    saveAchievement({ id: 201, game: 'Cyberpunk 2077', title: 'Legend of the Afterlife' }, storage);
    
    const found = getAchievementById(201, storage);
    assert.ok(found);
    assert.strictEqual(found.title, 'Legend of the Afterlife');

    const notFound = getAchievementById(999, storage);
    assert.strictEqual(notFound, null);
  });

  it('should delete achievement by id', () => {
    const storage = new MockStorage();
    saveAchievement({ id: 101, game: 'Hades', title: 'Escaped' }, storage);
    saveAchievement({ id: 102, game: 'Sekiro', title: 'Severance' }, storage);

    const afterDelete = deleteAchievementById(101, storage);
    assert.strictEqual(afterDelete.length, 1);
    assert.strictEqual(afterDelete[0].id, 102);
  });
});
