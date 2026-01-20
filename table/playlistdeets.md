# Playlist Page Design Specifications
**Target Platform:** C# / WPF / WinUI
**Source Context:** React/Tailwind Refactor

This document contains precise styling specifications for the Playlists Page. All values are provided in raw CSS/Hex formats suitable for translation into XAML or C# styling definitions.

---

## 1. Global Page Styles

| Element | Property | Value | Notes |
| :--- | :--- | :--- | :--- |
| **Page Background** | `Background`| `#E0F2FE` | Light Sky Blue |
| **Secondary Background** | `Background` | `#BAE6FD` | Slightly darker blue for UI accents |
| **Scrollbar Track** | `Background` | `rgba(224, 242, 254, 0.1)` | Very subtle transparent blue |
| **Scrollbar Thumb** | `Gradient` | `#052F4A` (Low Opacity) | Dark Blue base with ~40% opacity |

## 2. Typography

**Font Family:** `Segoe UI` (Windows Default System Font)

| Element | Size | Weight | Color (Hex) | Color Name |
| :--- | :--- | :--- | :--- | :--- |
| **Card Title** | `18px` | **Bold (700)** | `#052F4A` | Dark Blue |
| **Folder Label** | `14px` | **Medium (500)** | `#052F4A` | Dark Blue |
| **Body Text** | `14px` | Regular (400) | `#000000` | Black |
| **Metadata/Subtitle** | `12px` | Regular (400) | `#64748B` | Slate Gray |
| **Hover Text** | - | - | `#38BDF8` | Bright Sky Blue |

---

## 3. Playlist Card Component

The card uses a **"Mixed Theme"** architecture: a dark, semi-transparent outer container holding a light, opaque title bar and a dark thumbnail area.

### A. Outer Container (The Card)
*   **Background:** `#1E293B` (Slate 800) with **20% Opacity** (`rgba(30, 41, 59, 0.2)`)
*   **Border:** `#334155` (Slate 700) with **50% Opacity** (`rgba(51, 65, 85, 0.5)`)
*   **Border Thickness:** `2px`
*   **Corner Radius:** `12px`
*   **Padding:** `8px` (Internal spacing)
*   **Hover State:** Border color changes to `#38BDF8` (Sky 500) with **50% Opacity**.

### B. Title Bar (Inner Container)
*   **Height:** Fixed `38px`
*   **Background:** `#F1F5F9` (Slate 100) with **90% Opacity** (`rgba(241, 245, 249, 0.9)`)
*   **Border:** `#052F4A` (Solid Dark Blue)
*   **Border Thickness:** `2px`
*   **Corner Radius:** `6px`
*   **Hover Behavior:** A gradient overlay appears on the right side (`from-slate-100 via-slate-100 to-transparent`) to reveal control buttons.

### C. Thumbnail Area
*   **Resolution:** Prefer `1280x720` (MaxRes), fallback to `640x480`.
*   **Aspect Ratio:** **16:9** (Critical).
*   **Background:** `#0F172A` (Slate 900) - Used as letterbox/loading background.
*   **Corner Radius:** `8px`
*   **Image Fit:** Cover (Fill container, crop excess).

---

## 4. Folder Card Variant

Folder cards share the exact same dimensions and generic styling as Playlist Cards but contain specific indicators.

*   **Left Strip Indicator:**
    *   **Width:** `8px`
    *   **Position:** Overlay on the left edge of the thumbnail.
    *   **Color:** Dynamic (Matches assigned folder color).
    *   **Z-Index:** Above the image.
*   **Title Icon:**
    *   A colored circle (`12px` x `12px`) appears before the text in the Title Bar.

---

## 5. Color Palette Reference

| Hex Code | Alpha/Opacity | Usage Context |
| :--- | :--- | :--- |
| `#E0F2FE` | 100% | Main Page Background |
| `#052F4A` | 100% | Primary Text, Title Borders |
| `#38BDF8` | 100% | Hover Text, Focus Borders |
| `#1E293B` | 20% | Card Background |
| `#334155` | 50% | Card Border (Default) |
| `#F1F5F9` | 90% | Title Bar Background |
| `#0F172A` | 100% | Thumbnail Placeholder Background |
| `#64748B` | 100% | Subtitles, Metadata text |
