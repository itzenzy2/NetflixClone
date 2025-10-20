/**
 * LocalStorage Utility Functions
 * 
 * This file handles all interactions with browser localStorage for persisting user data.
 * The main use case is managing the user's "My List" (watchlist).
 */

const MY_LIST_KEY = 'netflix_clone_my_list';

/**
 * Get the user's watchlist from localStorage
 * @returns {Array} - Array of movie/show objects in the user's list
 */
export function getMyList() {
  if (typeof window === 'undefined') {
    // Server-side rendering check
    return [];
  }

  try {
    const stored = localStorage.getItem(MY_LIST_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading My List from localStorage:', error);
    return [];
  }
}

/**
 * Add a movie/show to the user's watchlist
 * @param {object} item - The movie/show object to add
 * @param {number} item.id - TMDb ID
 * @param {string} item.title - Movie title or show name
 * @param {string} item.poster_path - Poster image path
 * @param {string} item.media_type - 'movie' or 'tv'
 * @param {string} item.backdrop_path - Backdrop image path (optional)
 * @param {string} item.overview - Description (optional)
 * @returns {Array} - Updated list
 */
export function addToMyList(item) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const currentList = getMyList();
    
    // Check if item already exists in the list
    const exists = currentList.some(existingItem => 
      existingItem.id === item.id && existingItem.media_type === item.media_type
    );
    
    if (exists) {
      console.log('Item already in My List');
      return currentList;
    }

    // Add timestamp for sorting (most recently added first)
    const itemWithTimestamp = {
      ...item,
      addedAt: Date.now()
    };

    const updatedList = [itemWithTimestamp, ...currentList];
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(updatedList));
    
    return updatedList;
  } catch (error) {
    console.error('Error adding to My List:', error);
    return getMyList();
  }
}

/**
 * Remove a movie/show from the user's watchlist
 * @param {number} itemId - The TMDb ID of the item to remove
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Array} - Updated list
 */
export function removeFromMyList(itemId, mediaType) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const currentList = getMyList();
    const updatedList = currentList.filter(item => 
      !(item.id === itemId && item.media_type === mediaType)
    );
    
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(updatedList));
    
    return updatedList;
  } catch (error) {
    console.error('Error removing from My List:', error);
    return getMyList();
  }
}

/**
 * Check if an item is in the user's watchlist
 * @param {number} itemId - The TMDb ID to check
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {boolean} - True if item is in the list
 */
export function isInMyList(itemId, mediaType) {
  if (typeof window === 'undefined') {
    return false;
  }

  const currentList = getMyList();
  return currentList.some(item => 
    item.id === itemId && item.media_type === mediaType
  );
}

/**
 * Clear the entire watchlist (useful for testing or user request)
 * @returns {Array} - Empty array
 */
export function clearMyList() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    localStorage.removeItem(MY_LIST_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing My List:', error);
    return [];
  }
}

/**
 * Get the count of items in My List
 * @returns {number} - Number of items in the list
 */
export function getMyListCount() {
  return getMyList().length;
}
