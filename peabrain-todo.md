# 🧠 Pea-Brain Refactor Checklist
*The ultimate, simple list of pieces to assemble.*

**Goal**: Move from React (Web) to C# WPF (Windows) without losing your mind.
**Rule**: Don't skip ahead. Check off one box at a time.

---

## 🛠️ Phase 1: The Workshop (Setup)
*Before writing code, we need a place to put it.*

- [ ] **Create Folder**: Make `src-csharp/` in the root.
- [ ] **Init Project**: Run `dotnet new wpf -n Yttv2 -o src-csharp`.
- [ ] **Install "The Vibe"**: `dotnet add package Wpf.Ui` (Modern styles).
- [ ] **Install " The Glue"**: `dotnet add package CommunityToolkit.Mvvm` (Easy state).
- [ ] **Install Engines**: 
    - [ ] `Microsoft.Web.WebView2` (YouTube)
    - [ ] `CefSharp.Wpf` (Browser)
    - [ ] `Mpv.NET` (Local Video)

---

## 🧠 Phase 2: The Brain (Logic)
*The app needs to "think" before it can "look". Convert JS Logic to C# Services.*

### 1. Foundation
- [ ] **Constants**: Port `src/utils/folderColors.js` → `Core/FolderColors.cs`
- [ ] **Helpers**: Port `src/utils/youtubeUtils.js` → `Core/YouTubeUtils.cs`
- [ ] **Models**: Create C# classes for `Video.cs`, `Playlist.cs`, `Folder.cs`.

### 2. Services (The Stores)
*Convert these `store/*.js` files into `Services/*.cs` classes.*
- [ ] `ConfigService.cs` (Theme, Settings)
- [ ] `FolderService.cs` (Folder assignments)
- [ ] `PlaylistService.cs` (The big list of videos)
- [ ] `PinService.cs` (Pinned videos state)
- [ ] `TabService.cs` (Saved tabs)
- [ ] `NavigationService.cs` (Keeps track of "Page")
- [ ] `LayoutService.cs` (Toggles view modes)

---

## 🏗️ Phase 3: The Engine Room (Architecture)
*The "Triple Architecture" shell. No design yet, just function.*

- [ ] **MainWindow.xaml**: Create a Grid with 4 Layers (Z-Index):
    - [ ] **Layer 1 (Bottom)**: `MpvControl` (Local)
    - [ ] **Layer 2 (Middle)**: `WebView2` (YouTube)
    - [ ] **Layer 3 (Top)**: `ChromiumWebBrowser` (Browsing)
    - [ ] **Layer 4 (Overlay)**: `Grid` (Empty for now - will hold UI)
- [ ] **Engine Toggle**: Add C# logic to show/hide layers based on what's playing.

---

## 🎨 Phase 4: The Face (UI Components)
*Build the controls that go into Layer 4. Convert JSX to XAML.*

- [ ] **Styles**: Set up `App.xaml` to use `Wpf.Ui` themes (Dark Mode).
- [ ] **Video Card**: Convert `VideoCard.jsx` → `Components/VideoCard.xaml`.
- [ ] **Playlist Card**: Convert `PlaylistList.jsx` item style → `Components/PlaylistCard.xaml`.
- [ ] **Tabs**: Convert `TopNavigation.jsx` → `Components/TopNavigation.xaml`.
- [ ] **Controller**: Convert `PlayerController.jsx` → `Components/PlayerController.xaml` (The big bottom bar).

---

## 📱 Phase 5: The Assembly (Pages)
*Put the components into screens.*

- [ ] **Playlists View**: The grid of playlists.
- [ ] **Videos View**: The grid of videos.
- [ ] **Settings View**: The config screen.

---

## 🔌 Phase 6: The Wiring
*Connect the "Face" to the "Brain".*

- [ ] **Injection**: Register all Services in `App.xaml.cs`.
- [ ] **Binding**: Update `MainWindow` to display the Views based on `NavigationService`.
- [ ] **Persistence**: Ensure JSON files are saving/loading to disk (replacing localStorage).

---

**DONE?** 🎉
If all boxes are checked, you have successfully ported the app.
