# Project North Star & File Manifest

**Project**: YouTube TV v2 (yttv2) -> **WPF Refactor**
**Context**: Re-platforming from Tauri (React + Rust) to C# WPF (.NET Core/8).
**Source of Truth**: `atlas/README.md` (Original Architecture)

---

## 📂 Source Components (`src/components`)
*UI components -> WPF Views & UserControls.*

| React File | Purpose | C# Equivalent (WPF) |
|------------|---------|---------------------|
| **Layout & Navigation** | | |
| `App.jsx` | Root orchestrator | `App.xaml`, `MainWindow.xaml` |
| `LayoutShell.jsx` | Main grid layout system | `MainWindow.xaml` (Grid Layout) |
| `TopNavigation.jsx` | Top tab navigation bar | `Controls/Navigation/TopNavBar.xaml` |
| `SideMenuScrollControls.jsx` | Scroll buttons for sidebar | `Controls/Navigation/SideScrollButtons.xaml` |
| `WindowControls.jsx` | Custom title bar controls | `Controls/Chrome/WindowCaptionControls.xaml` |
| `TabBar.jsx` | Tab navigation component | `Controls/Navigation/TabBar.xaml` |
| **Pages** | | |
| `PlaylistsPage.jsx` | Main grid view for playlists | `Views/PlaylistsView.xaml` |
| `VideosPage.jsx` | Grid view for videos in a playlist | `Views/VideosView.xaml` |
| `HistoryPage.jsx` | Watch history view | `Views/HistoryView.xaml` |
| `LikesPage.jsx` | Liked videos view | `Views/LikesView.xaml` |
| `PinsPage.jsx` | Pinned videos view | `Views/PinsView.xaml` |
| `SettingsPage.jsx` | App configuration | `Views/SettingsView.xaml` |
| `SupportPage.jsx` | Support hub (Docs, Community) | `Views/SupportView.xaml` |
| **Player System** | | |
| `PlayerController.jsx` | **Core** Orb interface | `Controls/Player/OrbController.xaml` |
| `YouTubePlayer.jsx` | Wrapper for YouTube IFrame API | `Controls/Player/WebViewYouTubeControls.xaml` |
| `NativeVideoPlayer.jsx` | Wrapper for MPV player | `Controls/Player/MpvPlayerControl.xaml` |
| `LocalVideoPlayer.jsx` | HTML5 fallback player | `Controls/Player/MediaElementPlayer.xaml` |
| `AudioVisualizer.jsx` | Circular audio visualizer | `Controls/Visuals/CircularVisualizer.xaml` |
| **Cards & Items** | | |
| `Card.jsx` | Base card container component | `Controls/Cards/BaseCard.xaml` |
| `CardThumbnail.jsx` | Thumbnail image with overlays | `Controls/Cards/CardThumbnail.xaml` |
| `CardContent.jsx` | Text content (Title, Subtitle) | `Controls/Cards/CardInfoDisplay.xaml` |
| `CardActions.jsx` | Action buttons (Play, Menu) | `Controls/Cards/CardActionButtons.xaml` |
| `CardMenu.jsx` | Standard 3-dot context menu | *Defunct / Replaced by ContextMenu* |
| `NewCardMenu.jsx` | **Enhanced** 3-dot context menu | `Resources/ContextMenus.xaml` (ResourceDictionary) |
| `VideoCard.jsx` | Specialized card for Videos | `Controls/Cards/VideoCard.xaml` |
| `FolderCard.jsx` | Specialized card for Color Folders | `Controls/Cards/FolderCard.xaml` |
| **Interactive Elements** | | |
| `FolderSelector.jsx` | 16-color picker for folders | `Controls/Inputs/FolderColorPicker.xaml` |
| `PlaylistFolderSelector.jsx` | Unified selector for assigning folders | `Controls/Inputs/UniversalFolderSelector.xaml` |
| `StarColorPicker.jsx` | Hover menu for quick folder assignment | `Controls/Inputs/StarColorMenu.xaml` |
| `PlaylistsButton.jsx` | Toggle for sidebar visibility | `Controls/Buttons/SidebarToggle.xaml` |
| `TabPresetsDropdown.jsx` | Quick-switch for tab configurations | `Controls/Menus/TabPresetMenu.xaml` |
| `StickyVideoCarousel.jsx` | Carousel for Stickied videos | `Controls/Lists/StickyCarousel.xaml` |
| `RadialMenuStandalone.jsx` | *Standalone utility tool* | *Likely Omitted / Custom Draw* |
| **Modals & Dialogs** | | |
| `AddPlaylistToTabModal.jsx` | Modal to append playlist to tab | `Dialogs/AddToTabDialog.xaml` |
| `EditPlaylistModal.jsx` | Metadata editor for playlists | `Dialogs/EditPlaylistDialog.xaml` |
| `PlaylistSelectionModal.jsx` | Generic playlist picker | `Dialogs/PlaylistPicker.xaml` |
| `PlaylistUploader.jsx` | "Config Playlist" / Import Modal | `Dialogs/UnifiedImportDialog.xaml` |
| `BulkPlaylistImporter.jsx` | Bulk import tool | `Dialogs/BulkImportDialog.xaml` |
| **Visuals & Decorations** | | |
| `PageBanner.jsx` | Unified page header with metadata | `Controls/Visuals/PageBanner.xaml` |
| `UnifiedBannerBackground.jsx` | Parallax background layer | `Controls/Visuals/ParallaxBackground.xaml` |
| `BulkTagColorGrid.jsx` | Grid of color tags for bulk actions | `Controls/Inputs/ColorGrid.xaml` |
| `PieGraph.jsx` | Animated SVG chart (Likes page) | `Controls/Visuals/PieChart.xaml` |
| `DebugRuler.jsx` | Measurement overlay | `Controls/Debug/RulerOverlay.xaml` |
| `PlaylistList.jsx` | Sidebar playlist list | `Controls/Lists/SidebarList.xaml` |
| `PlaylistView.jsx` | Individual playlist view | `Controls/Lists/PlaylistGrid.xaml` |

