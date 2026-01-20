# 🧠 The Pea-Brain's Guide to Project Refactor
*For the "Vibe Coder" who is scared of C#*

Hey. You. Stop panic-scrolling StackOverflow.
This guide translates your "React Brain" to "WPF Brain" and provides a **complete inventory** of every file you need to move.

---

## 1. The Rosetta Stone (Translation Dictionary)

| React Concept | WPF/C# Concept | The Vibe |
|:--- |:--- |:--- |
| **Component** (`.jsx`) | **UserControl** (`.xaml` + `.cs`) | It's still a chunk of UI. Just split into "Looks" (XAML) and "Logic" (CS). |
| **State Store** (Zustand) | **Service** (Singleton Class) | A class that lives forever. Instead of `useStore()`, you `Inject` it. |
| **State Variable** | **Property** `{ get; set; }` | Instead of `const [count, setCount]`, you just type `Count = 5`. |
| **Props** | **Dependency Properties** | Passing data down works the same, just more typing. |
| **`useEffect` / Hooks** | **Events** (`Loaded`, `Unloaded`) | Instead of hooking lifecycle, you listen for "I am alive" events. |
| **Tailwind (`className`)** | **Styles / Resources** | You define styles in `App.xaml` (like `index.css`) and reuse them. |

---

## 2. THE MASTER LEDGER (File-by-File Audit)

Here is every single file in your project and where it belongs in the new world.

### 🧠 The Brain (Stores → Services)
*Located in `src-csharp/Yttv2/Services/`*

| React File (`src/store/`) | New C# File               | Responsibility |
|:---                       |:---                       |:---            |
| `playlistStore.js`        | `PlaylistService.cs`      | Managing the active playlist & video index. |
| `navigationStore.js`      | `NavigationService.cs`    | Which "Page" is active (Videos, Settings, etc). |
| `layoutStore.js`          | `LayoutService.cs`        | Toggling UI modes (Full, Half, Minimize). |
| `configStore.js`          | `ConfigService.cs`        | Theme colors, user profile, global settings. |
| `folderStore.js`          | `FolderService.cs`        | Folder assignments & color definitions. |
| `pinStore.js`             | `PinService.cs`           | Managing pinned videos (Normal vs Priority). |
| `tabStore.js`             | `TabService.cs`           | Managing the tabs on the left. |
| `tabPresetStore.js`       | `TabPresetService.cs`     | Managing saved tab presets. |
| `stickyStore.js`          | `StickyService.cs` | Managing "Sticky" videos (top of grid). |
| `shuffleStore.js`         | `ShuffleService.cs` | Randomization logic. |

### 🛠️ The Tools (Utils → Core)
*Located in `src-csharp/Yttv2/Core/`*

| React File (`src/utils/`) | New C# File | Responsibility |
|:--- |:--- |:--- |
| `folderColors.js` | `FolderConstants.cs` | The list of 16 static colors. |
| `youtubeUtils.js` | `YouTubeHelpers.cs` | ID parsing, thumbnail URLs. |
| `themes.js` | `ThemeConstants.cs` | Color palettes for the UI. |
| `inspectLabels.js` | `DebugHelpers.cs` | Labels for the debug/inspect mode. |
| `audioProcessor.js` | `AudioVisualizer.cs` | **Note:** Move to `Services` or `Components`. Complex logic. |
| `initDatabase.js` | `DatabaseService.cs` | *Replaces `src/api/playlistApi.js` setup.* |

### 🔌 The Connection (API → Repositories)
*Located in `src-csharp/Yttv2/Data/`*

| React File (`src/api/`) | New C# File | Responsibility |
|:--- |:--- |:--- |
| `playlistApi.js` | `PlaylistRepository.cs` | All SQLite database operations (CRUD). |

### 🖼️ The Face (Components → Views/Controls)
*Located in `src-csharp/Yttv2/Components/` or `Views/`*

#### 🏠 Structural & Layout (The Shell)
| React Component | New C# Control |
|:--- |:--- |
| `App.jsx` + `LayoutShell.jsx` | `MainWindow.xaml` (The Master Grid) |
| `TopNavigation.jsx` | `TopNavigation.xaml` |
| `PlayerController.jsx` | `PlayerController.xaml` (The Bottom Bar) |
| `WindowControls.jsx` | *Native Window Chrome* (Wpf.Ui handles this) |
| `PageBanner.jsx` | `PageBanner.xaml` |
| `UnifiedBannerBackground.jsx` | `UnifiedBannerBackground.xaml` |
| `SideMenuScrollControls.jsx` | *Integrated into TopNavigation* |
| `DebugRuler.jsx` | `DebugRuler.xaml` (Optional overlay) |

