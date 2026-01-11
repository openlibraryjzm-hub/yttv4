###4: UI

The UI system provides a consistent layout shell with a side menu that displays different pages based on navigation state. The system uses a reusable Card component architecture for displaying playlists, videos, and history items in a grid layout.

**Theme**: The application uses a light sky blue background (`#e0f2fe`) with dark blue text (`#052F4A` / RGB(5, 47, 74)) for side menu content. Navigation buttons (TopNavigation, TabBar) remain white for contrast. See `THEME_CHANGES.md` in project root for detailed theme documentation.

**Related Documentation:**
- **Navigation**: See `navigation-routing.md` for page routing flows and navigation state management
- **State Management**: See `state-management.md` for `navigationStore` (page routing), `layoutStore` (view modes), and `folderStore` (folder filtering)
- **Playlists**: See `playlist&tab.md` Section 2.1 for playlist grid details
- **Videos**: See `playlist&tab.md` Section 2.2 for video grid and folder filtering
- **History**: See `history.md` for history page details

---

#### ### 4.0 Layout & Styling

**1: Window Architecture (Borderless)**
The application uses a modern **Borderless Window** design (`decorations: false`):
- **No Title Bar**: The native OS title bar is removed for a seamless, premium look.
- **Custom Window Controls**: A custom `WindowControls` component (Minimize, Maximize, Close) is integrated into the top-right corner of the banner.
- **Draggable Banner**: The entire Top Banner is a draggable region (`data-tauri-drag-region`), allowing users to move the window.
- **Dimensions**: Defaults to 1920x1030 (fullscreen width, taskbar-aware height) positioned at (0,0).

**2: Visual Design System**
The application employs a high-contrast, structured design with distinct borders:

- **Unified Border Color**: A deep dark blue (`rgb(4, 41, 65)`) is used for:
  - Video Player container border (12px padding).
  - Side Menu top border (4px solid line).
  - Banner "bleed" gradient (bottom edge).

- **Audio Visualizer Integration**:
  - The Audio Visualizer acts as the dynamic border for the central Orb, replacing static borders.
  - It uses `overflow: visible` to bleed onto the Video Player area below (approx 52px overlap), creating a layered, immersive effect.

- **Top Banner**:
  - Displays a custom image (`/public/banner.PNG`) spanning the full width of the controller.
  - **Infinite Scroll**: The banner image animates continuously from left to right in a 60-second seamless loop.
  - Features a "bleed" effect at the bottom: a gradient fading from the image into the dark blue border color, ensuring a seamless visual transition to the content area.
  - If no custom image is provided, it falls back to a subtle blue gradient.

- **Video Player**:
  - Wrapped in a `.layout-shell__player` container.
  - Has a visible 12px dark blue background padding that acts as a border.
  - Scales responsively with view modes (Full/Half/Quarter).

- **Floating Metadata Bubbles**:
  - **Removed**: Video metadata (Author/View Count) and Playlist titles are now integrated directly into the Top Playlist/Video Menus for a cleaner, encapsulated look (see `advanced-player-controller.md`).

#### ### 4.1 Side Menu

**1: User-Perspective Description**

Users see a side menu panel that appears on the right side of the screen when in "half" or "quarter" view modes:

- **Top Navigation Bar**: Horizontal bar at the top of the side menu containing:
  - **Back Button**: Chevron left button (visible when history exists), navigates to previous page.
  - **Tabs**: 
    - Text-based tabs: "Playlists", "Videos".
    - Icon-only tabs: "History" (Clock), "Likes" (Heart), "Pins" (Pin), "Settings" (Gear), "Support" (Cat).
  - **Close Side Menu Button**: "Close Side Menu" button (X) aligned to the right. Clicking it returns to full-screen mode (hides side menu).

- **Folder Selector** (Videos page only): Below the tabs, a row of 17 colored dots:
  - **"All"** button: Gray dot, shows all videos when clicked
  - **16 Folder Color Dots**: One for each folder color (Red, Orange, Amber, Yellow, Lime, Green, Emerald, Teal, Cyan, Sky, Blue, Indigo, Violet, Purple, Fuchsia, Pink)
  - Active folder highlighted with blue ring
  - Clicking a folder filters videos to show only videos in that folder

- **Page Content**: The main content area below navigation, showing:
  - **Playlists Page**: 3-column grid of playlist cards (see 4.1.1)
  - **Videos Page**: 3-column grid of video cards (see 4.1.2)
  - **History Page**: 3-column grid of history cards (see 4.1.3)

- **Layout Modes**: Side menu visibility controlled by view mode:
  - **Full Mode**: Side menu hidden, player only
  - **Half Mode**: Side menu visible on right, player on left
  - **Quarter Mode**: Side menu visible, smaller player

**2: File Manifest**

**UI/Components:**
- `src/LayoutShell.jsx`: Main layout component that manages side menu positioning
- `src/components/TopNavigation.jsx`: Tab navigation bar component
- `src/components/FolderSelector.jsx`: Folder color selector component (Videos page only)
- `src/App.jsx`: Orchestrates page routing and side menu content

**State Management:**
- `src/store/navigationStore.js`:
  - `currentPage`: 'playlists' | 'videos' | 'history'
  - `history`: Array of previous pages
  - `setCurrentPage(page)`: Sets active page and pushes to history
  - `goBack()`: Navigates to previous page
- `src/store/layoutStore.js`:
  - `viewMode`: 'full' | 'half' | 'quarter'
  - `setViewMode(mode)`: Sets view mode
- `src/store/playlistStore.js`:
  - `showPlaylists`: Boolean (legacy, controls PlaylistList sidebar)
- `src/store/folderStore.js`:
  - `selectedFolder`: Currently selected folder color (null = all)

**API/Bridge:**
- No direct API calls - routing only