---

## 💀 Skeletons (`src/components/skeletons`)
*React Skeletons -> WPF Loading Templates.*

| React File | Purpose | C# Equivalent (WPF) |
|------------|---------|---------------------|
| `PlaylistCardSkeleton.jsx` | Loading state for Playlist Cards | `Resources/Skeletons.xaml` (DataTemplate) |
| `VideoCardSkeleton.jsx` | Loading state for Video Cards | `Resources/Skeletons.xaml` (DataTemplate) |

---

## 💾 State Management (`src/store`)
*Zustand Stores -> C# Services & ViewModels.*

| React File | Purpose | C# Equivalent (Service/ViewModel) |
|------------|---------|-----------------------------------|
| `configStore.js` | User preferences | `Services/ConfigService.cs` |
| `layoutStore.js` | UI State (Menus, Dimensions) | `ViewModels/MainViewModel.cs` |
| `navigationStore.js` | Routing state | `Services/NavigationService.cs` |
| `playlistStore.js` | **Core** Playlist data | `Services/PlaylistService.cs` + `Services/PlaybackService.cs` |
| `folderStore.js` | Folder definitions | `Services/FolderService.cs` |
| `tabStore.js` | Active tabs management | `Services/TabService.cs` |
| `tabPresetStore.js` | Saved tab configurations | `Services/PresetService.cs` |
| `pinStore.js` | Pinned videos management | `Services/PinService.cs` |
| `stickyStore.js` | Sticky videos management | `Services/StickyService.cs` |
| `shuffleStore.js` | Shuffle logic state | `Services/ShuffleLogic.cs` |

---

## 🛠 Utilities (`src/utils`)
*JS Utils -> C# Static Helpers.*

