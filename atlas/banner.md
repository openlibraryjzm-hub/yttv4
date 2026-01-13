# Unified Banner System

## Overview
The Unified Banner System creates a seamless visual experience where a custom banner image appears to span across two separate UI components: the top `PageBanner` and the `Sticky Toolbar` (which appears when scrolling). 

Instead of treating them as separate images, the system "stitches" them together visually and animates them in unison, creating a premium, cohesive look.

## Core Concepts

### 1. Visual Stitching
The goal is for the sticky toolbar to look like it is revealing the bottom portion of the same image used in the top banner.
-   **Top Component (`PageBanner`)**: Displays the top portion of the image.
-   **Bottom Component (`Sticky Toolbar`)**: Displays the bottom portion of the image, with a vertical offset equal to the height of the `PageBanner`.

### 2. Intelligent Scaling
To ensure the image covers the entire combined height (Banner + Toolbar) without excessive zooming or cropping, we calculate a custom `background-size`.
-   **Logic**: The system loads the image to get its natural dimensions. It then compares the image's aspect ratio to the container's aspect ratio (where "container height" = Banner Height + Toolbar Height Buffer).
-   **Result**: It derives a `bannerBgSize` string (e.g., `100% auto` or `auto 450px`) that ensures the image creates a continuous surface.

### 3. Synchronized Scrolling Animation
Both components animate the background image horizontally to the right.
-   **Mechanism**: A CSS animation (`animate-page-banner-scroll`) modifies `background-position-x`.
-   **Synchronization**: By splitting the `background-position` logic, we can animate X (horizontal scroll) via CSS while controlling Y (vertical alignment) via inline styles.

## Implementation Details

### Components Involved
-   `src/components/PageBanner.jsx` (The calculator and top display)
-   `src/components/VideosPage.jsx` (Container for Videos tab)
-   `src/components/PlaylistsPage.jsx` (Container for Playlists tab)

### State Flow
1.  **`PageBanner` calculates**:
    -   It measures its own rendered height (`clientHeight`).
    -   It loads the `customPageBannerImage` to get natural width/height.
    -   It calculates the optimal `backgroundSize`.
2.  **Data Passing**:
    -   `PageBanner` calls `onHeightChange(height, bgSize)`.
    -   The parent page (`VideosPage` or `PlaylistsPage`) stores these values in state: `bannerHeight` and `bannerBgSize`.
3.  **Sticky Toolbar applies**:
    -   The parent page applies these values to the sticky toolbar's inline styles.

### Style Logic

#### Top Banner (`PageBanner.jsx`)
```jsx
style={{
    backgroundImage: `url(${image})`,
    backgroundSize: localBgSize,      // Calculated value
    backgroundPositionY: 'top',       // Align to top
    backgroundPositionX: '0px',       // Start for animation
    backgroundRepeat: 'repeat-x'      // Allow seamless loop
}}
className="animate-page-banner-scroll"
```

#### Sticky Toolbar (`VideosPage.jsx` / `PlaylistsPage.jsx`)
```jsx
style={{
    backgroundImage: `url(${image})`,
    backgroundSize: bannerBgSize,     // Same calculated value
    backgroundPositionY: `-${bannerHeight}px`, // Negative offset matching top banner height
    backgroundPositionX: '0px',
    backgroundRepeat: 'repeat-x'
}}
className="animate-page-banner-scroll"
```

### Animation CSS
Defined in `src/index.css` (or `App.css`):
```css
@keyframes page-banner-scroll {
  from { background-position-x: 0px; }
  to { background-position-x: 10000px; }
}

.animate-page-banner-scroll {
  animation: page-banner-scroll 360s linear infinite;
}
```

## Usage
To enable this feature, a `customPageBannerImage` prop must be passed to the `PageBanner`. The system handles the rest automatically.

### Common Issues & Debugging
-   **"Grey Gap"**: Usually means `backgroundPositionY` offset is incorrect or `bannerHeight` measurement is stale.
-   ** misalignment**: Ensure `bannerBgSize` is identical in both components.
-   **No Animation**: Ensure `backgroundPositionX` is explicitly set to `0px` in inline styles, otherwise the shorthand `backgroundPosition` might override the animation.

## Refactoring Plan: The "True Unified" Banner (Next Steps)

The current implementation uses a "Stitched" approach (two separate divs syncing styles). This causes performance stutter (main thread animation) and a visual "pop-in" delay (React state lag).

**Next Objective**: Move to a **Master Parallax Layer** architecture.

### Problem
1.  **Performance**: Animating `background-position` on large divs causes high CSV/Paint costs.
2.  **Alignment**: The bottom sticky banner "pops in" late because it waits for the top banner to measure/render first.

### Implementation Plan (TL;DR)
1.  **Create Global Layer**:
    -   Create a new component `<GlobalBannerLayer />` that sits at `z-index: 0` (behind everything) in the main layout (e.g., `LayoutShell` or `App`).
    -   This layer will contain the **single** source-of-truth `<img />` or `div` for the banner.

2.  **GPU Animation**:
    -   Instead of `background-position` animation, use `transform: translate3d(x, 0, 0)` on this global layer.
    -   This offloads rendering to the GPU (compositor thread) for silky smooth 60fps scrolling.

3.  **Transparent Windows**:
    -   Update `PageBanner` (Top) and `Sticky Toolbar` (Bottom) to have **transparent backgrounds**.
    -   They essentially become "glass windows" looking through to the `GlobalBannerLayer` behind them.
    -   This eliminates the need for complex stitching math or offset calculations. The image is just "there" behind them.

4.  **Context/Store**:
    -   Move `customPageBannerImage` state up to a global store (e.g., `useLayoutStore`) so the `GlobalBannerLayer` can render immediately without waiting for child components to mount.

### Benefit
-   **Zero Pop-in**: Image loads with the app shell.
-   **Zero Stutter**: Animation runs on the GPU.
-   **Perfect Alignment**: It is literally one image, physically located in one place.