#### 📄 Pages (The Main Views)
| React Component | New C# View |
|:--- |:--- |
| `PlaylistsPage.jsx` | `PlaylistsView.xaml` |
| `VideosPage.jsx` | `VideosView.xaml` |
| `HistoryPage.jsx` | `HistoryView.xaml` |
| `LikesPage.jsx` | `LikesView.xaml` |
| `PinsPage.jsx` | `PinsView.xaml` |
| `SettingsPage.jsx` | `SettingsView.xaml` |
| `SupportPage.jsx` | `SupportView.xaml` |

#### 🃏 Cards & Items
| React Component | New C# Control / DataTemplate |
|:--- |:--- |
| `VideoCard.jsx` | `VideoCard.xaml` (or DataTemplate) |
| `FolderCard.jsx` | `FolderCard.xaml` |
| `Card.jsx` | *Base Style in App.xaml* |
| `CardContent.jsx` | *Part of VideoCard template* |
| `CardThumbnail.jsx` | *Part of VideoCard template* |
| `CardActions.jsx` | *ContextMenu* in WPF |
| `CardMenu.jsx` | `CardMenu.xaml` (Popup) |
| `NewCardMenu.jsx` | *Replaces CardMenu* |
| `PlaylistList.jsx` | `PlaylistSidebar.xaml` |
| `PlaylistView.jsx` | *Part of PlaylistsView* |
| `StickyVideoCarousel.jsx` | `StickyCarousel.xaml` |

#### 🧩 Interactive Widgets
| React Component | New C# Control |
|:--- |:--- |
| `TabBar.jsx` | `TabBar.xaml` |
| `TabPresetsDropdown.jsx` | `TabPresetsDropdown.xaml` |
| `FolderSelector.jsx` | `FolderSelector.xaml` |
| `PlaylistFolderSelector.jsx` | `PlaylistFolderSelector.xaml` |
| `BulkTagColorGrid.jsx` | `BulkTagGrid.xaml` |
| `StarColorPicker.jsx` | `StarColorPicker.xaml` |
| `PlaylistsButton.jsx` | *Button in Main Layout* |
| `PieGraph.jsx` | *Canvas Drawing / SkiaSharp* |
| `AudioVisualizer.jsx` | *Canvas Drawing / ScottPlot* |

#### 🍱 Modals & Popups
| React Component | New C# Window / Dialog |
|:--- |:--- |
| `PlaylistUploader.jsx` | `PlaylistUploaderDialog.xaml` |
| `LocalVideoUploader.jsx` | `LocalVideoUploaderDialog.xaml` |
| `BulkPlaylistImporter.jsx` | `BulkPlaylistDialog.xaml` |
| `EditPlaylistModal.jsx` | `EditPlaylistDialog.xaml` |
| `PlaylistSelectionModal.jsx` | `PlaylistSelectionDialog.xaml` |
| `AddPlaylistToTabModal.jsx` | `AddTabDialog.xaml` |

#### 📼 Players
| React Component | New C# Control |
|:--- |:--- |
| `YouTubePlayer.jsx` | `WebView2` Control (Native) |
| `NativeVideoPlayer.jsx` | `Mpv.NET` Control (Native) |
| `LocalVideoPlayer.jsx` | *MediaElement* (Backup) |

#### 💀 Skeletons
| React Component | New C# Loading State |
|:--- |:--- |
| `VideoCardSkeleton.jsx` | `VideoCardSkeleton.xaml` |
| `PlaylistCardSkeleton.jsx` | `PlaylistCardSkeleton.xaml` |

---

## 3. The "Triple Architecture" Visualized

```
+-------------------------------------------------------+
|  LAYER 4: WPF OVERLAY (Your Sidebar, Buttons, Menus)  |  <-- Z-Index: 999
|           (Transparent Grid with controls)            |
+-------------------------------------------------------+
|  LAYER 3: CEFSHARP (Web Browser)                      |  <-- Opacity: 1 or 0
+-------------------------------------------------------+
|  LAYER 2: WEBVIEW2 (YouTube Embeds)                   |  <-- Opacity: 1 or 0
+-------------------------------------------------------+
|  LAYER 1: MPV PLAYER (Local Videos)                   |  <-- Opacity: 1 or 0
+-------------------------------------------------------+
|  BACKGROUND (Window Chrome)                           |
+-------------------------------------------------------+
```

## 4. How to maintain the VIBE

1.  **Use `Wpf.Ui`**: This is a library that gives you "Mica" backgrounds, rounded corners, and modern controls instantly.
2.  **Gradients**: WPF has `<LinearGradientBrush>`. It's just verbose CSS.
3.  **Animations**: WPF has "Storyboards".
    *   *React*: `transition-opacity duration-300`
    *   *WPF*: `<DoubleAnimation Storyboard.TargetProperty="Opacity" Duration="0:0:0.3"/>`

---

You got this. One file at a time.
