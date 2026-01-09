import { create } from 'zustand';

/**
 * Pin Store - Session-only video pinning
 * Pins are not persisted to database, they are forgotten between sessions
 * Supports priority pins (always first/leftmost) set via yellow pin button
 */
export const usePinStore = create((set, get) => {
  // Load initial state from memory (session-only, no localStorage)
  const initialState = {
    pinnedVideos: [], // Array of video objects: { id, video_id, video_url, title, ... }
    priorityPinId: null, // ID of the priority pin (set via yellow button), always first
  };

  return {
    ...initialState,

    /**
     * Helper to ensure priority pin is always first in the array
     * @param {Array} videos - Array of pinned videos
     * @param {number|null} priorityId - ID of priority pin
     * @returns {Array} Sorted array with priority pin first
     */
    _sortPinsWithPriority: (videos, priorityId) => {
      if (!priorityId) return videos;
      
      const priorityPin = videos.find(v => v.id === priorityId);
      const otherPins = videos.filter(v => v.id !== priorityId);
      
      return priorityPin ? [priorityPin, ...otherPins] : videos;
    },

    /**
     * Toggle pin status for a video (normal pin from video card)
     * Does not set as priority pin
     * @param {Object} video - Video object to pin/unpin
     */
    togglePin: (video) => {
      const state = get();
      const isPinned = state.pinnedVideos.some(v => v.id === video.id);
      
      if (isPinned) {
        // Unpin: remove from array
        const newPins = state.pinnedVideos.filter(v => v.id !== video.id);
        const newPriorityId = video.id === state.priorityPinId ? null : state.priorityPinId;
        
        set({
          pinnedVideos: newPins,
          priorityPinId: newPriorityId,
        });
      } else {
        // Pin: add to array (but not as priority - goes after priority if exists)
        const newPins = [...state.pinnedVideos, video];
        set({
          pinnedVideos: get()._sortPinsWithPriority(newPins, state.priorityPinId),
        });
      }
    },

    /**
     * Check if a video is pinned
     * @param {number} videoId - Video ID to check
     * @returns {boolean}
     */
    isPinned: (videoId) => {
      const state = get();
      return state.pinnedVideos.some(v => v.id === videoId);
    },

    /**
     * Check if a video is the priority pin
     * @param {number} videoId - Video ID to check
     * @returns {boolean}
     */
    isPriorityPin: (videoId) => {
      const state = get();
      return state.priorityPinId === videoId;
    },

    /**
     * Remove a pin by video ID
     * @param {number} videoId - Video ID to unpin
     */
    removePin: (videoId) => {
      const state = get();
      const newPins = state.pinnedVideos.filter(v => v.id !== videoId);
      const newPriorityId = videoId === state.priorityPinId ? null : state.priorityPinId;
      
      set({
        pinnedVideos: newPins,
        priorityPinId: newPriorityId,
      });
    },

    /**
     * Clear all pins
     */
    clearAllPins: () => {
      set({ pinnedVideos: [], priorityPinId: null });
    },

    /**
     * Set a video as the priority pin (via yellow button)
     * Always places it first (leftmost). If a priority pin already exists, replaces it.
     * If the video is already pinned normally, it becomes the priority pin.
     * @param {Object} video - Video object to set as priority pin
     */
    setFirstPin: (video) => {
      const state = get();
      
      // Remove existing priority pin if it exists (but keep it in pins if it's the same video)
      const existingPriorityId = state.priorityPinId;
      const isAlreadyPinned = state.pinnedVideos.some(v => v.id === video.id);
      
      let newPins;
      if (isAlreadyPinned) {
        // Video is already pinned - just update priority
        newPins = state.pinnedVideos.filter(v => v.id !== video.id);
        newPins = [video, ...newPins];
      } else {
        // Video is not pinned - add it
        // Remove old priority pin from array if it exists and is different
        if (existingPriorityId && existingPriorityId !== video.id) {
          newPins = state.pinnedVideos.filter(v => v.id !== existingPriorityId);
        } else {
          newPins = [...state.pinnedVideos];
        }
        newPins = [video, ...newPins];
      }
      
      set({
        pinnedVideos: newPins,
        priorityPinId: video.id,
      });
    },
  };
});

