# Next Agent Instructions: Settings Page Customization

## Current State

We are in the process of expanding the **Settings Page** to offer deep customization options.

### What has been built (Functional):
1.  **Tabbed Interface**: Streamlined layout with tabs in the header (Configuration title removed). Organized into Appearance, Visualizer, Orb, and Signature tabs.
2.  **Page Banner Patterns**:
    *   **Functional**: Users can select "Diagonal", "Dots", "Mesh" (Diamond Grid), or "Solid" patterns for the page banners (Videos Page / Folders).
    *   **Live Preview**: A box in Settings shows the currently selected animated pattern.
    *   **State**: Managed via `configStore.bannerPattern`.
    *   **CSS**: Animations defined in `src/App.css`.
3.  **Orb Customization**:
    *   Custom image upload.
    *   Spill control (enable/disable, 4-quadrant toggles).
    *   Scale slider.
4.  **Profile**:
    *   Pseudonym and ASCII avatar customization.

### What is Mocked / Needs Implementation:
1.  **App Banner (Top of Window)**:
    *   **Current status**: Displays current `/public/banner.PNG`.
    *   **Mocked**: The preset buttons (Cosmic, Nature, etc.) and "Upload Custom Banner" button update a local mock state and **do not** actually change the banner file.
    *   **Goal**: Implement logic to swap the active banner image.
2.  **Visualizer**:
    *   **Current status**: Mock buttons for "Style" and "Color Mode" exist but do nothing.
    *   **Goal**: Connect these to the actual `AudioVisualizer` component properties.
3.  **Player Borders**:
    *   **Current status**: Mock buttons exist.
    *   **Goal**: Implement CSS changes to the player border based on selection.

## Key Files
- `src/components/SettingsPage.jsx` (UI)
- `src/store/configStore.js` (State)
- `src/App.css` (Animations)
