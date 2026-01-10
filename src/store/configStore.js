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
            playlistCapsuleWidth: 74,
            setPlaylistCapsuleWidth: (val) => set({ playlistCapsuleWidth: val }),
            playlistCapsuleHeight: 32,
            setPlaylistCapsuleHeight: (val) => set({ playlistCapsuleHeight: val }),
            playlistChevronLeftX: 0,
            setPlaylistChevronLeftX: (val) => set({ playlistChevronLeftX: val }),
            playlistPlayCircleX: 0,
            setPlaylistPlayCircleX: (val) => set({ playlistPlayCircleX: val }),
            playlistChevronRightX: 0,
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
            menuWidth: 340,
            setMenuWidth: (val) => set({ menuWidth: val }),
            menuHeight: 102,
            setMenuHeight: (val) => set({ menuHeight: val }),

            // Video Menu Toolbar
            modeHandleSize: 20,
            setModeHandleSize: (val) => set({ modeHandleSize: val }),
            modeHandleInternalSize: 14,
            setModeHandleInternalSize: (val) => set({ modeHandleInternalSize: val }),

            // Center Cluster
            modeSwitcherX: -120, // Grid moved to Star's old position
            setModeSwitcherX: (val) => set({ modeSwitcherX: val }),
            videoChevronLeftX: -148, // Left of Grid
            setVideoChevronLeftX: (val) => set({ videoChevronLeftX: val }),
            videoChevronRightX: -92, // Right of Grid
            setVideoChevronRightX: (val) => set({ videoChevronRightX: val }),

            // Right Side Group (Shifted left by 60px)
            starButtonX: -60, // Was 0
            setStarButtonX: (val) => set({ starButtonX: val }),
            shuffleButtonX: -20, // Was 40
            setShuffleButtonX: (val) => set({ shuffleButtonX: val }),

            // Right Flank (Existing)
            pinFirstButtonX: 20, // Was 80
            setPinFirstButtonX: (val) => set({ pinFirstButtonX: val }),
            likeButtonX: 60, // Was 120
            setLikeButtonX: (val) => set({ likeButtonX: val }),
            menuButtonX: 92, // Was 152
            setMenuButtonX: (val) => set({ menuButtonX: val }),

            // Custom Banner Image
            customBannerImage: null,
            setCustomBannerImage: (val) => set({ customBannerImage: val }),

            // Restored Missing Keys (Defaults)
            pinFirstButtonSize: 34,
            setPinFirstButtonSize: (val) => set({ pinFirstButtonSize: val }),


            dotMenuWidth: 240,
            setDotMenuWidth: (val) => set({ dotMenuWidth: val }),
            dotMenuHeight: 100,
            setDotMenuHeight: (val) => set({ dotMenuHeight: val }),
            dotMenuY: -80,
            setDotMenuY: (val) => set({ dotMenuY: val }),
            dotSize: 32,
            setDotSize: (val) => set({ dotSize: val }),

            playlistHandleSize: 26,
            setPlaylistHandleSize: (val) => set({ playlistHandleSize: val }),
            playlistPlayIconSize: 14,
            setPlaylistPlayIconSize: (val) => set({ playlistPlayIconSize: val }),
            playlistChevronIconSize: 14,
            setPlaylistChevronIconSize: (val) => set({ playlistChevronIconSize: val }),

            bottomBarHeight: 40,
            setBottomBarHeight: (val) => set({ bottomBarHeight: val }),

            titleFontSize: 16,
            setTitleFontSize: (val) => set({ titleFontSize: val }),
            metadataFontSize: 11,
            setMetadataFontSize: (val) => set({ metadataFontSize: val }),

            pinSize: 20,
            setPinSize: (val) => set({ pinSize: val }),
            pinWidth: 40,
            setPinWidth: (val) => set({ pinWidth: val }),
            pinHeight: 30,
            setPinHeight: (val) => set({ pinHeight: val }),

            bottomIconSize: 34,
            setBottomIconSize: (val) => set({ bottomIconSize: val }),
            navChevronSize: 20,
            setNavChevronSize: (val) => set({ navChevronSize: val }),

            orbButtonSpread: 35,
            setOrbButtonSpread: (val) => set({ orbButtonSpread: val }),

            // User Profile
            userName: 'Boss',
            setUserName: (val) => set({ userName: val }),
            userAvatar: '( ͡° ͜ʖ ͡°)',
            setUserAvatar: (val) => set({ userAvatar: val }),
        }),
        {
            name: 'config-storage-v5', // name of the item in the storage (must be unique)
        }
    )
);
