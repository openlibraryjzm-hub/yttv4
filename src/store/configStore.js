import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConfigStore = create(
    persist(
        (set) => ({
            // Pin Track & Header
            pinAnchorX: 50,
            setPinAnchorX: (val) => set({ pinAnchorX: val }),
            pinAnchorY: 0,
            setPinAnchorY: (val) => set({ pinAnchorY: val }),
            plusButtonX: 100,
            setPlusButtonX: (val) => set({ plusButtonX: val }),
            plusButtonY: 0,
            setPlusButtonY: (val) => set({ plusButtonY: val }),
            pinToggleY: 0,
            setPinToggleY: (val) => set({ pinToggleY: val }),

            // Playlist Header
            playlistToggleX: 20,
            setPlaylistToggleX: (val) => set({ playlistToggleX: val }),
            playlistTabsX: 0,
            setPlaylistTabsX: (val) => set({ playlistTabsX: val }),
            playlistInfoX: 0,
            setPlaylistInfoX: (val) => set({ playlistInfoX: val }),
            playlistInfoWidth: 200,
            setPlaylistInfoWidth: (val) => set({ playlistInfoWidth: val }),

            // Playlist Capsule
            playlistCapsuleX: 0,
            setPlaylistCapsuleX: (val) => set({ playlistCapsuleX: val }),
            playlistCapsuleY: 0,
            setPlaylistCapsuleY: (val) => set({ playlistCapsuleY: val }),
            playlistCapsuleWidth: 150,
            setPlaylistCapsuleWidth: (val) => set({ playlistCapsuleWidth: val }),
            playlistCapsuleHeight: 40,
            setPlaylistCapsuleHeight: (val) => set({ playlistCapsuleHeight: val }),
            playlistChevronLeftX: -20,
            setPlaylistChevronLeftX: (val) => set({ playlistChevronLeftX: val }),
            playlistPlayCircleX: 0,
            setPlaylistPlayCircleX: (val) => set({ playlistPlayCircleX: val }),
            playlistChevronRightX: 20,
            setPlaylistChevronRightX: (val) => set({ playlistChevronRightX: val }),

            // Orb Image Tuning
            orbImageScale: 1.0,
            setOrbImageScale: (val) => set({ orbImageScale: val }),
            orbImageScaleW: 1.0,
            setOrbImageScaleW: (val) => set({ orbImageScaleW: val }),
            orbImageScaleH: 1.0,
            setOrbImageScaleH: (val) => set({ orbImageScaleH: val }),
            orbImageXOffset: 0,
            setOrbImageXOffset: (val) => set({ orbImageXOffset: val }),
            orbImageYOffset: 0,
            setOrbImageYOffset: (val) => set({ orbImageYOffset: val }),
            orbSize: 150,
            setOrbSize: (val) => set({ orbSize: val }),
            orbMenuGap: 30, // Gap between orb and menus
            setOrbMenuGap: (val) => set({ orbMenuGap: val }),

            // Global Layout
            menuWidth: 300,
            setMenuWidth: (val) => set({ menuWidth: val }),
            menuHeight: 128,
            setMenuHeight: (val) => set({ menuHeight: val }),

            // Video Menu Toolbar
            modeHandleSize: 20,
            setModeHandleSize: (val) => set({ modeHandleSize: val }),
            modeHandleInternalSize: 14,
            setModeHandleInternalSize: (val) => set({ modeHandleInternalSize: val }),
            videoChevronLeftX: -26,
            setVideoChevronLeftX: (val) => set({ videoChevronLeftX: val }),
            videoChevronRightX: 26,
            setVideoChevronRightX: (val) => set({ videoChevronRightX: val }),
            modeSwitcherX: 0,
            setModeSwitcherX: (val) => set({ modeSwitcherX: val }),
            shuffleButtonX: -54,
            setShuffleButtonX: (val) => set({ shuffleButtonX: val }),
            gridButtonX: 52,
            setGridButtonX: (val) => set({ gridButtonX: val }),
            starButtonX: -80,
            setStarButtonX: (val) => set({ starButtonX: val }),
            likeButtonX: 80,
            setLikeButtonX: (val) => set({ likeButtonX: val }),

            // Custom Banner Image
            customBannerImage: null,
            setCustomBannerImage: (val) => set({ customBannerImage: val }),
        }),
        {
            name: 'config-storage-v4', // name of the item in the storage (must be unique)
        }
    )
);
