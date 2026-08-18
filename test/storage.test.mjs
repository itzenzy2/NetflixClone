import test from 'node:test';
import assert from 'node:assert/strict';

function createStore() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
    get size() {
      return data.size;
    },
  };
}

const store = createStore();
globalThis.window = {};
globalThis.localStorage = store;

const storage = await import('../lib/storage.js');

test.beforeEach(() => {
  store.clear();
});

test('getMyList returns an empty list when nothing is stored', () => {
  assert.deepEqual(storage.getMyList(), []);
  assert.equal(storage.getMyListCount(), 0);
});

test('addToMyList adds an item with a timestamp and normalizes media_type', () => {
  const before = Date.now();
  const list = storage.addToMyList({ id: 1, title: 'The Dark Knight' });
  const after = Date.now();

  assert.equal(list.length, 1);
  assert.equal(list[0].media_type, 'movie');
  assert.equal(list[0].title, 'The Dark Knight');
  assert.ok(list[0].addedAt >= before && list[0].addedAt <= after);
});

test('addToMyList prepends items and does not duplicate the same title', () => {
  storage.addToMyList({ id: 1, media_type: 'movie', title: 'First' });
  const list = storage.addToMyList({ id: 2, media_type: 'movie', title: 'Second' });

  assert.equal(list.length, 2);
  assert.equal(list[0].title, 'Second');

  const deduped = storage.addToMyList({ id: 1, media_type: 'movie', title: 'First' });
  assert.equal(deduped.length, 2);
});

test('a movie and a TV show with the same id are treated separately', () => {
  storage.addToMyList({ id: 7, media_type: 'movie', title: 'Movie' });
  const list = storage.addToMyList({ id: 7, media_type: 'tv', name: 'Series' });

  assert.equal(list.length, 2);
});

test('removeFromMyList removes by id and media_type', () => {
  storage.addToMyList({ id: 1, media_type: 'movie', title: 'A' });
  storage.addToMyList({ id: 2, media_type: 'movie', title: 'B' });

  const list = storage.removeFromMyList(1, 'movie');
  assert.equal(list.length, 1);
  assert.equal(list[0].title, 'B');
  assert.equal(storage.isInMyList(1, 'movie'), false);
  assert.equal(storage.isInMyList(2, 'movie'), true);
});

test('clearMyList empties the watchlist', () => {
  storage.addToMyList({ id: 1, media_type: 'movie', title: 'A' });
  const list = storage.clearMyList();
  assert.deepEqual(list, []);
  assert.equal(storage.getMyListCount(), 0);
});

test('saveWatchProgress adds an entry and moves repeats to the front', () => {
  storage.saveWatchProgress({ id: 1, media_type: 'movie', title: 'A' });
  storage.saveWatchProgress({ id: 2, media_type: 'movie', title: 'B' });

  const list = storage.saveWatchProgress({ id: 1, media_type: 'movie', title: 'A' });
  assert.equal(list.length, 2);
  assert.equal(list[0].id, 1);
});

test('saveWatchProgress caps the list at 12 entries', () => {
  for (let i = 0; i < 20; i += 1) {
    storage.saveWatchProgress({ id: i, media_type: 'movie', title: `Movie ${i}` });
  }
  const list = storage.getContinueWatching();
  assert.equal(list.length, 12);
  assert.equal(list[0].id, 19);
});

test('saveWatchProgress records starting progress and updateWatchProgress clamps it', () => {
  storage.saveWatchProgress({ id: 1, media_type: 'movie', title: 'A' });
  assert.equal(storage.getContinueWatching()[0].progress, 0.03);

  const bumped = storage.updateWatchProgress(1, 'movie', { progress: 0.4 });
  assert.equal(bumped[0].progress, 0.4);

  // Progress is clamped to the 0..1 range
  const overflow = storage.updateWatchProgress(1, 'movie', { progress: 1.4 });
  assert.equal(overflow[0].progress, 1);
  const underflow = storage.updateWatchProgress(1, 'movie', { progress: -0.5 });
  assert.equal(underflow[0].progress, 0);

  // Explicit progress on save is respected
  storage.saveWatchProgress({ id: 2, media_type: 'movie', title: 'B', progress: 0.62 });
  assert.equal(storage.getContinueWatching()[0].progress, 0.62);
});

test('updateWatchProgress merges fields and moves the entry to the front', () => {
  storage.saveWatchProgress({ id: 1, media_type: 'tv', name: 'Series', season: 1, episode: 1 });
  storage.saveWatchProgress({ id: 2, media_type: 'movie', title: 'Movie' });

  const list = storage.updateWatchProgress(1, 'tv', { season: 2, episode: 3 });
  assert.equal(list[0].season, 2);
  assert.equal(list[0].episode, 3);
  assert.equal(list.length, 2);
});

test('removeWatchProgress removes by id and media_type', () => {
  storage.saveWatchProgress({ id: 1, media_type: 'movie', title: 'A' });
  storage.saveWatchProgress({ id: 2, media_type: 'movie', title: 'B' });

  const list = storage.removeWatchProgress(1, 'movie');
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 2);
});

test('storage functions return safe empty values without a browser window', () => {
  const savedWindow = globalThis.window;
  const savedLocalStorage = globalThis.localStorage;
  delete globalThis.window;
  delete globalThis.localStorage;

  try {
    assert.deepEqual(storage.getMyList(), []);
    assert.deepEqual(storage.addToMyList({ id: 1, media_type: 'movie' }), []);
    assert.deepEqual(storage.removeFromMyList(1, 'movie'), []);
    assert.equal(storage.isInMyList(1, 'movie'), false);
    assert.deepEqual(storage.clearMyList(), []);
    assert.deepEqual(storage.getContinueWatching(), []);
    assert.deepEqual(storage.saveWatchProgress({ id: 1, media_type: 'movie' }), []);
    assert.deepEqual(storage.updateWatchProgress(1, 'movie', {}), []);
    assert.deepEqual(storage.removeWatchProgress(1, 'movie'), []);
  } finally {
    globalThis.window = savedWindow;
    globalThis.localStorage = savedLocalStorage;
  }
});
