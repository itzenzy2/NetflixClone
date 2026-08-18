import test from 'node:test';
import assert from 'node:assert/strict';

// Seed the pre-rebrand keys that migrateKeys() should move into the current keys.
const data = new Map();
data.set('netflix_clone_my_list', JSON.stringify([{ id: 1, media_type: 'movie', title: 'Legacy' }]));
data.set('netflix_clone_continue_watching', JSON.stringify([{ id: 2, media_type: 'tv', name: 'Legacy Show' }]));

globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => (data.has(key) ? data.get(key) : null),
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: (key) => data.delete(key),
  clear: () => data.clear(),
};

const storage = await import('../lib/storage.js');

test('migrates legacy storage keys to the current batflix keys', () => {
  assert.equal(data.has('netflix_clone_my_list'), false);
  assert.equal(data.has('netflix_clone_continue_watching'), false);

  assert.deepEqual(storage.getMyList(), [{ id: 1, media_type: 'movie', title: 'Legacy' }]);
  assert.deepEqual(storage.getContinueWatching(), [{ id: 2, media_type: 'tv', name: 'Legacy Show' }]);
});
