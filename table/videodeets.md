# Video Page Design Specifications
**Target Platform:** C# / WPF / WinUI
**Source Context:** React/Tailwind Refactor

This document contains precise styling specifications for the Videos Page. All values are provided in raw CSS/Hex formats suitable for translation into XAML or C# styling definitions.

---

## 1. Global Page Styles

| Element | Property | Value | Notes |
| :--- | :--- | :--- | :--- |
| **Page Background** | `Background`| `#E0F2FE` | Light Sky Blue (Same as Playlists) |
| **Grid Spacing** | `Gap` | `16px` | Standard grid gap |
| **Column Count** | `Grid` | `3` | Standard view columns |

---

## 2. Video Card Component

The Video Card is "Minimal" variant compared to the Playlist card, focusing on the thumbnail content.

### A. Dimensions & Structure
*   **Aspect Ratio:** **16:9** (Critical). 
*   **Corner Radius:** `8px` (`rounded-lg`).
*   **Border (Default):** `1px` Solid `#334155` (Slate 700).
*   **Background:** `#1E293B` (Slate 800) - Visible primarily behind text area.

### B. State Styling
| State | Visual Change | Hex Value |
| :--- | :--- | :--- |
| **Selected** | **Border Color** | `#38BDF8` (Sky 400) |
| **Playing** | **Ring / Glow** | `#EF4444` (Red 500) - 4px Width |
| **Playing** | **Shadow** | Red Glow (`0 0 40px #EF4444`) |
| **Hover** | **Overlay** | `rgba(0,0,0,0.4)` (Black 40%) |

### C. Typography
*   **Font:** `Segoe UI` (System Default).
*   **Title:**
    *   **Color:** `#052F4A` (Dark Blue).
    *   **Size:** `14px` (approx).
    *   **Weight:** Medium/Bold.
*   **Subtitle (Video ID):**
    *   **Color:** `#64748B` (Slate 500).
    *   **Visibility:** Hidden by default, visible on Hover.

---

## 3. Card Icons (Hover Overlay)

These icons appear over the thumbnail on hover.

### A. Pin Button (Top Right)
| State | Background | Icon/Text Color | Border |
| :--- | :--- | :--- | :--- |
| **Normal (Unpinned)** | `rgba(0,0,0,0.7)` | `#94A3B8` (Slate 400) | None |
| **Pinned (Standard)** | `rgba(14, 165, 233, 0.1)` | `#0EA5E9` (Sky 500) | `#0EA5E9` (1px) |
| **Priority Pin (Hold)** | `rgba(245, 158, 11, 0.1)` | `#F59E0B` (Amber 500) | `#F59E0B` (1px) |

### B. Quick Assign Star (Top Right)
*   **Background:** `rgba(0,0,0,0.7)` (Black 70%).
*   **Shape:** Rounded Square.
*   **Icon Color:** Dynamic. Matches the assigned folder color (e.g., Red). Defaults to `#64748B` if unassigned.

---

## 4. Sticky Toolbar (The Prism)

A complex, multi-element control bar sticking to the top of the view.

### A. Container
*   **Background:** Transparent / Backdrop Blur.
*   **Border:** Bottom border `rgba(255,255,255,0.1)`.

### B. Folder Selector (Left Side)
*   **"All" Button:**
    *   **Active:** `#475569` (Slate 600).
    *   **Inactive:** `#334155` (Slate 700).
    *   **Text:** White (Active) / Gray (Inactive).
*   **"Unsorted" Button:**
    *   **Active:** `#64748B` (Slate 500) with White Ring.
    *   **Inactive:** `#334155` (Slate 700).
*   **Color Dots:**
    *   **Size:** `32px` x `32px` (Standard) or `24px` x `24px` (Compact).
    *   **Shape:** Circle.
    *   **Active State:** Scale 110% + `2px` White Ring outline.
    *   **Counter Text:** Centered inside dot. White, `10px`, Bold.

### C. Actions (Right Side)
*   **Add Button:** `Background: #0EA5E9` (Sky 500). White text/icon.
*   **Bulk Tag Toggle:** Standard Toggle styling.

---

## 5. Color Reference (Video Page Specific)

| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Playing Red** | `#EF4444` | Active Video Border/Glow |
| **Slate 800** | `#1E293B` | Card Background |
| **Slate 700** | `#334155` | Inactive Buttons / Card Border |
| **Amber 500** | `#F59E0B` | Priority Pin |
| **Sky 500** | `#0EA5E9` | Add Button / Pinned State |
| **Black Overlay**| `#000000` (40-70%) | Hover Backgrounds |
