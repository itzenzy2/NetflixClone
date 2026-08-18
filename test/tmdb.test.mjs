import test from 'node:test';
import assert from 'node:assert/strict';
import * as tmdb from '../lib/tmdb.js';

test('getImageUrl builds full TMDb URLs and falls back for missing paths', () => {
  assert.equal(tmdb.getImageUrl(null), '/placeholder-image.png');
  assert.equal(tmdb.getImageUrl(undefined), '/placeholder-image.png');
  assert.equal(tmdb.getImageUrl(''), '/placeholder-image.png');
  assert.equal(
    tmdb.getImageUrl('/abc.jpg'),
    'https://image.tmdb.org/t/p/original/abc.jpg'
  );
  assert.equal(
    tmdb.getImageUrl('/abc.jpg', 'w500'),
    'https://image.tmdb.org/t/p/w500/abc.jpg'
  );
});

test('getBackdropUrl and getPosterUrl use their intended sizes', () => {
  assert.equal(
    tmdb.getBackdropUrl('/backdrop.jpg'),
    'https://image.tmdb.org/t/p/original/backdrop.jpg'
  );
  assert.equal(
    tmdb.getPosterUrl('/poster.jpg'),
    'https://image.tmdb.org/t/p/w500/poster.jpg'
  );
});

test('GENRES maps the genre ids used across the app', () => {
  assert.equal(tmdb.GENRES.ACTION, 28);
  assert.equal(tmdb.GENRES.COMEDY, 35);
  assert.equal(tmdb.GENRES.HORROR, 27);
  assert.equal(tmdb.GENRES.DOCUMENTARY, 99);
});
