# Files Needed for PlaylistsPage C# Refactor

This document lists all files required to get the PlaylistsPage working in a C# refactor.

## 📋 Overview

The PlaylistsPage is the main playlist grid view. To get it working, you need:
- **1 Main Component** (PlaylistsPage)
- **8 Child Components** (modals, menus, banners, skeletons)
- **7 State Management Stores** (Zustand → C# equivalent needed)
- **1 API Layer File** (Tauri commands → C# backend methods needed)
- **2 Utility Files** (can be ported directly)
- **3 Documentation Files** (for reference)
- **Backend Database Schema** (Rust → C# SQLite needed)

---

## 🎯 Core Component

### 1. Main Component
- **`src/components/PlaylistsPage.jsx`** (1,343 lines)
  - Main playlist grid page
  - Handles playlist/folder display, expansion, sticky folders, tab filtering
  - **Needs**: React → C# UI framework (WPF/MAUI/Avalonia) conversion

---

## 🧩 Child Components (8 files)

### 2. Modals & Uploaders
- **`src/components/PlaylistUploader.jsx`**
  - Single playlist import modal (YouTube URL, JSON import)
  - **Needs**: React → C# modal conversion

- **`src/components/BulkPlaylistImporter.jsx`**
  - Bulk import modal with 17 fields
  - **Needs**: React → C# modal conversion

- **`src/components/LocalVideoUploader.jsx`**
  - Local video file upload modal
  - **Needs**: React → C# file picker integration

- **`src/components/AddPlaylistToTabModal.jsx`**
  - Modal for adding playlists to tabs
  - **Needs**: React → C# modal conversion

### 3. UI Components
- **`src/components/TabBar.jsx`** (280 lines)
  - Tab navigation bar with create/rename/delete
  - **Needs**: React → C# component conversion

- **`src/components/TabPresetsDropdown.jsx`** (318 lines)
  - Tab preset selector dropdown
  - **Needs**: React → C# dropdown component

- **`src/components/PageBanner.jsx`**
  - Banner component with metadata display
  - **Needs**: React → C# component conversion

- **`src/components/NewCardMenu.jsx`** (imported as `CardMenu`)
  - 3-dot menu with submenu support
  - **Needs**: React → C# context menu conversion

- **`src/components/UnifiedBannerBackground.jsx`**
  - Banner background component
  - **Needs**: React → C# component conversion

### 4. Loading States
- **`src/components/skeletons/PlaylistCardSkeleton.jsx`**
  - Loading skeleton for playlist cards
  - **Needs**: React → C# loading state component

---

## 🗄️ State Management (7 Zustand Stores → C# Equivalent)

These need to be converted to C# state management (MVVM, dependency injection, or similar):

### 5. Core Stores
- **`src/store/playlistStore.js`** (415 lines)
  - Current playlist items, navigation, preview state
  - **Key State**: `currentPlaylistItems`, `currentPlaylistId`, `allPlaylists`, `navigationItems`
  - **Key Methods**: `setPlaylistItems()`, `setPreviewPlaylist()`, `setAllPlaylists()`

- **`src/store/folderStore.js`** (125 lines)
  - Folder filtering, assignments, bulk tagging
  - **Key State**: `selectedFolder`, `showColoredFolders`, `videoFolderAssignments`
  - **Key Methods**: `setSelectedFolder()`, `setShowColoredFolders()`

- **`src/store/tabStore.js`** (124 lines)
  - Tab management (localStorage persisted)
  - **Key State**: `tabs`, `activeTabId`
  - **Key Methods**: `createTab()`, `deleteTab()`, `addPlaylistToTab()`, `removePlaylistFromTab()`
  - **Persistence**: localStorage → C# settings/registry

- **`src/store/tabPresetStore.js`** (98 lines)
  - Tab preset management (localStorage persisted)
  - **Key State**: `presets`, `activePresetId`
  - **Key Methods**: `createPreset()`, `deletePreset()`, `updatePreset()`, `setActivePreset()`
  - **Persistence**: localStorage → C# settings/registry

- **`src/store/layoutStore.js`** (49 lines)
  - View mode, debug toggles
  - **Key State**: `viewMode`, `inspectMode`
  - **Key Methods**: `setViewMode()`, `toggleInspectMode()`

- **`src/store/navigationStore.js`** (28 lines)
  - Page navigation state
  - **Key State**: `currentPage`, `history`
  - **Key Methods**: `setCurrentPage()`, `goBack()`

- **`src/store/configStore.js`** (191 lines)
  - Theme/config settings (localStorage persisted)
  - **Key State**: Various UI positioning/config values
  - **Persistence**: localStorage → C# settings/registry

---

## 🔌 API Layer (Tauri → C# Backend)

### 6. Frontend API Wrapper
- **`src/api/playlistApi.js`** (382 lines)
  - All database operations via Tauri `invoke()` calls
  - **Needs**: Convert to C# service/interface that calls backend methods

### 7. Backend Commands (Rust → C#)
The following Tauri commands need C# equivalents:

**Playlist Operations:**
- `create_playlist(name, description?)` → `CreatePlaylist(string name, string? description)`
- `get_all_playlists()` → `GetAllPlaylists()`
- `get_playlist(id)` → `GetPlaylist(long id)`
- `update_playlist(id, name?, description?, customAscii?, customThumbnailUrl?)` → `UpdatePlaylist(...)`
- `delete_playlist(id)` → `DeletePlaylist(long id)`
- `delete_playlist_by_name(name)` → `DeletePlaylistByName(string name)`
- `get_all_playlist_metadata()` → `GetAllPlaylistMetadata()` (batch operation)

**Playlist Item Operations:**
- `get_playlist_items(playlist_id)` → `GetPlaylistItems(long playlistId)`
- `add_video_to_playlist(...)` → `AddVideoToPlaylist(...)`
- `remove_video_from_playlist(playlist_id, item_id)` → `RemoveVideoFromPlaylist(...)`

**Folder Operations:**
- `get_all_folders_with_videos()` → `GetAllFoldersWithVideos()` (batch operation)
- `get_folders_for_playlist(playlist_id)` → `GetFoldersForPlaylist(long playlistId)`
- `get_videos_in_folder(playlist_id, folder_color)` → `GetVideosInFolder(long playlistId, string folderColor)`
- `toggle_stuck_folder(playlist_id, folder_color)` → `ToggleStuckFolder(long playlistId, string folderColor)`
- `get_all_stuck_folders()` → `GetAllStuckFolders()`

**Video Progress:**
- `get_all_video_progress()` → `GetAllVideoProgress()` (batch operation)

**Export:**
- `export_playlist(playlist_id)` → Handled client-side in `playlistApi.js` (can stay client-side)

**Backend Files to Reference:**
- `src-tauri/src/commands.rs` - Command handlers (Rust)
- `src-tauri/src/database.rs` - SQLite operations (Rust)
- `src-tauri/src/models.rs` - Data structures (Rust)

---

## 🛠️ Utilities (2 files - Direct Port)

### 8. Utility Functions
- **`src/utils/folderColors.js`** (25 lines)
  - 16 folder color definitions
  - `getFolderColorById()` function
  - **Can port directly** to C# class/static methods

- **`src/utils/youtubeUtils.js`** (124 lines)
  - YouTube URL parsing, thumbnail generation
  - `extractVideoId()`, `getThumbnailUrl()`, `extractPlaylistId()`
  - **Can port directly** to C# static methods

---

## 📚 Documentation (3 files - Reference Only)

### 9. Documentation Files
- **`atlas/playlist&tab.md`**
  - Complete feature documentation
  - Logic flows, state chains, file manifest
  - **Use as reference** for understanding behavior

- **`atlas/database-schema.md`**
  - Complete SQLite schema reference
  - Table structures, relationships, indexes
  - **Use as reference** for database design

- **`atlas/api-bridge.md`**
  - API command reference
  - Parameter naming, error handling patterns
  - **Use as reference** for backend API design

---

## 💾 Database Schema (SQLite)

### 10. Database Tables
The following SQLite tables need to be created in C#:

1. **`playlists`** - Playlist metadata
   - Columns: `id`, `name`, `description`, `created_at`, `updated_at`, `custom_ascii`, `custom_thumbnail_url`

2. **`playlist_items`** - Videos in playlists
   - Columns: `id`, `playlist_id`, `video_url`, `video_id`, `title`, `thumbnail_url`, `author`, `view_count`, `published_at`, `position`, `added_at`, `is_local`

3. **`video_folder_assignments`** - Folder color assignments
   - Columns: `id`, `playlist_id`, `item_id`, `folder_color`, `created_at`
   - Unique: `(playlist_id, item_id, folder_color)`

4. **`stuck_folders`** - Sticky folder tracking
   - Columns: `id`, `playlist_id`, `folder_color`, `created_at`
   - Unique: `(playlist_id, folder_color)`

5. **`folder_metadata`** - Custom folder names/descriptions
   - Columns: `id`, `playlist_id`, `folder_color`, `custom_name`, `description`, `custom_ascii`, `created_at`, `updated_at`
   - Unique: `(playlist_id, folder_color)`

6. **`video_progress`** - Video playback progress (for batch loading)
   - Columns: `id`, `video_id`, `video_url`, `duration`, `last_progress`, `progress_percentage`, `last_updated`, `has_fully_watched`

**Reference**: See `atlas/database-schema.md` for complete schema with indexes and foreign keys.

---

## 📦 Dependencies

### Frontend Dependencies (React → C# Equivalent)
- **React 19.1.0** → C# UI framework (WPF/MAUI/Avalonia)
- **Zustand 5.0.9** → C# state management (MVVM, dependency injection)
- **lucide-react** (icons) → C# icon library or SVG icons
- **Tailwind CSS** → C# styling (XAML styles, or CSS-like framework)

### Backend Dependencies (Rust → C#)
- **rusqlite 0.32** → **System.Data.SQLite** or **Microsoft.Data.Sqlite**
- **serde/serde_json** → **System.Text.Json** or **Newtonsoft.Json**
- **chrono 0.4** → **System.DateTime** (built-in)

---

## 🔄 Conversion Priority

### Phase 1: Core Functionality
1. Database schema setup (SQLite in C#)
2. Backend API methods (C# service layer)
3. State management (C# stores/services)
4. Main PlaylistsPage component
5. Basic child components (TabBar, PageBanner)

### Phase 2: Full Features
6. Modal components (PlaylistUploader, BulkImporter, etc.)
7. Menu components (NewCardMenu, TabPresetsDropdown)
8. Loading states (skeletons)
9. Utility functions

### Phase 3: Polish
10. Styling/theming
11. Error handling
12. Performance optimization

---

## 📝 Notes

### Key Differences to Handle

1. **State Management**:
   - Zustand stores use reactive hooks → C# needs INotifyPropertyChanged or similar
   - localStorage persistence → C# needs Settings/Registry/JSON file

2. **API Calls**:
   - Tauri `invoke()` → C# service method calls (synchronous or async)
   - No automatic snake_case ↔ camelCase conversion needed (C# uses camelCase)

3. **UI Framework**:
   - React JSX → XAML (WPF) or C# markup (MAUI/Avalonia)
   - Tailwind classes → XAML styles or C# styling

4. **Event Handling**:
   - React `onClick` → C# `Click` event handlers
   - React hooks (`useState`, `useEffect`) → C# properties and lifecycle methods

5. **Async Operations**:
   - JavaScript `async/await` → C# `async/await` (same pattern)

---

## ✅ Checklist for Agent

- [ ] Database schema created in C# SQLite
- [ ] Backend API service layer implemented
- [ ] State management stores converted to C# services
- [ ] Main PlaylistsPage component converted
- [ ] All child components converted
- [ ] Utility functions ported
- [ ] API layer connected (frontend → backend)
- [ ] localStorage persistence converted to C# settings
- [ ] Styling/theming applied
- [ ] Error handling implemented
- [ ] Testing completed

---

## 🎯 Summary

**Total Files to Hand Over:**
- **1** main component
- **8** child components
- **7** state management stores
- **1** API layer file
- **2** utility files
- **3** documentation files (reference)
- **Backend**: Rust files for reference (commands.rs, database.rs, models.rs)

**Total: ~20 frontend files + backend reference files**

The agent should focus on understanding the **data flow** and **state management patterns** from the documentation, then implement the C# equivalents using appropriate patterns for the chosen UI framework.