| React File | Purpose | C# Equivalent |
|------------|---------|---------------|
| `audioProcessor.js` | FFT and Audio Analysis logic | `Services/Audio/FftProcessor.cs` |
| `folderColors.js` | Color constants and definitions | `Constants/ThemeConstants.cs` |
| `initDatabase.js` | SQLite Initialization script | `Services/Database/DbInitializer.cs` |
| `inspectLabels.js` | Debug/Inspect mode helpers | `Helpers/DebugHelper.cs` |
| `themes.js` | Theme definitions (Blue, Midnight) | `Resources/Themes/*.xaml` (Dictionaries) |
| `youtubeUtils.js` | YouTube ID parsing, Thumbnails | `Helpers/YoutubeHelpers.cs` |

---

## 🌉 API Bridge & Contracts (`src/api`)
*Frontend API -> C# Service Contracts.*

| React File | Purpose | C# Equivalent (Interface) |
|------------|---------|---------------------------|
| `playlistApi.js` | **The Contract**: Commands and parameters | `Interfaces/IDs.cs` (Data Service Interface) |

---

## 🎨 Config & Global Styles
*CSS/Config -> XAML Resources.*

| Source File | Purpose | C# Equivalent |
|-------------|---------|---------------|
| `tauri.conf.json` | Window config | `Properties/Settings.settings` + `MainWindow.xaml` properties |
| `App.css` | Global CSS | `App.xaml` (Application Resources) |
| `LayoutShell.css` | Grid System | `MainWindow.xaml` (Grid Definitions) |
| `themes.js` | Color Palettes | `Resources/Colors.xaml` |

---

## 🗄️ Database & Initialization
*Data persistence.*

| Source File | Purpose | C# Equivalent |
|-------------|---------|---------------|
| `database-schema.md` | **Schema Truth** | `Models/Entities/*.cs` (Sqlite-net classes) |
| `initDatabase.js` | JS-side DB Init | `Services/Database/MigrationService.cs` |

---

## 🦀 Tauri Backend (`src-tauri/src`)
*Rust Backend -> C# Core Logic.*

| Rust File | Purpose | C# Equivalent |
|-----------|---------|---------------|
| `main.rs` | Entry Point | `App.xaml.cs` (OnStartup) |
| `lib.rs` | App Setup | `App.xaml.cs` |
| `commands.rs` | **Bridge**: Command Handlers | `Services/*` (Logic distributed to services) |
| `database.rs` | SQLite operations | `Services/Database/SqliteService.cs` |
# Project North Star & File Manifest

**Project**: YouTube TV v2 (yttv2) -> **WPF Refactor**
**Context**: Re-platforming from Tauri (React + Rust) to C# WPF (.NET Core/8).
**Source of Truth**: `atlas/README.md` (Original Architecture)

---

## 📂 Source Components (`src/components`)
*UI components -> WPF Views & UserControls.*

