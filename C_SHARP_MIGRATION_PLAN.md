# C# Migration Master Plan 🏗️

This document outlines the systematic migration of the backend from Rust (Tauri) to C# (WPF/WebView2).

## Phase 1: The "Hybrid Bridge" (Enable Dual Mode)
*Goal: Allow the Frontend to switch between Tauri and C# automatically.*

We need `src/utils/bridge.js` to replace direct `invoke` calls.

**Current (Tauri Only):**
```javascript
import { invoke } from '@tauri-apps/api/core';
await invoke('get_all_playlists');
```

**New (Hybrid):**
```javascript
// Detect if running in C# Host
const isCSharp = window.chrome?.webview?.hostObjects?.bridge;

export async function invokeCommand(command, args = {}) {
  if (isCSharp) {
    // C# Bridge Logic
    const result = await window.chrome.webview.hostObjects.bridge[toPascalCase(command)](JSON.stringify(args));
    return JSON.parse(result);
  } else {
    // Fallback to Tauri
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(command, args);
  }
}
```

## Phase 2: React API Layer Updates
*Goal: Update all `src/api/*.js` files to use the new `invokeCommand` helper.*

- [ ] `src/api/playlistApi.js` (Heavy usage)
- [ ] `src/api/videoApi.js` (If exists)

## Phase 3: The C# Database Port (Sqlite Service)
*Goal: Port all SQL Logic from `database.rs` -> `DatabaseService.cs`.*

**Priority 1: Core Playlists**
- [x] `GetAllPlaylists` (Done in POC)
- [ ] `GetPlaylistItems(playlistId)`
- [ ] `CreatePlaylist`
- [ ] `DeletePlaylist`
- [ ] `AddVideoToPlaylist`

**Priority 2: Folder Logic (Colors)**
- [ ] `AssignVideoToFolder`
- [ ] `UnassignVideoFromFolder`
- [ ] `GetVideosInFolder`
- [ ] `GetAllFoldersWithVideos`

**Priority 3: Metadata & Progress**
- [x] `UpdateVideoProgress`
- [x] `GetVideoProgress`
- [ ] `SetFolderMetadata` (Low priority)

**Status Update (Jan 21, 2026):**
Watch History and Video Progress are fully implemented in C# and exposed via the Bridge.
The Audio Visualizer native backend (Phase 5) is also complete ahead of schedule!
Videos display, Playlists work, History works, and the Visualizer animates.
We are now entering Phase 6 (MPV/Native Player).

## Phase 4: The Bridge Implementation (`AppBridge.cs`)
*Goal: Expose C# methods to Javascript.*

Every method in `commands.rs` needs a match in `AppBridge.cs`.
*Note: C# methods should accept a single JSON string argument if the command takes multiple parameters, to simplify serialization.*

**Mapping Table:**
| Rust Command | C# Method | Status |
| :--- | :--- | :--- |
| `get_all_playlists` | `GetAllPlaylists()` | ✅ |
| `create_playlist` | `CreatePlaylist(string jsonArgs)` | ✅ |
| `add_video_to_playlist` | `AddVideoToPlaylist(string jsonArgs)` | ✅ |
| `get_watch_history` | `GetWatchHistory(string jsonArgs)` | ✅ |
| `update_video_progress` | `UpdateVideoProgress(string jsonArgs)` | ✅ |
| `start_audio_capture` | `StartAudioCapture(string jsonArgs)` | ✅ |

## Phase 5: Audio Visualizer (The Native Swap) 🎵
*Goal: Replace `audio_capture.rs` with `NAudio` implementation.*

**Status: COMPLETED (Jan 21, 2026)**
- [x] **Install NAudio:** `dotnet add package NAudio`
- [x] **Create `AudioCaptureService.cs`:**
    - [x] Initialize `WasapiLoopbackCapture`.
    - [x] Send raw samples (Float32) to WebView via `PostWebMessageAsJson`.
- [x] **Frontend Update:**
    - [x] Update `AudioVisualizer.jsx` to listen for `window.chrome.webview` messages in C# mode.
    - [x] Use `invokeCommand` for Start/Stop signals.

## Phase 6: MPV Integration (The "Sandwich" Filling) 🎥
*Goal: Native Video Playback.*

1.  **Install Mpv.NET:** `dotnet add package Mpv.NET`
2.  **Grid Setup:**
    *   React WebView: `Background="Transparent"`
    *   MPV Control: `ZIndex="-1"` (Behind WebView)
3.  **IPC:** Bridge commands to `PlayVideo(url)`, `Pause()`, `Seek()`.

---

## 🚦 Execution Order
1.  **Build Phase 1 & 2** (Update JS to support both modes).
2.  **Build Phase 3** (Bulk writing C# SQL code).
3.  **Build Phase 4** (Connecting the Bridge).
4.  **Verify UI** (Full app usage in C# window).
5.  **Build Phase 5** (Audio Visualizer).
6.  **Build Phase 6** (MPV).
