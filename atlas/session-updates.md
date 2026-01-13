# Session Updates - Jan 13, 2026 5:06pm

## Overview
This session focused on refining the **Playlist Card UI** by enhancing the hover actions in the title bar.

## Key Features Implemented

### 1. Shuffle & Cover Play Actions
- **Shuffle Button**: Added a new **Shuffle** button (icon only) to the right of the Play button in the playlist/folder title bar hover controls.
  - Clicking this button immediately shuffles the playlist/folder items and starts playing the first shuffled video.
- **Smart Play Button**:
  - **Left Click**: Plays the playlist from the beginning (typically first added or manual order).
  - **Right Click**: Plays the specific video whose thumbnail is currently displayed as the **playlist cover**.
    - This is particularly useful when a user has "Set as Playlist Cover" on a specific video deeper in the list.
    - If the cover doesn't match a video (e.g., custom upload not linked to a video), it gracefully falls back to the first video.
  - **Tooltip**: Updated to "Play playlist (Right-click for cover video)".

### 2. Folder Card Consistency
- Applied identical Shuffle and Right-Click logic to **Folder Cards**, ensuring feature parity across all grid items.

## Learnings
- **Context Handling**: Implementing "Right Click to Play Cover" required searching the loaded playlist items for a thumbnail URL match against the current card's cover. This dynamic lookup ensures the correct "featured" video is played.