| React File | Purpose | C# Equivalent (WPF) |
|------------|---------|---------------------|
| **Layout & Navigation** | | |
| `App.jsx` | Root orchestrator | `App.xaml`, `MainWindow.xaml` |
| `LayoutShell.jsx` | Main grid layout system | `MainWindow.xaml` (Grid Layout) |
| `TopNavigation.jsx` | Top tab navigation bar | `Controls/Navigation/TopNavBar.xaml` |
| `SideMenuScrollControls.jsx` | Scroll buttons for sidebar | `Controls/Navigation/SideScrollButtons.xaml` |
| `WindowControls.jsx` | Custom title bar controls | `Controls/Chrome/WindowCaptionControls.xaml` |
| `TabBar.jsx` | Tab navigation component | `Controls/Navigation/TabBar.xaml` |
| **Pages** | | |
| `PlaylistsPage.jsx` | Main grid view for playlists | `Views/PlaylistsView.xaml` |
| `VideosPage.jsx` | Grid view for videos in a playlist | `Views/VideosView.xaml` |
| `HistoryPage.jsx` | Watch history view | `Views/HistoryView.xaml` |
| `LikesPage.jsx` | Liked videos view | `Views/LikesView.xaml` |
| `PinsPage.jsx` | Pinned videos view | `Views/PinsView.xaml` |
| `SettingsPage.jsx` | App configuration | `Views/SettingsView.xaml` |
| `SupportPage.jsx` | Support hub (Docs, Community) | `Views/SupportView.xaml` |
| **Player System** | | |
| `PlayerController.jsx` | **Core** Orb interface | `Controls/Player/OrbController.xaml` |
| `YouTubePlayer.jsx` | Wrapper for YouTube IFrame API | `Controls/Player/WebViewYouTubeControls.xaml` |
| `NativeVideoPlayer.jsx` | Wrapper for MPV player | `Controls/Player/MpvPlayerControl.xaml` |
| `LocalVideoPlayer.jsx` | HTML5 fallback player | `Controls/Player/MediaElementPlayer.xaml` |
| `AudioVisualizer.jsx` | Circular audio visualizer | `Controls/Visuals/CircularVisualizer.xaml` |
| **Cards & Items** | | |
| `Card.jsx` | Base card container component | `Controls/Cards/BaseCard.xaml` |
| `CardThumbnail.jsx` | Thumbnail image with overlays | `Controls/Cards/CardThumbnail.xaml` |
| `CardContent.jsx` | Text content (Title, Subtitle) | `Controls/Cards/CardInfoDisplay.xaml` |
| `CardActions.jsx` | Action buttons (Play, Menu) | `Controls/Cards/CardActionButtons.xaml` |
| `CardMenu.jsx` | Standard 3-dot context menu | *Defunct / Replaced by ContextMenu* |
| `NewCardMenu.jsx` | **Enhanced** 3-dot context menu | `Resources/ContextMenus.xaml` (ResourceDictionary) |
| `VideoCard.jsx` | Specialized card for Videos | `Controls/Cards/VideoCard.xaml` |
| `FolderCard.jsx` | Specialized card for Color Folders | `Controls/Cards/FolderCard.xaml` |
| **Interactive Elements** | | |
| `FolderSelector.jsx` | 16-color picker for folders | `Controls/Inputs/FolderColorPicker.xaml` |
| `PlaylistFolderSelector.jsx` | Unified selector for assigning folders | `Controls/Inputs/UniversalFolderSelector.xaml` |
| `StarColorPicker.jsx` | Hover menu for quick folder assignment | `Controls/Inputs/StarColorMenu.xaml` |
| `PlaylistsButton.jsx` | Toggle for sidebar visibility | `Controls/Buttons/SidebarToggle.xaml` |
| `TabPresetsDropdown.jsx` | Quick-switch for tab configurations | `Controls/Menus/TabPresetMenu.xaml` |
| `StickyVideoCarousel.jsx` | Carousel for Stickied videos | `Controls/Lists/StickyCarousel.xaml` |
| `RadialMenuStandalone.jsx` | *Standalone utility tool* | *Likely Omitted / Custom Draw* |
| **Modals & Dialogs** | | |
| `AddPlaylistToTabModal.jsx` | Modal to append playlist to tab | `Dialogs/AddToTabDialog.xaml` |
| `EditPlaylistModal.jsx` | Metadata editor for playlists | `Dialogs/EditPlaylistDialog.xaml` |
| `PlaylistSelectionModal.jsx` | Generic playlist picker | `Dialogs/PlaylistPicker.xaml` |
| `PlaylistUploader.jsx` | "Config Playlist" / Import Modal | `Dialogs/UnifiedImportDialog.xaml` |
| `BulkPlaylistImporter.jsx` | Bulk import tool | `Dialogs/BulkImportDialog.xaml` |
| **Visuals & Decorations** | | |
| `PageBanner.jsx` | Unified page header with metadata | `Controls/Visuals/PageBanner.xaml` |
| `UnifiedBannerBackground.jsx` | Parallax background layer | `Controls/Visuals/ParallaxBackground.xaml` |
| `BulkTagColorGrid.jsx` | Grid of color tags for bulk actions | `Controls/Inputs/ColorGrid.xaml` |
| `PieGraph.jsx` | Animated SVG chart (Likes page) | `Controls/Visuals/PieChart.xaml` |
| `DebugRuler.jsx` | Measurement overlay | `Controls/Debug/RulerOverlay.xaml` |
| `PlaylistList.jsx` | Sidebar playlist list | `Controls/Lists/SidebarList.xaml` |
| `PlaylistView.jsx` | Individual playlist view | `Controls/Lists/PlaylistGrid.xaml` |

