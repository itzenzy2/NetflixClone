/**
 * MyListContext
 * 
 * Global state management for the user's watchlist using React Context API.
 * This allows any component to access and modify the My List without prop drilling.
 * 
 * The context initializes from localStorage and keeps the state in sync.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  getMyList,
  addToMyList,
  removeFromMyList,
  isInMyList,
  clearMyList as clearStorageList
} from '../lib/storage';

// Create the context
const MyListContext = createContext();

/**
 * Custom hook to use the MyList context
 * Usage: const { myList, addItem, removeItem, isItemInList } = useMyList();
 */
export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) {
    throw new Error('useMyList must be used within a MyListProvider');
  }
  return context;
}

/**
 * MyListProvider Component
 * Wrap your app with this provider to enable My List functionality
 */
export function MyListProvider({ children }) {
  const [myList, setMyList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load My List from localStorage on mount
  useEffect(() => {
    const loadMyList = () => {
      const storedList = getMyList();
      setMyList(storedList);
      setIsLoaded(true);
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      loadMyList();
    }
  }, []);

  /**
   * Add an item to My List
   * @param {object} item - The movie/show to add
   */
  const addItem = (item) => {
    const updatedList = addToMyList(item);
    setMyList(updatedList);
  };

  /**
   * Remove an item from My List
   * @param {number} itemId - The TMDb ID
   * @param {string} mediaType - 'movie' or 'tv'
   */
  const removeItem = (itemId, mediaType) => {
    const updatedList = removeFromMyList(itemId, mediaType);
    setMyList(updatedList);
  };

  /**
   * Toggle an item in/out of My List
   * @param {object} item - The movie/show to toggle
   * @returns {boolean} - True if item was added, false if removed
   */
  const toggleItem = (item) => {
    const isInList = isItemInList(item.id, item.media_type);
    
    if (isInList) {
      removeItem(item.id, item.media_type);
      return false;
    } else {
      addItem(item);
      return true;
    }
  };

  /**
   * Check if an item is in My List
   * @param {number} itemId - The TMDb ID
   * @param {string} mediaType - 'movie' or 'tv'
   * @returns {boolean}
   */
  const isItemInList = (itemId, mediaType) => {
    return isInMyList(itemId, mediaType);
  };

  /**
   * Clear all items from My List
   */
  const clearList = () => {
    clearStorageList();
    setMyList([]);
  };

  /**
   * Get the count of items in My List
   * @returns {number}
   */
  const getCount = () => {
    return myList.length;
  };

  // Context value to be provided to consumers
  const value = {
    myList,
    addItem,
    removeItem,
    toggleItem,
    isItemInList,
    clearList,
    getCount,
    isLoaded, // Useful to show loading state
  };

  return (
    <MyListContext.Provider value={value}>
      {children}
    </MyListContext.Provider>
  );
}
