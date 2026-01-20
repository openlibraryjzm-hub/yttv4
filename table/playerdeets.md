# Advanced Player Controller Styling Specifications
**Target Platform:** C# / WPF / WinUI
**Source Context:** React/Tailwind Refactor

This document contains precise styling specifications for the Advanced Player Controller (`PlayerController.jsx`). All values are provided in raw CSS/Hex formats.

---

## 1. Top Playlist Menu (Left Rectangle)

This menu displays the current playlist context and video metadata.

### A. Main Container
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Dimensions** | `340px` x `102px` | Fixed Size |
| **Corner Radius** | `16px` | (`rounded-2xl`) |
| **Background** | `#E0F2FE` (Sky 100) | **95% Opacity** + Backdrop Blur (Glass) |
| **Border** | `4px` Solid | Color depends on theme (Default: `#bae6fd` Sky 200) |
| **Shadow** | `0 25px 50px -12px rgba(0,0,0,0.25)` | Large Shadow (`shadow-2xl`) |

### B. Title Text (Centered)
*   **Font:** `Segoe UI` (System).
*   **Weight:** **Black** / Extra Bold (`font-black`).
*   **Color:** `#082F49` (Sky 950).
*   **Size:** Dynamic (approx `18px`).
*   **Interaction:** Hover color `#0369A1` (Sky 700).

### C. Folder Badges (Below Title)
*   **Shape:** Capsule (`rounded-full`).
*   **Font:** `9px`, **Black**, Uppercase, Tracking `0.15em`.
*   **Background:** Color with `15` alpha (e.g., `#FF000015`).
*   **Border:** Solid 1px (Color matches folder).
*   **Effect:** Backdrop Blur `4px`.

### D. Bottom Control Bar
*   **Height:** `32px` (approx).
*   **Background:** `#F0F9FF` (Sky 50) - Slightly lighter than menu body.
*   **Border Top:** `1px` Solid `#E0F2FE`.
*   **Corner Radius:** Bottom-Left/Right `16px`.

### E. Metadata (Bottom Left)
*   **Font:** `10-11px`.
*   **Weight:** **Bold**.
*   **Case:** Uppercase.
*   **Tracking:** Widest (`tracking-widest`).
*   **Color:** `#0EA5E9` (Sky 500) `opacity-80`.
*   **Format:** `AUTHOR | VIEWS | YEAR`.

---

## 2. Top Video Menu (Right Rectangle)

This menu contains the video title and the main playback/action controls.

### A. Main Container & Title
*   **Matches Playlist Menu** exactly in dimensions (`340px` x `102px`), border, background, and shadow.
*   **Title:** Centered, same typography as Playlist Title.

### B. Action Buttons (Bottom Center Cluster)
All buttons share a common geometry:

*   **Shape:** Circle (`rounded-full`).
*   **Background:** `#FFFFFF` (White).
*   **Border:** `2px` Solid.
*   **Shadow:** Small (`shadow-sm`).
*   **Size:** `32px` x `32px` (approx).

| Button | Default Border | Active/State Border | Icon Color | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Previous/Next** | None (Text Only) | N/A | `#38BDF8` (Sky 400) | Chevrons |
| **Grid** | `#334155` (Slate 700) | N/A | `#475569` (Slate 600) | |
| **Play (Folder)** | `#334155` | **Folder Color** | `#475569` / **Color** | Cycles folders |
| **Shuffle** | `#334155` | **Color** (if filtered) | `#475569` / **Color** | |
| **Star** | `#334155` | **Folder Color** | `#475569` / **Color** | Filled if assigned |
| **Pin** | `#334155` | `#000` (Normal) / `#FBBF24` (Priority) | `#3B82F6` (Blue) / `#FBBF24` (Amber) | Amber = Priority |
| **Like** | `#334155` | `#0EA5E9` (Sky 500) | `#475569` / `#0EA5E9` | |
| **Info** | `#334155` | N/A | `#475569` | Open Tooltip |

---

## 3. Orb Menu (Center)

The central interactive hub.

### A. Main Body
*   **Size:** `154px` x `154px`.
*   **Shape:** Circle.
*   **Background:** `#F0F9FF` (Sky 50) with `backdrop-blur-3xl`.
*   **Shadow:** Large (`shadow-2xl`).

### B. Image Layer
*   **Clipping:** Circular by default.
*   **Spill Mode:** Allows image to extend into corners if enabled (controlled by SVG ClipPath).
*   **Glass Overlay:**
    *   Inner Glow: `bg-sky-200/10`.
    *   Highlights: `bg-gradient-to-tr` White/30% to Transparent.

### C. Visualizer Ring (External)
*   **Type:** Canvas-based audio reactive ring.
*   **Radius:** Starts at `77px` (Orb edge).
*   **Color:** `#FFFFFF` (White) [Default].

### D. Radial Buttons
8 Buttons positioned around the orb.

*   **Size:** `28px` x `28px`.
*   **Shape:** Circle.
*   **Background:** `#FFFFFF` (White).
*   **Border:** `2px` Solid `#F0F9FF` (Sky 50).
*   **Shadow:** `shadow-xl`.
*   **Icons:** `14px`, Slate 800.
*   **Interaction:** Scale 110% on hover.

---

## 4. Priority Pin (Special Element)
Located at the Top-Right of the **Playlist Menu**.

*   **Size:** `52px` x `39px`.
*   **Border:** `2px` Solid `#334155` (Slate 700).
*   **Active Ring:** `#38BDF8` (Sky 400).
*   **Content:** Thumbnail Image.
*   **Close Button:** Tiny Red (`#F43F5E`) circle (`16px`) at top-right corner, visible on hover.
