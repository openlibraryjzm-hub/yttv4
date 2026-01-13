# Handover Brief: Unified Banners & Sticky Toolbar

## Major Accomplishments
1.  **Compact Sticky Toolbar**:
    *   Consolidated the sticky header for both **VideosPage** and **PlaylistsPage** into a sleek **single-row layout**.
    *   Merged folder/tab selectors with action controls to maximize vertical screen real estate.

2.  **Unified Banner Animation**:
    *   Restored the "Unified" aesthetic where the top banner and sticky toolbar appear as a single continuous image.
    *   **Horizontal Scroll**: Implemented a synchronized `animate-page-banner-scroll` that moves the background image horizontally on both components.
    *   **Vertical Stitching**: Created a visual illusion of continuity using calculated `background-position-y` offsets (managed by `PageBanner` calculation logic).

## Documentation
*   **`atlas/banner.md`**: **READ THIS FIRST**. It contains the full architectural breakdown of the banner system, the stitching logic, and the future refactoring plan.
*   **`atlas/ui.md`**: Updated to reflect the new sticky/compact layout.

## Current State / Known Issues
1.  **Performance Stutter**:
    *   The horizontal scroll animation uses `background-position`, which triggers paint operations on the main thread. This causes visible stuttering when the app is busy.
    *   **Fix Plan**: Move to GPU-accelerated `transform: translate3d`. See `atlas/banner.md` for details.

2.  **"Pop-in" Alignment**:
    *   The sticky toolbar background image loads/positions itself *after* the top banner finishes its calculation. This causes a brief visual "pop" or delay where they are out of sync.
    *   **Fix Plan**: Move to a "Master Parallax Layer" architecture (described in `atlas/banner.md`) to decouple the background from the components entirely.

## Next Steps
The immediate task is to decide whether to:
A.  **Optimize Performance Only**: Refactor the current components to use a `transform` hack for smooth scrolling (low risk).
B.  **Full Architecture Refactor**: Implement the "Global Banner Layer" plan to solve both performance and alignment permanently (higher effort/risk).

Recommended: Start with **A** (Performance) to get smooth 60fps scrolling, then assess if **B** is needed.
