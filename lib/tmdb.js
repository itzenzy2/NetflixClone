/**
 * TMDb API Utility Functions
 * 
 * This file contains all functions to interact with The Movie Database (TMDb) API.
 * Each function is responsible for fetching specific data from TMDb.
 */

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Generic fetch function for TMDb API calls
 * @param {string} endpoint - The API endpoint to call
 * @param {object} params - Additional query parameters
 * @returns {Promise<object>} - The API response data
 */
async function fetchFromTMDb(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  // Add additional parameters
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDb API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDb:', error);
    throw error;
  }
}

/**
 * Get trending movies/shows for the week
 * @param {string} mediaType - 'movie', 'tv', or 'all'
 * @returns {Promise<object>} - Trending content
 */
export async function getTrending(mediaType = 'all') {
  return fetchFromTMDb(`/trending/${mediaType}/week`);
}

/**
 * Get popular movies
 * @param {number} page - Page number for pagination
 * @returns {Promise<object>} - Popular movies
 */
export async function getPopularMovies(page = 1) {
  return fetchFromTMDb('/movie/popular', { page });
}

/**
 * Get popular TV shows
 * @param {number} page - Page number for pagination
 * @returns {Promise<object>} - Popular TV shows
 */
export async function getPopularTVShows(page = 1) {
  return fetchFromTMDb('/tv/popular', { page });
}

/**
 * Get top rated movies
 * @returns {Promise<object>} - Top rated movies
 */
export async function getTopRatedMovies() {
  return fetchFromTMDb('/movie/top_rated');
}

/**
 * Get top rated TV shows
 * @returns {Promise<object>} - Top rated TV shows
 */
export async function getTopRatedTVShows() {
  return fetchFromTMDb('/tv/top_rated');
}

/**
 * Get movies by genre
 * @param {number} genreId - The genre ID
 * @param {number} page - Page number for pagination
 * @returns {Promise<object>} - Movies of specified genre
 */
export async function getMoviesByGenre(genreId, page = 1) {
  return fetchFromTMDb('/discover/movie', {
    with_genres: genreId,
    page,
    sort_by: 'popularity.desc'
  });
}

/**
 * Get TV shows by genre
 * @param {number} genreId - The genre ID
 * @param {number} page - Page number for pagination
 * @returns {Promise<object>} - TV shows of specified genre
 */
export async function getTVShowsByGenre(genreId, page = 1) {
  return fetchFromTMDb('/discover/tv', {
    with_genres: genreId,
    page,
    sort_by: 'popularity.desc'
  });
}

/**
 * Get detailed information about a movie
 * @param {number} movieId - The TMDb movie ID
 * @returns {Promise<object>} - Movie details
 */
export async function getMovieDetails(movieId) {
  return fetchFromTMDb(`/movie/${movieId}`, {
    append_to_response: 'videos,credits,similar'
  });
}

/**
 * Get detailed information about a TV show
 * @param {number} tvId - The TMDb TV show ID
 * @returns {Promise<object>} - TV show details
 */
export async function getTVShowDetails(tvId) {
  return fetchFromTMDb(`/tv/${tvId}`, {
    append_to_response: 'videos,credits,similar'
  });
}

/**
 * Get season details for a TV show
 * @param {number} tvId - The TMDb TV show ID
 * @param {number} seasonNumber - The season number
 * @returns {Promise<object>} - Season details including episodes
 */
export async function getSeasonDetails(tvId, seasonNumber) {
  return fetchFromTMDb(`/tv/${tvId}/season/${seasonNumber}`);
}

/**
 * Search for movies and TV shows
 * @param {string} query - The search query
 * @param {number} page - Page number for pagination
 * @returns {Promise<object>} - Search results
 */
export async function searchMulti(query, page = 1) {
  return fetchFromTMDb('/search/multi', { query, page });
}

/**
 * Get now playing movies (currently in theaters)
 * @returns {Promise<object>} - Now playing movies
 */
export async function getNowPlayingMovies() {
  return fetchFromTMDb('/movie/now_playing');
}

/**
 * Get upcoming movies
 * @returns {Promise<object>} - Upcoming movies
 */
export async function getUpcomingMovies() {
  return fetchFromTMDb('/movie/upcoming');
}

/**
 * Get movie/show genres list
 * @param {string} type - 'movie' or 'tv'
 * @returns {Promise<object>} - List of genres
 */
export async function getGenres(type = 'movie') {
  return fetchFromTMDb(`/genre/${type}/list`);
}

/**
 * Helper function to construct image URLs
 * @param {string} path - The image path from TMDb
 * @param {string} size - Image size (w500, w780, original, etc.)
 * @returns {string} - Full image URL
 */
export function getImageUrl(path, size = 'original') {
  if (!path) return '/placeholder-image.png';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Helper function to get backdrop image URL
 * @param {string} path - The backdrop path from TMDb
 * @returns {string} - Full backdrop URL
 */
export function getBackdropUrl(path) {
  return getImageUrl(path, 'original');
}

/**
 * Helper function to get poster image URL
 * @param {string} path - The poster path from TMDb
 * @returns {string} - Full poster URL
 */
export function getPosterUrl(path) {
  return getImageUrl(path, 'w500');
}

// Genre IDs for easy reference
export const GENRES = {
  ACTION: 28,
  ADVENTURE: 12,
  ANIMATION: 16,
  COMEDY: 35,
  CRIME: 80,
  DOCUMENTARY: 99,
  DRAMA: 18,
  FAMILY: 10751,
  FANTASY: 14,
  HISTORY: 36,
  HORROR: 27,
  MUSIC: 10402,
  MYSTERY: 9648,
  ROMANCE: 10749,
  SCIENCE_FICTION: 878,
  TV_MOVIE: 10770,
  THRILLER: 53,
  WAR: 10752,
  WESTERN: 37,
};