---

## 💀 Skeletons (`src/components/skeletons`)
*React Skeletons -> WPF Loading Templates.*

| React File | Purpose | C# Equivalent (WPF) |
|------------|---------|---------------------|
| `PlaylistCardSkeleton.jsx` | Loading state for Playlist Cards | `Resources/Skeletons.xaml` (DataTemplate) |
| `VideoCardSkeleton.jsx` | Loading state for Video Cards | `Resources/Skeletons.xaml` (DataTemplate) |

---

## 💾 State Management (`src/store`)
*Zustand Stores -> C# Services & ViewModels.*

| React File | Purpose | C# Equivalent (Service/ViewModel) |
|------------|---------|-----------------------------------|
| `configStore.js` | User preferences | `Services/ConfigService.cs` |
| `layoutStore.js` | UI State (Menus, Dimensions) | `ViewModels/MainViewModel.cs` |
| `navigationStore.js` | Routing state | `Services/NavigationService.cs` |
| `playlistStore.js` | **Core** Playlist data | `Services/PlaylistService.cs` + `Services/PlaybackService.cs` |
| `folderStore.js` | Folder definitions | `Services/FolderService.cs` |
| `tabStore.js` | Active tabs management | `Services/TabService.cs` |
| `tabPresetStore.js` | Saved tab configurations | `Services/PresetService.cs` |
| `pinStore.js` | Pinned videos management | `Services/PinService.cs` |
| `stickyStore.js` | Sticky videos management | `Services/StickyService.cs` |
| `shuffleStore.js` | Shuffle logic state | `Services/ShuffleLogic.cs` |

---

## 🛠 Utilities (`src/utils`)
*JS Utils -> C# Static Helpers.*

| React File | Purpose | C# Equivalent |
|------------|---------|---------------|
| `audioProcessor.js` | FFT and Audio Analysis logic | `Services/Audio/FftProcessor.cs` |
| `folderColors.js` | Color constants and definitions | `Constants/ThemeConstants.cs` |
| `initDatabase.js` | SQLite Initialization script | `Services/Database/DbInitializer.cs` |
| `inspectLabels.js` | Debug/Inspect mode helpers | `Helpers/DebugHelper.cs` |
| `themes.js` | Theme definitions (Blue, Midnight) | `Resources/Themes/*.xaml` (Dictionaries) |
| `youtubeUtils.js` | YouTube ID parsing, Thumbnails | `Helpers/YoutubeHelpers.cs` |

---

## 🌉 API Bridge & Contracts (`src/api`)
*Frontend API -> C# Service Contracts.*

| React File | Purpose | C# Equivalent (Interface) |
|------------|---------|---------------------------|
| `playlistApi.js` | **The Contract**: Commands and parameters | `Interfaces/IDs.cs` (Data Service Interface) |

---

## 🎨 Config & Global Styles
*CSS/Config -> XAML Resources.*

| Source File | Purpose | C# Equivalent |
|-------------|---------|---------------|
| `tauri.conf.json` | Window config | `Properties/Settings.settings` + `MainWindow.xaml` properties |
| `App.css` | Global CSS | `App.xaml` (Application Resources) |
| `LayoutShell.css` | Grid System | `MainWindow.xaml` (Grid Definitions) |
| `themes.js` | Color Palettes | `Resources/Colors.xaml` |

---

## 🗄️ Database & Initialization
*Data persistence.*

| Source File | Purpose | C# Equivalent |
|-------------|---------|---------------|
| `database-schema.md` | **Schema Truth** | `Models/Entities/*.cs` (Sqlite-net classes) |
| `initDatabase.js` | JS-side DB Init | `Services/Database/MigrationService.cs` |

---

## 🦀 Tauri Backend (`src-tauri/src`)
*Rust Backend -> C# Core Logic.*