**Backend:**
- No database tables - UI state only

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Tab Navigation Flow:**
   - User clicks tab → `handleTabClick(tabId)` (TopNavigation.jsx line 19)
   - Calls `setCurrentPage(tabId)` → Updates `navigationStore.currentPage`
   - If in full mode → `setViewMode('half')` → Auto-switches to half mode to show side menu
   - `App.jsx` checks `currentPage` → Renders appropriate page component:
     - `currentPage === 'playlists'` → `<PlaylistsPage />`
     - `currentPage === 'videos'` → `<VideosPage />`
     - `currentPage === 'history'` → `<HistoryPage />`

2. **Folder Selection Flow:**
   - User clicks folder color dot → `setSelectedFolder(folderColor)` (FolderSelector.jsx)
   - Updates `folderStore.selectedFolder` → VideosPage filters videos
   - If `folderColor === null` → Shows all videos
   - If `folderColor` set → Calls `getVideosInFolder(playlistId, folderColor)` → Filters grid

3. **View Mode Toggle Flow:**
   - User clicks "View All Videos" or "View All Playlists" → `setViewMode('half')`
   - Side menu becomes visible → Shows appropriate page
   - User clicks close button (X) → `setViewMode('full')` → Side menu hidden

**Source of Truth:**
- `navigationStore.currentPage` - Currently active page (Source of Truth)
- `layoutStore.viewMode` - Current view mode (Source of Truth)
- `folderStore.selectedFolder` - Currently selected folder filter (Source of Truth)

**State Dependencies:**
- When `currentPage` changes → `App.jsx` re-renders → Different page component displayed
- When `viewMode` changes → `LayoutShell` re-renders → Side menu visibility toggles
- When `selectedFolder` changes → `VideosPage` filters videos → Grid updates
- When tab clicked in full mode → Auto-switches to half mode → Side menu appears

---

#### ### 4.1.1 Playlists Page

**1: User-Perspective Description**

Users see a 3-column grid of playlist cards. For detailed description of playlist functionality, see **Section 2.1: Playlists**. This section focuses on the UI/visual aspects:

