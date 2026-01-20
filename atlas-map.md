# Atlas Documentation Map

A quick reference guide to the documentation located in the `atlas/` directory.

| Document | Purpose |
| :--- | :--- |
| **[README.md](atlas/README.md)** | **Master Index**. Starts here. Overview of project, tech stack, and documentation structure. |
| **[advanced-player-controller.md](atlas/advanced-player-controller.md)** | Details the **Main Player UI** (Orb), menu navigation, preview controls, and dual-player logic. |
| **[api-bridge.md](atlas/api-bridge.md)** | Reference for the **Tauri Command Bridge**, connecting React frontend to Rust backend. |
| **[audio-visualizer.md](atlas/audio-visualizer.md)** | Technical details on the system-wide **Audio Visualizer** (cpal/FFT). |
| **[banner.md](atlas/banner.md)** | Describes the **Unified Banner System**, visual stitching, and header animations. |
| **[database-schema.md](atlas/database-schema.md)** | Complete **SQLite Schema** reference (tables, keys, relationships). |
| **[debug.md](atlas/debug.md)** | Guide to **Debugging Tools** (Inspect mode, rulers, layout bounds). |
| **[history.md](atlas/history.md)** | Documentation for **Watch History** tracking and the History page layout. |
| **[importexport.md](atlas/importexport.md)** | Guide to **Import/Export** features (YouTube API, JSON, Bulk Import). |
| **[local-videos.md](atlas/local-videos.md)** | Handling **Local Video Files**, file pickers, and HTML5/MPV players. |
| **[navigation-routing.md](atlas/navigation-routing.md)** | Explains **App Navigation**, routing logic, and state preservation. |
| **[performance_roadmap_status.md](atlas/performance_roadmap_status.md)** | Status tracker for performance tasks (Batch fetching, Skeleton UI). |
| **[playlist&tab.md](atlas/playlist&tab.md)** | Core guide to **Playlists & Tabs**, including folders, presets, and CRUD. |
| **[session-updates.md](atlas/session-updates.md)** | Chronological log of **Dev Sessions**, key fixes, and feature rollouts. |
| **[state-management.md](atlas/state-management.md)** | Technical reference for **Zustand Stores** and state architecture. |
| **[ui.md](atlas/ui.md)** | Comprehensive **UI System** guide (Layouts, Components, Design System). |
| **[videoplayer.md](atlas/videoplayer.md)** | Details the **Video Player Implementations** (YouTube Embed vs Native). |
| *[grokconsult.md](atlas/grokconsult.md)* | *Empty File (Placeholder)* |

## In-Depth Feature Breakdown

### [History System](atlas/history.md)
**Purpose**: Tracks user viewing habits to enable resume-playback and watch status filtering.

*   **Watch-Time Tracking**: Automatically records video progress in the background. Does not require user intervention.
    *   **Logic**: Saves progress every 5 seconds during playback, immediately on pause/stop, and when switching videos.
    *   **Resume Playback**: Automatically seeks to the last saved position when a video is re-opened.
*   **Watch Status Categories**:
    *   **Unwatched**: 0% progress.
    *   **Partially Watched**: Between 0% and 85%.
    *   **Watched**: >= 85% completion. This is "sticky" (remains "Watched" even if re-played).
*   **History Page**: Displays the last **100** watched videos in a vertical list format for quick access.
*   **Filtering**: Allows sorting video grids by progress and toggling visibility of "Watched" or "Unwatched" content.

**Related Documentation**:
*   **[ui.md](atlas/ui.md)** (Section 4.1.3): Details the specific "History Card" layout and the localized "Last 100" grid display.
*   **[database-schema.md](atlas/database-schema.md)**: Defines the `watch_history` table (for list display) and `video_progress` table (for playback resumption).
*   **[videoplayer.md](atlas/videoplayer.md)**: Explains how the player component triggers these background tracking events.

### [Import & Update System](atlas/importexport.md)
**Purpose**: The gateway for bringing content into the app, supporting both simple additions and complex bulk operations.

*   **Unified Config Modal**: A central interface (accessible via "Config Playlist") that handles all import methods.
    *   **"All" Input**: Accepts mixed content—YouTube Playlist URLs, individual Video URLs, and local app references.
    *   **Smart Deep Fetching**: Automatically detects if a link is a playlist, fetches all videos (handling pagination), and adds them to the target.
*   **Colored Folder Import**:
    *   Features **16 specific inputs** corresponding to the app's folder colors.
    *   **Feature**: Any link pasted into a colored field (e.g., "Red") is automatically assigned to that folder upon import.
*   **Bulk Import & Selector**:
    *   Allows importing multiple YouTube playlists at once.
    *   Includes a **Selector Modal** to "import" existing local playlists or folders into a new destination (effectively merging them).
*   **JSON Management**:
    *   **Export**: Saves full playlist data including **Folder Assignments** to a JSON file.
    *   **Import**: Restores playlists from JSON, fully reconstructing folder structures.

**Related Documentation**:
*   **[ui.md](atlas/ui.md)** (Section 4.1.1): Shows where the "Add Playlist" and "Config Playlist" triggers are located within the Sticky Toolbar.
*   **[api-bridge.md](atlas/api-bridge.md)**: Documents the `fetchPlaylistVideos` and `createPlaylist` Tauri commands that power this feature.
*   **[database-schema.md](atlas/database-schema.md)**: Maps how imported data fills the `playlists` and `playlist_items` tables.

### [Playlist & Tab Organization](atlas/playlist&tab.md)
**Purpose**: The core structural hierarchy of the application (Playlists -> Folders -> Videos), managed via Tabs.

*   **Playlist Grid**:
    *   **Expansion System**: Playlists can be "Expanded" to reveal their internal folders inline within the main grid.
    *   **Sticky Folders**: Specific folders can be "stuck" so they remain visible in the grid even when their parent playlist is collapsed.
    *   **Sticky Toolbar**: A floating header for quick access to playlist tools and tabs.
*   **Colored Folders**:
    *   **Sub-organization**: Videos within a playlist can be assigned to one of 16 colored folders.
    *   **Sticky Videos**: Each folder view has its own "Sticky Carousel" for pinned videos that ignores filters.
    *   **Bulk Tagging**: Special interface to rapidly assign folders to videos via a hover grid.
*   **Tab System (Workspace)**:
    *   **Tabs**: logical groups of playlists (e.g., "Music", "Docs"). Playlists can belong to multiple tabs.
    *   **Presets**: Saved "View States" that determine which Tabs are visible.
        *   *Example*: A "Coding" preset might show only the "Tutorials" and "Music" tabs, hiding others.
    *   **Client-Side Persistence**: Tabs and Presets are stored in `localStorage` for instant switching.
*   **Management Actions**:
    *   **Move/Copy**: Context menu options to move or duplicate videos between playlists.

**Related Documentation**:
*   **[ui.md](atlas/ui.md)** (Section 2.1 & 4.1.1): Comprehensive breakdown of the Playlist Card, Expansion animations, and Grid layout.
*   **[ui.md](atlas/ui.md)** (Section 4.1.2): Details the Videos Page and the "Sticky Toolbar" implementation used for Tab navigation.
*   **[state-management.md](atlas/state-management.md)**: Explains `tabStore` (Workspace state) and `playlistStore` (Grid state).