| Rust File | Purpose | C# Equivalent |
|-----------|---------|---------------|
| `main.rs` | Entry Point | `App.xaml.cs` (OnStartup) |
| `lib.rs` | App Setup | `App.xaml.cs` |
| `commands.rs` | **Bridge**: Command Handlers | `Services/*` (Logic distributed to services) |
| `database.rs` | SQLite operations | `Services/Database/SqliteService.cs` |
| `models.rs` | Data Structs | `Models/Entities/*.cs` |
| `streaming_server.rs` | HTTP server for local files | `Services/Media/LocalFileServer.cs` (If needed) |
| `audio_capture.rs` | Audio loopback capture | `Services/Audio/WasapiCaptureService.cs` (using NAudio/CSCore) |

---


---

## 🗺️ Refactor Phase Map
*Granular execution plan ensuring every file is accounted for. Assumes Shell/Grid/WebView2/MPV are already working.*

### Phase 1: The Core Data Layer (Backend Port)
**Goal**: Logic parity. All Rust backend functions and Zustand stores must exist as C# Services.
1.  **Models & Entities**:
    *   Create `Models/Entities/*.cs` matching `database-schema.md` (Playlists, PlaylistItems, WatchHistory, etc.).
2.  **Infrastructure Services**:
    *   Implement `Services/Database/SqliteService.cs` (`database.rs`, `initDatabase.js`).
    *   Implement `Services/ConfigService.cs` (`configStore.js`) - Theme/Profile persistence.
    *   Implement `Services/NavigationService.cs` (`navigationStore.js`, `tabStore.js`).
    *   Implement `Constants/ThemeMappings.cs` (`src/utils/themes.js`, `src/utils/folderColors.js`).
3.  **Business Logic Services**:
    *   **CRITICAL**: Implement `Services/PlaylistService.cs` (`playlistStore.js`, `playlistApi.js`, `commands.rs`).
    *   Implement `Services/PlaybackService.cs` (Playback logic from `playlistStore.js`, `commands.rs`).
    *   Implement `Services/FolderService.cs` (`folderStore.js`, `folderColors.js`).
    *   Implement `Services/PinService.cs` (`pinStore.js`) and `Services/StickyService.cs` (`stickyStore.js`).
    *   Implement `Services/ShuffleService.cs` (`shuffleStore.js`).

### Phase 2: Building Blocks (Resources & Controls)
**Goal**: Recreate the Atomic UI components.
1.  **Visual Resources**:
    *   Port `App.css` variables -> `Resources/Colors.xaml`.
    *   Define `Resources/Styles.xaml` for global text/button styles.
    *   Define `Resources/Skeletons.xaml` DataTemplates (`PlaylistCardSkeleton.jsx`, `VideoCardSkeleton.jsx`).
2.  **Base Card Components**:
    *   Build `Controls/Cards/BaseCard.xaml` (`Card.jsx`).
    *   Build `Controls/Cards/CardThumbnail.xaml` (`CardThumbnail.jsx`).
    *   Build `Controls/Cards/CardInfo.xaml` (`CardContent.jsx`).
    *   Build `Controls/Cards/CardActions.xaml` (`CardActions.jsx`).
    *   Build `Resources/ContextMenus.xaml` (`NewCardMenu.jsx`, `CardMenu.jsx`).
3.  **Input Controls**:
    *   Build `Controls/Inputs/FolderColorPicker.xaml` (`FolderSelector.jsx`).
    *   Build `Controls/Inputs/StarColorMenu.xaml` (`StarColorPicker.jsx`).
    *   Build `Controls/Inputs/UniversalFolderSelector.xaml` (`PlaylistFolderSelector.jsx`).

### Phase 3: Composition Controls (The "Mid-Level")
**Goal**: Assemble atoms into molecules.
1.  **Specialized Cards**:
    *   Build `Controls/Cards/VideoCard.xaml` (`VideoCard.jsx`).
    *   Build `Controls/Cards/FolderCard.xaml` (`FolderCard.jsx`).
