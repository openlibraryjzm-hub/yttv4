# Top Navigation Styling Specifications
**Target Platform:** C# / WPF / WinUI
**Source Context:** React/Tailwind Refactor

This document contains precise styling specifications for the Top Navigation Bar (`TopNavigation.jsx`). All values are provided in raw CSS/Hex formats suitable for translation into XAML or C# styling definitions.

---

## 1. Main Container (The Shell)

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Background** | `#E0F2FE` (Sky 100) | **95% Opacity** with Backdrop Blur (Glass Effect) |
| **Border Color** | `#38BDF8` (Sky 400) | **40% Opacity** |
| **Border Thickness** | `1px` | Solid |
| **Corner Radius** | `12px` | (`rounded-xl`) |
| **Box Shadow** | `0 10px 15px -3px rgba(0,0,0,0.1)` | Large shadow (`shadow-lg`) |
| **Padding** | `8px` | Internal spacing |
| **Margin Bottom** | `8px` | Spacing from content below |

---

## 2. Navigation Tabs

The tabs row behaves differently for the primary main pages versus the secondary/utility pages.

### A. Common Properties (All Tabs)
*   **Background:** `#FFFFFF` (White).
*   **Border Thickness:** `2px` (Solid).
*   **Height:** `36px` (`h-9`).
*   **Corner Radius:** `9999px` (Fully rounded / Circular / Capsule).

### B. State Styling (All Tabs)

| State | Border Color | Content Color | Transform |
| :--- | :--- | :--- | :--- |
| **Active** | `#0EA5E9` (Sky 500) | `#0284C7` (Sky 600) | Scale 105% |
| **Inactive** | `#334155` (Slate 700) | `#475569` (Slate 600) | None |
| **Hover (Inactive)**| `#334155` | `#475569` | Background becomes `#F8FAFC` (Slate 50) |

---

### C. Text Tabs (Primary Specs)
**Applies to:** `Playlists`, `Videos`

These tabs display **Text Only** and use a "Capsule" shape.

*   **Geometry:** Capsule (Width wraps text + padding).
*   **Padding:** `16px` Left/Right (`px-4`).
*   **Content:** Text Label.
*   **Typography:**
    *   **Font:** `Segoe UI`.
    *   **Size:** `12px` (`text-xs`).
    *   **Weight:** **Bold** (`font-bold`).
    *   **Case:** **UPPERCASE** (`uppercase`).
    *   **Letter Spacing:** Wide (`tracking-wide` / approx `0.025em`).

### D. Icon Tabs (Secondary Specs)
**Applies to:** `History`, `Likes`, `Pins`, `Settings`, `Support`

These tabs display **Icons Only** and use a "Circle" shape.

*   **Geometry:** Perfect Circle.
*   **Width:** Fixed `36px` (`w-9`).
*   **Padding:** `0` (Content centered).
*   **Content:** Icon (16px size).
*   **Icon Opacity:**
    *   **Active:** 100%
    *   **Inactive:** 80%

---

## 3. Right Action Area

Separated from the tabs by a vertical divider.

*   **Divider:** Left Border styled `#7DD3FC` (Sky 300) with **30% Opacity**.
*   **Spacing:** `8px` left margin.

### A. Close Menu Button (The "X")
*   **Dimensions:** `28px` x `28px`.
*   **Shape:** `8px` rounded corners (`rounded-lg`).
*   **Background:** `#F43F5E` (Rose 500).
*   **Border:** `#FB7185` (Rose 400), `1px` Solid.
*   **Icon Color:** White.
*   **Hover State:** Background `#E11D48` (Rose 600).

### B. Back Button (Chevron Left)
*   **Dimensions:** `28px` x `28px`.
*   **Shape:** Circle (`rounded-full`).
*   **Styling:** Matches **Inactive Tab** styling (White bg, Slate 700 border, Slate 600 icon).

---

## 4. Color Palette Reference

| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Sky 100** | `#E0F2FE` | Shell Background (95% Opacity) |
| **Sky 400** | `#38BDF8` | Shell Border (40% Opacity) |
| **Sky 500** | `#0EA5E9` | Active Tab Border |
| **Sky 600** | `#0284C7` | Active Tab Text |
| **Slate 700** | `#334155` | Inactive Tab Border |
| **Slate 600** | `#475569` | Inactive Tab Text |
| **Rose 500** | `#F43F5E` | Close Button Background |
| **Rose 400** | `#FB7185` | Close Button Border |
