# Performance Diagnosis & roadmap: "Instant" Page Loads

## 1. The Diagnosis: The "N+1" Bottleneck
The current application suffers from perceptible lag when switching pages (particularly `VideosPage` and `PlaylistsPage`). The root cause is **inefficient data fetching**, specifically the "N+1 query problem" on the frontend side.

### The Problem Pattern
In `VideosPage.jsx` (and similar components), the application iterates through lists of items and performs an asynchronous database call for *each individual item*.

**Current Logic (Slow):**
```javascript
// Example from VideosPage.jsx
for (const video of activePlaylistItems) {
    // ⚠ CRITICAL: 50 videos = 50 separate IPC calls to Rust/SQLite
    const folders = await getVideoFolderAssignments(activePlaylistId, video.id);
}
```

**Why this fails:**
1.  **IPC Overhead**: Each call crosses the JS <-> Rust bridge, incurring serialization/deserialization costs.
2.  **Sequential Blocking**: Often these run in sequence or choke the bridge, causing the main thread to stutter.
3.  **UI Blocking**: The UI often waits for this data before settling into its final state, causing "pop-in" or "jank".

## 2. The Solution: "Batch & Cache" Roadmap

### Phase 1: Batch Data Fetching (High Impact)
**Goal:** Reduce 50+ database calls to **1** call per page load.

**Actions:**
1.  **Backend (Rust)**:
    -   Implement `get_all_folder_assignments_for_playlist(playlist_id)` that returns a `HashMap<VideoId, Vec<FolderColor>>`.
    -   Implement `get_all_video_progress_batch(video_ids)` if not already optimized.
2.  **Frontend (React)**:
    -   Replace the `for...of` loop in `VideosPage.jsx` with a single `await getAllFolderAssignments(...)`.
    -   Apply this pattern to `PlaylistsPage` for thumbnail/count fetching if applicable.

### Phase 2: Optimistic UI & Transition (Perceived Speed)
**Goal:** Make the UI feel instant even while data is loading.

**Actions:**
1.  **Skeleton Loading**: If data *is* pending, show a skeleton layout immediately instead of a blank screen.
2.  **Stale-While-Revalidate**: Show the *previous* list (if available in a cache) while fetching the new one, rather than clearing the screen.

### Phase 3: Global Data Stores (The "Omnipresent" Approach)
**Goal:** Pre-fetch data so it's already there when the user clicks.

**Actions:**
1.  **Cache in Zustand**:
    -   Expand `usePlaylistStore` or `useDataStore` to hold a map of `assignments`.
    -   When entering a playlist, check the store first. If data exists, render *instantly*. Fetch updates in the background.

## 3. Specific Targets

| Page | Bottleneck | Recommended Fix |
| :--- | :--- | :--- |
| **Videos** | Folder Assignments (N+1) | Batch fetch assignments by Playlist ID. |
| **Playlists** | Initial Playlist Load | Ensure `getAllPlaylists` is lean. Batch fetch meta-data (thumbnails/counts). |
| **History/Likes** | Sequential API Calls | Batch fetch video metadata/progress for these lists. |
| **Pins** | - | Likely fast, but ensure pin state isn't re-scanning all videos. |
| **Settings** | - | Generally static; ensure config store writes are non-blocking. |

## 4. Immediate Next Steps for Agent
1.  **Modify Rust Backend**: Create the `get_video_folder_assignments_map` command.
2.  **Refactor `VideosPage.jsx`**: Switch from the `for` loop to the single batch call.
3.  **Verify**: Measure time-to-interactive on large playlists (100+ items).