2.  **Navigation Controls**:
    *   Build `Controls/Navigation/TopNavBar.xaml` (`TopNavigation.jsx`, `TabBar.jsx`).
            *   *Includes*: `Controls/Buttons/SidebarToggle.xaml` (`PlaylistsButton.jsx`).
    *   Build `Controls/Navigation/SideScrollButtons.xaml` (`SideMenuScrollControls.jsx`).
    *   Build `Controls/Chrome/CaptionControls.xaml` (`WindowControls.jsx`).
3.  **Lists & Visuals**:
    *   Build `Controls/Lists/SidebarList.xaml` (`PlaylistList.jsx`).
    *   Build `Controls/Lists/StickyCarousel.xaml` (`StickyVideoCarousel.jsx`).
    *   Build `Controls/Visuals/PageBanner.xaml` (`PageBanner.jsx`, `UnifiedBannerBackground.jsx`).
    *   Build `Controls/Visuals/PieChart.xaml` (`PieGraph.jsx`).
    *   Build `Controls/Inputs/ColorGrid.xaml` (`BulkTagColorGrid.jsx`).

### Phase 4: The Player System
**Goal**: Interactive media controls.
1.  **The Orb**: Build `Controls/Player/OrbController.xaml` (`PlayerController.jsx`).
2.  **Integrations** (Adapting existing working window to controls):
    *   Wrap WebView2 logic in `Controls/Player/WebViewYouTube.xaml` (`YouTubePlayer.jsx`, `youtubeUtils.js`).
    *   Wrap MPV logic in `Controls/Player/MpvPlayer.xaml` (`NativeVideoPlayer.jsx`).
    *   Create HTML5 fallback `Controls/Player/MediaElementPlayer.xaml` (`LocalVideoPlayer.jsx`).
3.  **Visualizer**:
    *   Implement `Services/Audio/WasapiCaptureService.cs` (`audio_capture.rs`).
    *   Implement `Services/Audio/FftProcessor.cs` (`audioProcessor.js`).
    *   Build `Controls/Visuals/CircularVisualizer.xaml` (`AudioVisualizer.jsx`).

### Phase 5: The Views (Pages)
**Goal**: Assemble components into pages.
1.  **Main Content Views**:
    *   Build `Views/PlaylistsView.xaml` (`PlaylistsPage.jsx`).
    *   Build `Views/VideosView.xaml` (`VideosPage.jsx`).
    *   Build `Views/HistoryView.xaml` (`HistoryPage.jsx`).
    *   Build `Views/LikesView.xaml` (`LikesPage.jsx`).
    *   Build `Views/PinsView.xaml` (`PinsPage.jsx`).
2.  **Secondary Views**:
    *   Build `Views/SettingsView.xaml` (`SettingsPage.jsx`).
    *   Build `Views/SupportView.xaml` (`SupportView.xaml`).

### Phase 6: Dialogs & Interaction
**Goal**: Complex modals and overlays.
1.  **Management Dialogs**:
    *   Build `Dialogs/EditPlaylistDialog.xaml` (`EditPlaylistModal.jsx`).
    *   Build `Dialogs/AddToTabDialog.xaml` (`AddPlaylistToTabModal.jsx`).
    *   Build `Dialogs/PlaylistPicker.xaml` (`PlaylistSelectionModal.jsx`).
2.  **Import System**:
    *   Build `Dialogs/UnifiedImportDialog.xaml` (`PlaylistUploader.jsx`, `BulkPlaylistImporter.jsx`, `importexport.md`).

### Phase 7: Polish & Wiring
**Goal**: Final connections.
1.  **Shell Wiring**:
    *   Connect `MainWindow.xaml` to `NavigationService`.
    *   Connect `TopNavBar` and `SidebarList` to `MainViewModel`.
2.  **Debug Utilities**:
    *   Implement `Controls/Debug/RulerOverlay.xaml` (`DebugRuler.jsx`, `inspectLabels.js`).
3.  **Local Media Server**:
    *   Implement `Services/Media/LocalFileServer.cs` (`streaming_server.rs`) only if MPV direct file access is insufficient.