- **Grid Layout**: 3 columns, responsive spacing, scrollable vertical list
- **Playlist Cards**: Each card displays:
  - Thumbnail (16:9 aspect ratio, first video's thumbnail)
  - Playlist name (truncated if too long)
  - Description (optional, line-clamped to 2 lines)
  - Video count (e.g., "5 videos")
  - Hover overlay with preview and play buttons
  - 3-dot menu with expand/export/add-to-tab/delete options

- **Header Actions**: Top of page shows:
- **Header Actions**: Top of page shows a compact single-row header:
  - **Tab bar**: Integrated into the left side of the header.
  - **Action Buttons**: Right-aligned buttons for:
    - **Folder toggle**: Toggles inline folder display.
    - **Add Playlist**: Opens playlist import/create modal.

- **Colored Folders**: When folder toggle is on, folder cards appear in grid (see Section 2.2)

**2: File Manifest**

**UI/Components:**
- `src/components/PlaylistsPage.jsx`: Main playlist grid page component
- `src/components/Card.jsx`: Base card component
- `src/components/CardThumbnail.jsx`: Thumbnail display component
- `src/components/CardContent.jsx`: Content area component
- `src/components/CardMenu.jsx`: 3-dot menu component
- `src/components/TabBar.jsx`: Tab navigation bar

**State Management:**
- See Section 2.1 for full state management details
- `src/components/PlaylistsPage.jsx` (local state):
  - `playlists`: Array of playlist objects
  - `playlistThumbnails`: Map of playlist ID to thumbnail URL
  - `playlistItemCounts`: Map of playlist ID to video count

**API/Bridge:**
- See Section 2.1 for full API details

**Backend:**
- See Section 2.1 for full backend details

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

See **Section 2.1: Playlists** for complete logic flow. The UI-specific aspects:

1. **Card Rendering Flow:**
   - Playlists loaded → `playlists` array populated
   - For each playlist → Renders `<Card>` component
   - Card uses `<CardThumbnail>` for image → 16:9 aspect ratio enforced
   - Card uses `<CardContent>` for text → Title, description, video count
   - Card uses `<CardContent>` for text → Title, description, video count, and menu
   - Card uses `<CardActions>` for menu → 3-dot menu positioned inline with title

2. **Grid Layout Flow:**
   - CSS Grid: `grid grid-cols-3 gap-4` → 3 columns, 4-unit gap
   - Responsive: Adjusts to container width
   - Scrollable: `overflow-y-auto` on container

**Source of Truth:**
- See Section 2.1

**State Dependencies:**
- See Section 2.1

---

#### ### 4.1.1.1 Playlist Cards

**1: User-Perspective Description**

Users see playlist cards built using the reusable Card component system:

- **Card Structure**:
  - **Thumbnail Area**: 16:9 aspect ratio, rounded corners
    - Image: First video's thumbnail from playlist
    - Fallback: Gray placeholder icon if no thumbnail
    - **Title Overlay**: Positioned at the bottom of the thumbnail with no backdrop.
    - **Typography**: "Epic WordArt" style: `font-black`, `italic`, `text-3xl`.
    - **Styling**: Dark blue text (`#052F4A`) with a white stroke (`2px white`) and a solid sky blue 3D shadow (`4px 4px 0 #38bdf8`) for maximum impact and readability.
    - **Hover Overlay**: Semi-transparent black with play/preview buttons
  - **Interactive Elements Overlay**:
    - **3-Dot Menu**: Positioned at the top-right of the thumbnail, visible on hover.
   - **Content Area**: (Removed - Title and Menu are now overlaid on the thumbnail)
  
- **Visual States**:
  - **Default**: Transparent background, no border
  - **Hover**: Thumbnail play buttons appear
  - **Selected**: Blue border (when active)

- **Interactive Elements**:
  - **Card Click**: Loads playlist and starts playing first video
  - **Play Button** (hover overlay): Same as card click
  - **Preview Button** (hover overlay): Opens playlist in preview mode
  - **3-Dot Menu** (inline with title): Expand, Export, Add to Tab, Delete options

**2: File Manifest**

**UI/Components:**
- `src/components/Card.jsx`: Base card component with click handling
- `src/components/CardThumbnail.jsx`: Thumbnail with badges and overlay support
- `src/components/CardContent.jsx`: Content area for title/subtitle/metadata
- `src/components/CardActions.jsx`: Action buttons and menu wrapper
- `src/components/CardMenu.jsx`: 3-dot menu with submenu support
- `src/components/PlaylistsPage.jsx`: Uses Card components to render playlist cards

**State Management:**
- No card-specific state - cards are presentational components
- Parent component (`PlaylistsPage`) manages data and click handlers

**API/Bridge:**
- No direct API calls - cards receive data via props

**Backend:**
- No database tables - cards are UI components only

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Card Rendering Flow:**
   - Parent component passes props → `Card` receives `onClick`, `children`
   - `CardThumbnail` receives `src`, `alt`, `overlay`, `badges`
   - `CardContent` receives `title`, `subtitle`, `metadata`
   - `CardActions` receives `menuOptions`, `onMenuOptionClick`
   - Components compose together → Renders complete card

2. **Click Handling Flow:**
   - User clicks card → `Card.handleClick()` (Card.jsx line 20)
   - Checks for action areas → `data-card-action`, `data-card-menu` attributes
   - If clicked in action area → Returns early, doesn't trigger card click
   - If clicked on card body → Calls `onClick` prop → Parent handles action

3. **Hover Overlay Flow:**
   - User hovers card → CSS `group-hover:bg-black/40` activates
   - Overlay becomes visible → Play/preview buttons appear
   - User clicks button → `e.stopPropagation()` prevents card click
   - Button's `onClick` handler fires → Parent handles action

4. **Menu Interaction Flow:**
   - User clicks 3-dot menu → `CardMenu` opens dropdown
   - User selects option → `onMenuOptionClick(option, context)` called
   - Parent component handles action → May call API, update state
   - Menu closes automatically after selection

**Source of Truth:**
- Parent component's state - Cards are presentational, no internal state

**State Dependencies:**
- When parent's data changes → Cards re-render with new props
- When card clicked → Parent's handler updates state → May trigger navigation or API call
- When menu option selected → Parent's handler executes → May update database, refresh grid

---

#### ### 4.1.2 Videos Page

**1: User-Perspective Description**

Users see a 3-column grid of video cards showing videos from the current playlist:

- **Header**: Top of page shows:
  - **Sort Dropdown**: "Sort by" dropdown with options:
    - "Default Order" (playlist order)
    - "Watch Progress" (sorts by view percentage)
  - **Progress Filters** (visible when "Watch Progress" selected):
    - **Sort Direction**: Toggle between Ascending/Descending.
    - **Show Unwatched**: Toggle to include/exclude unwatched (0%) videos.
    - **Hide Watched**: Toggle to hide fully watched (≥85%) videos.
  - **Add Button**: Opens the Config Playlist Modal (pre-selecting current playlist) to add videos/playlists.
  - **Bulk Tag Mode Toggle**: Button to enter/exit bulk tagging mode
  - **Save/Cancel Buttons**: Appear when in bulk tag mode
  - **Pagination Controls**: For performance, videos are paginated (50 videos per page). Previous/Next controls appear at the bottom of the grid.

  - **Page Banner**: 
  - **Location**: Displayed at the top of the scrollable content area, above the Sticky Video Carousel.
  - **Content**: Shows the title (Playlist Name, "{Color} Folder", custom folder name, or "Unsorted Videos") and description text.
  - **Metadata**: Displays video count, creation year (hardcoded 2026), and **Author Identity**:
    - Shows the user's configured **Display Name** and **ASCII Avatar** (from Settings).
    - **Single-line Avatar**: Rendered large (text-3xl) as a watermark.
    - **Multi-line Avatar**: Rendered in a compact monospace block (text-[4px]) below the name.
  - **Styling**: Uses vibrant gradients (matching folder color) and glassmorphism effects for a premium look.
  - **Background Pattern**: Features a smooth, continuously moving diagonal stripe pattern overlay (`animate-diagonal-pattern`) that adapts to any background color.
  - **Edit Button**: Small pen icon in the top-left corner (on hover) allows renaming the playlist or colored folder and updating its description via `EditPlaylistModal`. Custom folder names persist in `folder_metadata`. (Not available for Unsorted Videos).
  - **Continue Watching**: A "CONTINUE?" section appears in the bottom-right corner if the playlist/folder has a recently watched video.
    - Displays "CONTINUE?" text and the video thumbnail.
    - Hovering reveals a Play icon.
    - Clicking resumes the most recently watched video.

- **Sticky Video Carousel**: 
  - **Purpose**: Displays important videos at the very top of the page.
  - **Behavior**:
    - **Copy vs Move**: Stickied videos are *copied* to the carousel (they remain in the regular grid properly sorted).
    - **Scoped State**: Sticky status is scoped per playlist AND per folder context. A video stickied in the "Red" folder only appears in the "Red" folder's carousel.
    - **Root Context**: Videos stickied in the main "All Videos" view only appear in the root carousel.
    - **Unsorted Exclusion**: The carousel is hidden on the "Unsorted" view.
    - **Filter Immunity**: Videos in the Sticky Carousel are immune to watch time filters (e.g., "Hide Watched"), ensuring they remain visible regardless of their watch status.
  - **Format**: 
    - 1-3 stickied videos: Displayed in a standard grid layout.
    - 4+ stickied videos: Displayed in a horizontal carousel (scrollable via side buttons, visible horizontal scrollbar, and touch-style drag-to-scroll).
  - **Controls**: Sticky status toggled via video 3-dot menu ("Sticky Video" / "Unsticky Video").
  - **Persistence**: Scoped ID sets are persisted to localStorage (`sticky-storage`).

- **Video Grid**: 3-column grid of video cards (see 4.1.2.1)

- **Folder Filtering**: When a folder is selected (via FolderSelector), only videos in that folder are shown

- **Preview Mode**: When a playlist is being previewed (not yet loaded), shows preview items with visual indicator

- **Empty States**:
  - No playlist loaded: "No playlist selected"
  - No videos: "No videos in this playlist"
  - Folder selected with no videos: Empty grid

**2: File Manifest**

**UI/Components:**
- `src/components/VideosPage.jsx`: Main videos grid page component
- `src/components/VideoCard.jsx`: Individual video card component
- `src/components/Card.jsx`: Base card component
- `src/components/CardThumbnail.jsx`: Thumbnail component
- `src/components/CardContent.jsx`: Content component
- `src/components/CardActions.jsx`: Actions component
- `src/components/BulkTagColorGrid.jsx`: Color grid overlay for bulk tagging
- `src/components/FolderSelector.jsx`: Folder filter selector
- `src/components/PlaylistSelectionModal.jsx`: Modal for selecting playlist (Move/Copy actions)
- `src/components/StickyVideoCarousel.jsx`: Sticky video grid/carousel component
- `src/components/PageBanner.jsx`: Banner component for playlist/folder titles
- `src/components/EditPlaylistModal.jsx`: Modal for editing playlist metadata


**State Management:**
- `src/store/playlistStore.js`:
  - `currentPlaylistItems`: Array of videos in current playlist
  - `previewPlaylistItems`: Array of videos in preview playlist (null when not previewing)
  - `currentPlaylistId`: Current playlist ID
  - `previewPlaylistId`: Preview playlist ID
- `src/store/stickyStore.js`:
  - `allStickiedVideos`: Map of scoped keys (`playlistId::folderId`) to video IDs
  - `toggleSticky(playlistId, videoId, folderId)`: Toggles sticky state
  - `isStickied(playlistId, videoId, folderId)`: Checks sticky state
- `src/store/folderStore.js`:
  - `selectedFolder`: Currently selected folder color (null = all)
  - `videoFolderAssignments`: Map of video ID to array of folder colors
  - `bulkTagMode`: Boolean for bulk tagging mode
  - `bulkTagSelections`: Map of video ID to Set of folder colors
- `src/components/VideosPage.jsx` (local state):
  - `displayedVideos`: Array of videos to show (filtered by folder)
  - `selectedVideoIndex`: Currently selected video index
  - `sortBy`: Sort option ('default', 'unwatched', 'watched', 'partially-watched')
  - `watchedVideoIds`: Set of video IDs with ≥85% progress
  - `videoProgress`: Map of video ID to progress percentage

**API/Bridge:**
- `src/api/playlistApi.js`:
  - `getVideosInFolder(playlistId, folderColor)` - Gets videos in folder
  - `getVideoFolderAssignments(playlistId, itemId)` - Gets folder assignments for video
  - `assignVideoToFolder(playlistId, itemId, folderColor)` - Assigns video to folder
  - `unassignVideoFromFolder(playlistId, itemId, folderColor)` - Removes folder assignment
  - `removeVideoFromPlaylist(playlistId, itemId)` - Removes video from playlist
  - `getWatchedVideoIds()` - Gets video IDs with ≥85% progress
  - `getAllVideoProgress()` - Gets all video progress data

**Backend:**
- `src-tauri/src/commands.rs`: Tauri command handlers
- `src-tauri/src/database.rs`: SQLite operations
- Database tables:
  - `playlist_items`: Videos in playlists
  - `video_folder_assignments`: Folder assignments
  - `video_progress`: Video playback progress

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Load Videos Flow:**
   - Component mounts or playlist changes → `useEffect` (VideosPage.jsx line 50)
   - Checks for preview items → `previewPlaylistItems || currentPlaylistItems`
   - Sets `activePlaylistItems` → Used for display
   - Loads folder assignments → `getVideoFolderAssignments()` for each video
   - Updates `videoFolderAssignments` in store → Cards show folder indicators

2. **Folder Filtering Flow:**
   - User selects folder → `setSelectedFolder(folderColor)` (FolderSelector)
   - `useEffect` (line 149) triggers → `filterVideos()`
   - If `selectedFolder === null` → Shows all videos from `activePlaylistItems`
   - If `selectedFolder` set → Calls `getVideosInFolder(playlistId, folderColor)`
   - Updates `displayedVideos` → Grid re-renders with filtered videos

3. **Sorting Flow:**
   - User selects sort option → `setSortBy(option)` (line 42)
   - `useMemo` (line 385) recalculates → `sortedVideos`
   - Sort logic:
     - **Default**: No sorting, original order
     - **Unwatched**: Videos with 0% progress
     - **Partially Watched**: Videos with >0% and <85% progress
     - **Watched**: Videos with ≥85% progress
   - Grid re-renders with sorted videos

4. **Bulk Tag Mode Flow:**
   - User clicks "Bulk Tag Mode" → `setBulkTagMode(true)` (line 30)
   - Cards enter bulk tag mode → Hover shows color grid overlay
   - User hovers video → `BulkTagColorGrid` appears
   - User clicks colors → `toggleBulkTagSelection(videoId, folderColor)` (line 288)
   - Updates `bulkTagSelections` → Visual feedback (checkmarks)
   - User clicks "Save" → `handleSaveBulkTags()` (line 291)
   - Loops through selections → `assignVideoToFolder()` / `unassignVideoFromFolder()`
   - Refreshes folder assignments → Grid updates
   - Exits bulk tag mode → `setBulkTagMode(false)`

5. **Video Click Flow:**
   - User clicks video card → `handleVideoClick(video, index)` (line 278)
   - If bulk tag mode → Returns early, doesn't play
   - Finds original index → `activePlaylistItems.findIndex()`
   - Updates `selectedVideoIndex` → Card highlights
   - Calls `onVideoSelect(video.video_url)` → Starts playing video

6. **Progress Tracking Flow:**
   - Component mounts → `useEffect` (line 70) loads progress data
   - Calls `getWatchedVideoIds()` → Gets videos with ≥85% progress
   - Calls `getAllVideoProgress()` → Gets all progress percentages
   - Updates local state → `watchedVideoIds` Set, `videoProgress` Map
   - **Polling:** Component sets up interval to poll `getAllVideoProgress()` every 5 seconds to keep data fresh.
   - When current video changes → `useEffect` (line 92) refreshes progress (debounced 2s)
   - Sorting uses progress data → Determines watch status

**Source of Truth:**
- Database `playlist_items` table - Source of Truth for videos
- Database `video_folder_assignments` table - Source of Truth for folder assignments
- Database `video_progress` table - Source of Truth for progress data
- `playlistStore.currentPlaylistItems` - Cached video array
- `playlistStore.previewPlaylistItems` - Preview video array (null when not previewing)
- `folderStore.selectedFolder` - Currently selected folder filter

**State Dependencies:**
- When `currentPlaylistItems` changes → Videos loaded → Grid updates
- When `previewPlaylistItems` set → Preview mode active → Shows preview items
- When `selectedFolder` changes → `displayedVideos` filtered → Grid shows only folder videos
- When `sortBy` changes → `sortedVideos` recalculated → Grid re-sorted
- When `bulkTagMode` changes → Cards enter/exit bulk mode → UI changes
- When folder assigned → `videoFolderAssignments` updated → Card star icon updates
- When video progress updates → `videoProgress` Map updated → Sorting may change

---

#### ### 4.1.2.1 Videos Card

**1: User-Perspective Description**

Users see video cards built using the Card component system with video-specific features:

- **Card Structure**:
  - **Thumbnail Area**: 16:9 aspect ratio
    - Image: Video thumbnail from YouTube
    - **Badges**:
      - **Top-left**: "Now Playing" badge (blue, only on currently playing video)
      - **Bottom-left**: Video number badge (e.g., "#1", "#42")
      - **Bottom-right**: Pin icon button (amber when pinned, gray when not)
      - **Top-right**: (Empty)
    - **Progress Bar**: Red horizontal line at the bottom of the thumbnail indicating watch progress percentage.
    - **Hover Overlay**: Play button (blue) and priority pin button (amber/yellow pin icon)
    - **Bulk Tag Overlay**: When in bulk tag mode, color grid appears on hover
    - **Star Color Picker Overlay**: When hovering over star icon for 1.2 seconds, a grid of 16 colored stars appears centered at the top of the thumbnail

- **Content Area**:
  - **Title**: Video title, dark blue text (RGB(5, 47, 74) / #052F4A), truncates
  - **Hidden by default (visible on hover)**:
    - **Subtitle**: Video ID, gray text
    - **Actions** (bottom-right): Star icon (for quick folder assign) and 3-dot menu

- **Visual States**:
  - **Default**: Gray border, thumbnail and title visible
  - **Selected**: Blue border (when video is selected)
  - **Playing**: Blue border with ring (when currently playing)
  - **Hover**: Lighter background, play buttons, pin button (bottom-right), menu, star, and subtitle appear

- **Interactive Elements**:
  - **Card Click**: Plays video in main player
  - **Play Button** (hover): Same as card click
  - **Priority Pin Button** (hover): Sets video as priority pin (amber/yellow pin icon, 48px × 48px). Shows filled icon if video is already priority pin, outline if not.
  - **Star Icon** (top-right): 
    - **Quick Click**: Assigns/unassigns video to quick assign folder (uses quick assign color preference)
    - **Hover (1.2s delay)**: Shows star color picker menu with 16 colored stars
      - **Left Click on Color Star**: Assigns/unassigns video to that folder color
      - **Right Click on Color Star**: Sets that color as the new quick assign default
    - Star outline color reflects the current quick assign folder color (when video has no folder assignments)
  - **Pin Icon** (bottom-right): Pins/unpins video (session-only, normal pin)
  - **3-Dot Menu** (top-right):
    - **Move to Playlist**: Opens modal to move video to another playlist (removes from current)
    - **Copy to Playlist**: Opens modal to copy video to another playlist (keeps in current)
    - **Assign to Folder**: Opens submenu to assign video to color folder
    - **Quick Assign**: Sets specific folder color as quick assign preference
    - **Delete**: Removes video from playlist
  - **Bulk Tag Grid** (hover in bulk mode): 16-color grid for bulk tagging

**2: File Manifest**

**UI/Components:**
- `src/components/VideoCard.jsx`: Video card component with all video-specific logic
- `src/components/Card.jsx`: Base card component
- `src/components/CardThumbnail.jsx`: Thumbnail with badges
- `src/components/CardContent.jsx`: Content area
- `src/components/CardActions.jsx`: Star and menu actions
- `src/components/BulkTagColorGrid.jsx`: Color grid for bulk tagging
- `src/components/StarColorPicker.jsx`: Star color picker menu (hover menu for folder assignment)
- `src/components/CardMenu.jsx`: 3-dot menu

**State Management:**
- `src/store/folderStore.js`:
  - `quickAssignFolder`: Default folder color for quick assign
  - `bulkTagMode`: Boolean for bulk tagging mode
  - `bulkTagSelections`: Map of video ID to Set of folder colors
- `src/store/pinStore.js`:
  - `pinnedVideos`: Array of pinned videos (session-only)
  - `priorityPinId`: ID of priority pin (null if none)
  - `isPinned(videoId)`: Checks if video is pinned
  - `isPriorityPin(videoId)`: Checks if video is priority pin
  - `togglePin(video)`: Toggles pin status (normal pin)
  - `setFirstPin(video)`: Sets video as priority pin
- `src/components/VideoCard.jsx` (local state):
  - `isHovered`: Boolean for bulk tag hover state
  - `isStarHovered`: Boolean for star hover menu state
  - `starHoverTimeoutRef`: Ref for managing hover hide timeout
  - `starHoverDelayRef`: Ref for managing 1.2s delay before showing menu

**API/Bridge:**
- `src/api/playlistApi.js`:
  - `assignVideoToFolder(playlistId, itemId, folderColor)` - Assigns video to folder
  - `unassignVideoFromFolder(playlistId, itemId, folderColor)` - Removes folder assignment
  - `removeVideoFromPlaylist(playlistId, itemId)` - Removes video from playlist

**Backend:**
- `src-tauri/src/commands.rs`: Tauri command handlers
- `src-tauri/src/database.rs`: SQLite operations
- Database tables:
  - `playlist_items`: Videos
  - `video_folder_assignments`: Folder assignments

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Card Rendering Flow:**
   - Parent (`VideosPage`) passes video data → `VideoCard` receives props
   - Determines folder assignments → `videoFolders` prop from parent
   - Checks if pinned → `isPinned(video.id)` from `pinStore`
   - Checks if playing → `isCurrentlyPlaying` prop (compares with `currentVideoIndex`)

   - Builds badges array → "Now Playing", video number, pin icon
   - **Quick Assign Star**: Rendered as a hover-only badge on the top-right of the thumbnail.
   - **3-Dot Menu**: Passed to `CardContent` via `headerActions` prop, rendered inline with the title.
   - Renders card → Uses `Card`, `CardThumbnail`, `CardContent`

2. **Star Click Flow (Quick Assign):**
   - User clicks star icon → `onStarClick` handler (VideoCard.jsx)
   - Gets current folders → `videoFolderAssignments[video.id]`
   - Gets quick assign folder → `quickAssignFolder` from store
   - Checks if assigned → `currentFolders.includes(targetFolder)`
   - If assigned → `unassignVideoFromFolder()` → Removes assignment
   - If not assigned → `assignVideoToFolder()` → Adds assignment
   - Updates local state → `setVideoFolders()` updates store
   - Star icon updates → Filled if assigned, outline if not

2a. **Star Hover Menu Flow:**
   - User hovers over star icon → `onMouseEnter` triggers (VideoCard.jsx)
   - 1.2 second delay starts → `starHoverDelayRef` timeout set
   - If mouse leaves before delay → Timeout cleared, menu doesn't appear
   - After 1.2 seconds → `setIsStarHovered(true)` → `StarColorPicker` appears
   - Menu positioned: Centered horizontally, near top of thumbnail (`pt-2`)
   - Menu shows 16 colored stars in 4×4 grid:
     - Each star shows folder color as background
     - Assigned folders: White ring, filled star icon
     - Quick assign folder: Blue ring indicator with blue dot badge
     - Unassigned folders: Outline star icon
   - **Left Click on Color Star:**
     - Calls `onStarColorLeftClick(video, folderColor)` → `handleStarColorLeftClick()` (VideosPage.jsx)
     - Toggles folder assignment → `assignVideoToFolder()` or `unassignVideoFromFolder()`
     - Updates `videoFolderAssignments` → Star icon updates
     - Menu closes → `setIsStarHovered(false)`
   - **Right Click on Color Star:**
     - Calls `onStarColorRightClick(folderColor)` → `handleStarColorRightClick()` (VideosPage.jsx)
     - Sets as quick assign default → `setQuickAssignFolder(folderColor)`
     - Updates localStorage → Preference persisted
     - Menu closes → `setIsStarHovered(false)`
   - If mouse moves to menu → Hover state maintained, menu stays visible
   - If mouse leaves menu area → 150ms delay, then menu closes

3. **Star Icon Color Display:**
   - Star icon outline color reflects `quickAssignFolder` when video has no folder assignments
   - If video has folder assignments → Star shows primary folder color (filled)
   - Color updates when `quickAssignFolder` changes in `folderStore`

4. **Pin Click Flow (Normal Pin):**
   - User clicks pin icon → `handlePinClick()` (line 151)
   - Calls `togglePin(video)` → Updates `pinStore.pinnedVideos`
   - Pin icon updates → Amber if pinned, gray if not
   - Session-only → Not persisted, cleared on app restart

5. **Priority Pin Click Flow:**
   - User clicks priority pin button in hover overlay → `handlePriorityPinClick()` (line 170)
   - Calls `setFirstPin(video)` → Updates `pinStore.priorityPinId`
   - If another priority pin exists → It's replaced (only one priority pin at a time)
   - Priority pin button icon updates → Filled if video is priority pin, outline if not
   - Priority pin appears first in pin track with larger size and amber border

6. **Menu Option Flow:**
   - User clicks 3-dot menu → `CardMenu` opens
   - User selects option → `onMenuOptionClick(option, video)` (VideosPage.jsx line 182)
   - Handles actions:
     - **Delete**: Confirms, calls `removeVideoFromPlaylist()`, removes from grid
     - **Assign to Folder**: Opens submenu, user selects color, toggles assignment
     - **Quick Assign**: Opens submenu, user selects color, sets as quick assign preference
   - Menu closes after selection

7. **Bulk Tag Flow:**
   - User enters bulk tag mode → `bulkTagMode: true`
   - User hovers video → `setIsHovered(true)` (line 247)
   - `BulkTagColorGrid` appears → Shows 16-color grid overlay
   - User clicks color → `onBulkTagColorClick(video, folderColor)` (line 287)
   - Toggles selection → `toggleBulkTagSelection(video.id, folderColor)`
   - Visual feedback → Checkmark appears on selected colors
   - User clicks "Save" → Parent handles bulk save (see VideosPage flow)

**Source of Truth:**
- Database `video_folder_assignments` table - Source of Truth for folder assignments
- `pinStore.pinnedVideos` - Session-only pin state (not persisted, priority pin always first)
- `pinStore.priorityPinId` - Priority pin ID (session-only, not persisted)
- `folderStore.quickAssignFolder` - Quick assign preference (persisted to localStorage)
- Parent component's state - Video data and folder assignments

**State Dependencies:**
- When `videoFolders` changes → Star icon updates → Filled if assigned, outline if not
- When `quickAssignFolder` changes → Star outline color updates (when video has no folders)
- When `isStarHovered` changes → Star color picker menu appears/disappears
- When `isPinned` changes → Pin icon updates → Amber if pinned, gray if not
- When `isPriorityPin` changes → Priority pin button icon updates → Filled if priority, outline if not
- When `isCurrentlyPlaying` changes → "Now Playing" badge appears/disappears
- When `bulkTagMode` changes → Hover behavior changes → Color grid appears on hover, star menu hidden
- When folder assigned → Parent updates `videoFolderAssignments` → Star icon updates, menu reflects changes
- When video pinned → `pinStore` updates → Pin icon updates
- When priority pin set → `pinStore.priorityPinId` updates → Priority pin button icon updates

---

#### ### 4.1.3 History Page

**1: User-Perspective Description**

Users see a vertical list of history cards showing the last 100 watched videos:

- **History Cards**: Each card displays in a horizontal layout:
  - **Thumbnail** (Left): Video thumbnail (16:9 aspect ratio, fixed width).
  - **Content** (Right):
    - **Title**: Video title, large and bold.
    - **Subtitle**: Relative time (e.g., "2 hours ago") with a Clock icon.
  - **Hover Overlay**: Play button appears centered on the thumbnail.

- **Deduplication**: If a video is re-watched, it is moved to the top of the list (most recent) to prevent duplicates.

- **Empty States**:
  - Loading: "Loading history..." message
  - No history: "No watch history yet" message

- **List Layout**: Vertical stack of horizontal cards.

**2: File Manifest**

**UI/Components:**
- `src/components/HistoryPage.jsx`: Main history grid page component
- `src/components/Card.jsx`: Base card component
- `src/components/CardThumbnail.jsx`: Thumbnail component
- `src/components/CardContent.jsx`: Content component

**State Management:**
- `src/components/HistoryPage.jsx` (local state):
  - `history`: Array of watch history items
  - `loading`: Boolean for loading state

**API/Bridge:**
- `src/api/playlistApi.js`:
  - `getWatchHistory(limit)` - Gets watch history (last N videos)

**Backend:**
- `src-tauri/src/commands.rs`: Tauri command handlers
- `src-tauri/src/database.rs`: SQLite operations
- Database tables:
  - `watch_history`: Watch history records (id, video_url, video_id, title, thumbnail_url, watched_at)

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Load History Flow:**
   - Component mounts → `useEffect` (HistoryPage.jsx line 17)
   - Calls `loadHistory()` → `getWatchHistory(100)` → Gets last 100 videos
   - Updates `history` state → Grid renders cards
   - Sets `loading: false` → Loading message disappears

2. **Time Formatting Flow:**
   - History item has `watched_at` timestamp → `formatDate(dateString)` (line 40)
   - Calculates time difference → `now - date`
   - Formats relative time:
     - < 1 minute: "Just now"
     - < 60 minutes: "X minutes ago"
     - < 24 hours: "X hours ago"
     - < 7 days: "X days ago"
     - Older: Actual date (e.g., "Jan 15, 2024")

3. **Video Click Flow:**
   - User clicks history card → `handleVideoClick(item)` (line 34)
   - Calls `onVideoSelect(item.video_url)` → Parent handles
   - `App.jsx` routes to main player via `handleVideoSelect()`:
     - Searches through all playlists to find containing playlist
     - When found → Loads playlist items, sets playlist context, sets video index, starts playing
   - Video starts playing → Watch history may be updated

**Source of Truth:**
- Database `watch_history` table - Source of Truth for watch history (ordered by `watched_at DESC`)

**State Dependencies:**
- When component mounts → History loaded → Grid displays cards
- When video played → New entry added to watch history → History page would update on next load
---

#### ### 4.1.4 Playlist Selection Modal

**1: User-Perspective Description**

Users see a modal dialog when selecting "Move to Playlist" or "Copy to Playlist" from a video card's menu:

- **Modal Structure**:
  - **Header**: Title ("Move to Playlist" or "Copy to Playlist") and close button (X)
  - **Content**: Scrollable list of all available playlists
  - **Loading State**: Spinner while playlists fetch
  - **Empty/Error States**: Specific messages if no playlists found or fetch fails
  - **Footer**: Cancel button

- **Playlist List**:
  - Each item shows playlist icon, name, and description
  - Click to select destination playlist
  - Hover effects highlight selection

**2: File Manifest**

**UI/Components:**
- `src/components/PlaylistSelectionModal.jsx`: Modal component
- `src/components/VideosPage.jsx`: Parent handling modal state

**State Management:**
- `src/components/VideosPage.jsx` (local state):
  - `showPlaylistSelector`: Boolean visibility toggle
  - `selectedVideoForAction`: Video object being moved/copied
  - `actionType`: 'move' | 'copy'

**API/Bridge:**
- `src/api/playlistApi.js`:
  - `getAllPlaylists()` - Fetches playlists for list
  - `addVideoToPlaylist()` - Used for Copy/Move (add step)
  - `removeVideoFromPlaylist()` - Used for Move (remove step)

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Open Modal:**
   - User selects Move/Copy in video menu → `handleMenuOptionClick`
   - Sets `selectedVideoForAction` and `actionType`
   - Sets `showPlaylistSelector(true)` → Modal appears

2. **Select Playlist:**
   - User clicks playlist → `handlePlaylistSelect(playlistId)`
   - **Copy**: Calls `addVideoToPlaylist`
   - **Move**: Calls `addVideoToPlaylist` then `removeVideoFromPlaylist` (from source)
     - Updates UI (removes video from grid if moved)
   - Closes modal and clears state


#### ### 4.1.5 Likes Page

**1: User-Perspective Description**

Access specific videos that have been marked as "Liked". This page aggregates all videos from the special "Likes" playlist.

- **Grid View**: Displays video cards in a standard grid.
- **Auto-Generated**: The "Likes" playlist is automatically created if it does not exist.
- **Navigation**: Accessible via the "Like" (Heart) icon in the top navigation.

**2: File Manifest**

**UI/Components:**
- `src/components/LikesPage.jsx`: Page component fetching and rendering liked videos.

**3: The Logic & State Chain**

**Initialization:**
- On mount, fetches all playlists to find one named "Likes".
- If missing, creates it.
- Fetches items from that playlist ID.

---

#### ### 4.1.6 Pins Page

**1: User-Perspective Description**

Access videos that have been temporarily pinned during the current session.

- **Session-Based**: Pins are ephemeral and cleared when the application closes (unlike Likes which are persistent).
- **Grid View**: Displays pinned video cards.
- **Pinning**: Videos can be pinned from any video card using the pin icon.
- **Navigation**: Accessible via the "Pins" (Pin) icon in the top navigation.

**2: File Manifest**

**UI/Components:**
- `src/components/PinsPage.jsx`: Page component rendering pinned videos.
- `src/store/pinStore.js`: State management for pinned videos.

**3: The Logic & State Chain**

**Source of Truth:**
- `usePinStore.pinnedVideos`: Array of video objects pinned in memory.

---

#### ### 4.1.7 Settings Page

**1: User-Perspective Description**

Users access the configuration area via the "Config" (Settings icon) button on the main Player Controller orb. The Settings Page provides a tabbed interface for application-wide customization:

- **Theme Tab**:
  - Allows selection of the global visual theme (e.g., Blue, Rose, Amber, etc.).
  - Displays preview cards for each theme.
  - Changes apply immediately to the entire application.

- **Signature Tab**:
  - **Pseudonym**: Text input to set the username shown on banners.
  - **Signature**:
    - **Preset ASCII Art**: Grid of predefined ASCII avatars.
    - **Custom ASCII**: Input field to paste custom multi-line ASCII art.
  - **Preview**: Live preview of how the name and avatar will appear on the Page Banner.
  - **External Resources**:
    - **ASCII Art Banner**: A large, interactive banner linking to *EmojiCombos.com* for finding or creating ASCII art. Opens in the user's default browser.

- **Orb Tab**:
  - **Custom Orb Image**:
    - **Upload**: Button to select a local image file for the central orb.
    - **Preview**: Shows the currently selected custom image.
    - **Remove**: Button to clear the custom image and revert to default.
  - **Spill Controls**:
    - **Spill Toggle**: Master switch to enable/disable image overflow (spill).
    - **Quadrant Selection**: An interactive visualizer allows users to click four quadrants (TL, TR, BL, BR) to individually enable/disable spill for that corner.
    - **Visual Feedback**: The visualizer shows the image with a circular mask and highlights selected spill areas using the actual image data.
  - **Image Scaling**:
    - **Zoom Slider**: A range slider (0.5x to 3.0x) allows users to zoom the orb image in/out within the spill boundaries.
  - **External Resources**:
    - **Background Removal Banner**: A large, interactive banner linking to *remove.bg* for easily removing backgrounds from images. This facilitates the creation of "pop-out" 3D effects when used with the Orb's spill functionality. Opens in the user's default browser.
    - **Pro Tip**: A dedicated section explaining how to handle cropped or "zoomed-in" images using generative fill.
      - Includes an example image (`tip.png`).
      - Provides a **copyable prompt** for use with AI generation tools to "zoom out" and extend artwork while maintaining style.

**2: File Manifest**

**UI/Components:**
- `src/components/SettingsPage.jsx`: Main settings container and tabs.
- `src/store/configStore.js`: centralized state for all settings.

**State Management:**
- `src/store/configStore.js`:
  - `currentThemeId`: Active theme ID.
  - `userName`: User's display name.
  - `userAvatar`: User's ASCII avatar string.
  - `customOrbImage`: Base64 string of uploaded orb image.
  - `isSpillEnabled`: Boolean master toggle for orb spill.
  - `orbSpill`: Object `{ tl: bool, tr: bool, bl: bool, br: bool }` for quadrant control.
  - `orbImageScale`: Float (0.5 - 3.0) for image zooming.
  - All state is persisted to `localStorage` via Zustand persist middleware.

**3: The Logic & State Chain**

**Trigger → Action → Persistence Flow:**

1. **Orb Image Upload:**
   - User selects file → `FileReader` reads as Data URL.
   - `setCustomOrbImage(dataUrl)` updates store.
   - Store persists to `localStorage`.
   - `PlayerController` detects change → Updates orb image source.

2. **Spill Configuration:**
   - User toggles quadrant → `setOrbSpill({ ...orbSpill, [q]: !val })` updates store.
   - `PlayerController` detects change → Re-renders SVG `clipPath` with/without specific `<rect>` elements for that quadrant.
   - Image overflows or clips accordingly.

3. **Image Scaling:**
    - User drags slider → `setOrbImageScale(val)` updates store.
    - `PlayerController` applies CSS transform scale to the image element.

---

#### ### 4.1.8 Support Page

**1: User-Perspective Description**

The Support Page acts as a central hub for community engagement, resources, and developer connection. It features a unique **Radial Ring UI** that is distinct from the rest of the grid-based interface.

- **Radial Ring Layout**:
  - A central hub featuring 5 interactive segments arranged in a circle.
  - **Segments**:
    1.  **Code**: Links to the open-source GitHub repository.
    2.  **Developer**: Links to the head developer's X (Twitter) profile.
    3.  **Community**: Links to the Discord community server.
    4.  **Future Plans**: Navigates to a "Promo" playlist within the app detailing future projects.
    5.  **Resources**: Navigates to a "Resources" playlist helping users get started.
  - **Interactions**:
    - Hovering a segment expands it and updates the specific information card below.
    - Clicking an external link segment opens the URL in the system browser.
    - Clicking an internal link segment (Future Plans, Resources) navigates to the respective playlist in the Videos view.

- **Visual Design**:
  - Features a custom SVG implementation for the segmented ring.
  - Includes complex gradients and hover animations (scale, opacity, drop shadow).
  - Background includes a subtle dot matrix pattern with a radial mask.

**2: File Manifest**

**UI/Components:**
- `src/components/SupportPage.jsx`: Standalone page component implementing the custom radial UI.
- `src/components/TopNavigation.jsx`: Updated to include "Support" tab.

**State Management:**
- `src/store/navigationStore.js`: Handles routing to `support` page.
- `src/store/playlistStore.js`: Handles searching for and setting active playlists for internal navigation links.

**3: The Logic & State Chain**

**Internal Navigation Flow (Promo/Resources):**
1. User clicks "Future Plans" or "Resources" segment.
2. `navigateToPlaylist(keyword)` function is triggered.
3. Searches loaded playlists for name match (case-insensitive).
4. If found:
   - Fetches playlist items via `getPlaylistItems()`.
   - Updates `playlistStore` with new items.
   - Sets `navigationStore.currentPage` to `'videos'`.
5. If not found:
   - Displays alert to user.