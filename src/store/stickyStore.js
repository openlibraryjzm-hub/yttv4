import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Sticky Store - Persistent stickied videos per playlist
 * Stickied videos appear in a carousel at the top of the Videos page
 */
export const useStickyStore = create(
    persist(
        (set, get) => ({
            // Map of playlistId -> array of video IDs
            // structured as { [playlistId]: [videoId1, videoId2, ...] }
            stickiedVideos: {},

            /**
             * Toggle sticky status for a video in a playlist
             * @param {string|number} playlistId - Playlist ID
             * @param {number} videoId - Video ID
             */
            toggleSticky: (playlistId, videoId) => {
                const state = get();
                const currentStickies = state.stickiedVideos[playlistId] || [];
                const isStickied = currentStickies.includes(videoId);

                let newStickies;
                if (isStickied) {
                    // Unsticky
                    newStickies = currentStickies.filter(id => id !== videoId);
                } else {
                    // Sticky
                    newStickies = [...currentStickies, videoId];
                }

                set({
                    stickiedVideos: {
                        ...state.stickiedVideos,
                        [playlistId]: newStickies,
                    },
                });
            },

            /**
             * Check if a video is stickied in a playlist
             * @param {string|number} playlistId - Playlist ID
             * @param {number} videoId - Video ID
             * @returns {boolean}
             */
            isStickied: (playlistId, videoId) => {
                const state = get();
                const stickies = state.stickiedVideos[playlistId];
                return stickies ? stickies.includes(videoId) : false;
            },
        }),
        {
            name: 'sticky-storage', // unique name for localStorage
        }
    )
);
