# Orb Menu Image & Spillover Logic Specifications
**Target Platform:** C# / WPF / WinUI
**Source Context:** React/Tailwind Refactor

This document contains comprehensive specifications for the Orb Menu's image display, spillover system, and quadrant-based clipping logic. All values are provided in raw CSS/Hex formats suitable for translation into XAML or C# styling definitions.

---

## 1. Orb Container & Base Geometry

### A. Main Orb Body
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Dimensions** | `154px` x `154px` | Default size (configurable via `orbSize`) |
| **Shape** | Perfect Circle | `border-radius: 50%` or `Ellipse` in WPF |
| **Background** | `#F0F9FF` (Sky 50) | With `backdrop-blur-3xl` glass effect |
| **Border** | `6px` Solid | Color depends on theme (Default: Sky variant) |
| **Shadow** | `0 25px 50px -12px rgba(0,0,0,0.25)` | Large shadow (`shadow-2xl`) |
| **Overflow** | `visible` | Critical for spillover functionality |

### B. Image Layer Container
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Position** | `absolute` | `inset-0` (fills orb container) |
| **Z-Index** | `40` | Above base orb, below buttons |
| **Pointer Events** | `none` | Prevents interaction blocking |
| **Clip Path** | `url(#orbClipPath)` | SVG-based clipping mask |
| **Overflow** | `visible` | Allows spillover beyond circle |

---

## 2. Image Source Priority

The orb image follows a **fallback chain** for source selection:

1. **Custom Uploaded Image** (`customOrbImage`)
   - Base64-encoded image data
   - Persisted to localStorage/config
   - User-uploaded via file picker (PNG, JPG, GIF)

2. **Current Video Thumbnail** (`playlistImage`)
   - Thumbnail URL from currently playing video
   - Updates automatically on video change

3. **Fallback Placeholder**
   - Default/empty state image
   - Shown when no custom image or video thumbnail available

**Implementation Note:**
```javascript
const orbImageSrc = customOrbImage || playlistImage;
```

---

## 3. Spillover System

### A. Spillover Toggle

| Property | Type | Default | Persistence |
| :--- | :--- | :--- | :--- |
| **`isSpillEnabled`** | `bool` | `false` | localStorage/config store |

**Behavior:**
- When **disabled**: Image is strictly clipped to circular boundary (`objectFit: cover`, 100% size)
- When **enabled**: Image can extend beyond circle into enabled quadrants (scaled/transformed)

### B. Quadrant Control System

The spillover system uses a **4-quadrant model** for selective spill control:

| Quadrant | Property | Coordinates | Description |
| :--- | :--- | :--- | :--- |
| **Top-Left** | `orbSpill.tl` | `x < 0.5, y < 0.5` | Upper-left corner |
| **Top-Right** | `orbSpill.tr` | `x ≥ 0.5, y < 0.5` | Upper-right corner |
| **Bottom-Left** | `orbSpill.bl` | `x < 0.5, y ≥ 0.5` | Lower-left corner |
| **Bottom-Right** | `orbSpill.br` | `x ≥ 0.5, y ≥ 0.5` | Lower-right corner |

**Default State:**
```javascript
orbSpill: { tl: true, tr: true, bl: true, br: true }  // All quadrants enabled
```

**Persistence:** Stored in config store (localStorage), persists across sessions.

---

## 4. SVG ClipPath Implementation

The clipping mask is generated via an **SVG `<clipPath>`** element with conditional quadrant rectangles.

### A. Base Circle Clip
```xml
<clipPath id="orbClipPath" clipPathUnits="objectBoundingBox">
  <circle cx="0.5" cy="0.5" r="0.5" />
  <!-- Quadrant rectangles added conditionally -->
</clipPath>
```

**Coordinate System:**
- Uses `clipPathUnits="objectBoundingBox"` (normalized 0-1 coordinates)
- Circle center: `(0.5, 0.5)`
- Circle radius: `0.5` (fills bounding box)

### B. Quadrant Rectangle Definitions

Each enabled quadrant adds a rectangle that extends **beyond the bounding box** to allow spillover:

| Quadrant | Rectangle Definition | Purpose |
| :--- | :--- | :--- |
| **Top-Left** | `<rect x="-50" y="-50" width="50.5" height="50.5" />` | Extends left and up |
| **Top-Right** | `<rect x="0.5" y="-50" width="50.5" height="50.5" />` | Extends right and up |
| **Bottom-Left** | `<rect x="-50" y="0.5" width="50.5" height="50.5" />` | Extends left and down |
| **Bottom-Right** | `<rect x="0.5" y="0.5" width="50.5" height="50.5" />` | Extends right and down |

**Key Values:**
- Negative coordinates (`-50`) extend beyond the 0-1 bounding box
- Width/Height of `50.5` ensures full coverage of extended area
- Only rendered when `isSpillEnabled && orbSpill.{quadrant}` is `true`

**Implementation Logic:**
```javascript
{isSpillEnabled && orbSpill.tl && <rect x="-50" y="-50" width="50.5" height="50.5" />}
{isSpillEnabled && orbSpill.tr && <rect x="0.5" y="-50" width="50.5" height="50.5" />}
{isSpillEnabled && orbSpill.bl && <rect x="-50" y="0.5" width="50.5" height="50.5" />}
{isSpillEnabled && orbSpill.br && <rect x="0.5" y="0.5" width="50.5" height="50.5" />}
```

---

## 5. Image Scaling & Transformation

When spillover is **enabled**, the image uses **multiplicative scaling** and **translation transforms**.

### A. Scaling Parameters

| Parameter | Type | Default | Range | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`orbImageScale`** | `float` | `1.0` | `0.5 - 3.0` | Master scale multiplier |
| **`orbImageScaleW`** | `float` | `1.0` | `0.2 - 3.0` | Width scale multiplier |
| **`orbImageScaleH`** | `float` | `1.0` | `0.2 - 3.0` | Height scale multiplier |

**Final Dimensions Calculation:**
```javascript
width = orbSize * orbImageScale * orbImageScaleW
height = orbSize * orbImageScale * orbImageScaleH
```

**Example:**
- `orbSize = 154px`
- `orbImageScale = 1.5`
- `orbImageScaleW = 1.2`
- `orbImageScaleH = 0.8`
- **Result:** `277.2px` x `184.8px`

### B. Translation (Panning) Parameters

| Parameter | Type | Default | Range | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`orbImageXOffset`** | `int` | `0` | `-150` to `150` | Horizontal pan (px) |
| **`orbImageYOffset`** | `int` | `0` | `-150` to `150` | Vertical pan (px) |

**Transform Application:**
```javascript
transform: `translate(${orbImageXOffset}px, ${orbImageYOffset}px)`
```

### C. Object Fit Behavior

| Mode | `objectFit` Value | Behavior |
| :--- | :--- | :--- |
| **Spill Disabled** | `cover` | Image fills circle, maintains aspect ratio, may crop |
| **Spill Enabled** | `contain` | Image fits within scaled bounds, may show letterboxing |

**Implementation:**
```javascript
objectFit: isSpillEnabled ? 'contain' : 'cover'
```

---

## 6. State Management & Persistence

### A. Config Store Properties

All orb image state is managed via a centralized config store (Zustand with persistence):

| Property | Setter | Storage Key | Default |
| :--- | :--- | :--- | :--- |
| `customOrbImage` | `setCustomOrbImage` | `customOrbImage` | `null` |
| `isSpillEnabled` | `setIsSpillEnabled` | `isSpillEnabled` | `false` |
| `orbSpill` | `setOrbSpill` | `orbSpill` | `{ tl: true, tr: true, bl: true, br: true }` |
| `orbImageScale` | `setOrbImageScale` | `orbImageScale` | `1.0` |
| `orbImageScaleW` | `setOrbImageScaleW` | `orbImageScaleW` | `1.0` |
| `orbImageScaleH` | `setOrbImageScaleH` | `orbImageScaleH` | `1.0` |
| `orbImageXOffset` | `setOrbImageXOffset` | `orbImageXOffset` | `0` |
| `orbImageYOffset` | `setOrbImageYOffset` | `orbImageYOffset` | `0` |
| `orbSize` | `setOrbSize` | `orbSize` | `150` (154px in UI) |

**Persistence:** All values saved to localStorage (or equivalent in C#) with key `config-storage-v10`.

### B. State Flow

**1. Image Upload Flow:**
```
User hovers orb → Upload button appears (opacity transition)
User clicks upload → File picker opens
User selects image → FileReader reads file
FileReader converts to base64 → setCustomOrbImage(imageDataUrl)
Config store persists → localStorage.setItem('customOrbImage', imageDataUrl)
Component re-renders → Image displays immediately
```

**2. Spill Toggle Flow:**
```
User clicks Spill/Clipping button → setIsSpillEnabled(!isSpillEnabled)
Config store updates → localStorage.setItem('isSpillEnabled', isSpillEnabled.toString())
Component re-renders → ClipPath SVG updates → Image clipping behavior changes
```

**3. Quadrant Toggle Flow:**
```
User toggles quadrant in Settings → setOrbSpill({ ...orbSpill, [quadrant]: !orbSpill[quadrant] })
Config store updates → localStorage persists new orbSpill object
Component re-renders → ClipPath SVG adds/removes quadrant rectangle
```

**4. Scale/Offset Change Flow:**
```
User adjusts slider in Settings → setOrbImageScale(value) / setOrbImageXOffset(value)
Config store updates → localStorage persists new value
Component re-renders → Image transform style updates → Image position/size changes
```

---

## 7. Image Upload & Processing

### A. File Input

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Accept Types** | `image/*` | PNG, JPG, GIF, WEBP |
| **Input Type** | `file` | Hidden input element |
| **Trigger** | Upload button click (12 o'clock position on orb) |

### B. Upload Button

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Position** | `absolute` | Top center of orb (`left: 50%`, `top: 0`) |
| **Transform** | `translate(-50%, -50%)` | Centers button above orb |
| **Size** | `28px` x `28px` | Circular button |
| **Visibility** | `opacity-0` by default, `opacity-100` on orb hover | Smooth transition |
| **Background** | `#FFFFFF` (White) |
| **Border** | `2px` Solid `#F0F9FF` (Sky 50) |
| **Shadow** | `shadow-xl` |
| **Icon** | Upload icon, `16px`, Sky accent color |

### C. Image Processing

**Current Implementation:**
- File is read via `FileReader.readAsDataURL()`
- Result stored as base64 string directly
- **No compression/resizing** in current React implementation

**Recommended for C#:**
- Load image into `Bitmap` or `ImageSource`
- Optionally resize/compress for performance
- Store as base64 string or file path in config

---

## 8. Visual Effects & Overlays

### A. Glass Overlay

| Layer | Property | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Inner Glow** | Background | `rgba(14, 165, 233, 0.1)` (Sky 200/10%) | Subtle inner highlight |
| **Gradient** | Background | `linear-gradient(to top-right, white 30%, transparent)` | Glass shine effect |
| **Opacity** | `opacity` | `60%` | Subtle overlay |

**Z-Index:** `10` (above image, below buttons)

### B. Adjuster Border Guide

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Visibility** | Conditional (`isAdjustingImage`) | Shown during manual adjustment |
| **Border** | `4px` Dashed `rgba(56, 189, 248, 0.5)` (Sky 400/50%) | Animated pulse |
| **Animation** | `animate-pulse` | Continuous fade in/out |
| **Shadow** | `0 0 20px rgba(56,189,248,0.5)` | Glow effect |

**Purpose:** Visual feedback when user is actively adjusting image position/size.

---

## 9. C# / WPF Implementation Notes

### A. ClipPath Translation

**WPF Equivalent:**
- Use `ClipGeometry` with `CombinedGeometry` (Union operation)
- Base: `EllipseGeometry` (circle)
- Quadrants: `RectangleGeometry` with extended bounds (negative coordinates)

**Example Structure:**
```csharp
var baseCircle = new EllipseGeometry(new Point(0.5, 0.5), 0.5, 0.5);
var combined = new CombinedGeometry(GeometryCombineMode.Union, baseCircle, null);

if (isSpillEnabled && orbSpill.TopLeft)
{
    var tlRect = new RectangleGeometry(new Rect(-50, -50, 50.5, 50.5));
    combined = new CombinedGeometry(GeometryCombineMode.Union, combined, tlRect);
}
// Repeat for other quadrants...

imageElement.Clip = combined;
```

### B. Transform Application

**WPF Transform:**
```csharp
var transformGroup = new TransformGroup();
transformGroup.Children.Add(new ScaleTransform(
    orbSize * orbImageScale * orbImageScaleW,
    orbSize * orbImageScale * orbImageScaleH
));
transformGroup.Children.Add(new TranslateTransform(
    orbImageXOffset,
    orbImageYOffset
));
imageElement.RenderTransform = transformGroup;
```

### C. State Persistence

**Recommended Approach:**
- Use `ApplicationSettings` or `IsolatedStorageSettings` (UWP)
- Or JSON config file with `System.Text.Json`
- Store base64 image strings, boolean flags, and numeric values

**Config Structure:**
```csharp
public class OrbConfig
{
    public string CustomOrbImage { get; set; }  // Base64 string
    public bool IsSpillEnabled { get; set; }
    public OrbSpillQuadrants OrbSpill { get; set; }
    public double OrbImageScale { get; set; }
    public double OrbImageScaleW { get; set; }
    public double OrbImageScaleH { get; set; }
    public int OrbImageXOffset { get; set; }
    public int OrbImageYOffset { get; set; }
}

public class OrbSpillQuadrants
{
    public bool TopLeft { get; set; }
    public bool TopRight { get; set; }
    public bool BottomLeft { get; set; }
    public bool BottomRight { get; set; }
}
```

---

## 10. Settings UI Integration

### A. Orb Tab Controls

The Settings page provides a dedicated **Orb Tab** with the following controls:

| Control | Type | Range | Purpose |
| :--- | :--- | :--- | :--- |
| **Spillover Toggle** | Toggle Switch | On/Off | Enable/disable spill mode |
| **Quadrant Toggles** | 4 Toggle Buttons | On/Off each | Enable/disable individual quadrants |
| **Master Size Slider** | Slider | 20% - 300% | Overall scale multiplier |
| **Width % Slider** | Slider | 20% - 300% | Width scale multiplier |
| **Height % Slider** | Slider | 20% - 300% | Height scale multiplier |
| **Offset X Slider** | Slider | -150px to 150px | Horizontal pan |
| **Offset Y Slider** | Slider | -150px to 150px | Vertical pan |

**Visual Layout:**
- Spillover toggle at top
- Quadrant grid (2x2) below toggle
- Scale sliders in two-column grid
- Offset sliders in two-column grid

---

## 11. Performance Considerations

### A. Image Size Limits

**Recommendations:**
- Maximum image dimensions: `512px` x `512px` (before scaling)
- Base64 string size: Keep under `500KB` for localStorage performance
- Consider image compression on upload (JPEG quality 80-85%)

### B. Rendering Optimization

- Use `RenderOptions.BitmapScalingMode` in WPF for smooth scaling
- Cache transformed image bitmap when scale/offset don't change
- Use `VirtualizingStackPanel` if rendering multiple orbs

### C. State Update Batching

- Debounce slider updates (wait 100-200ms after last change before persisting)
- Batch multiple quadrant toggles into single state update
- Use `Dispatcher.BeginInvoke` for non-critical updates

---

## 12. Edge Cases & Validation

### A. Invalid Image Data

- Validate base64 string format before rendering
- Fallback to video thumbnail if custom image fails to load
- Show error message if image file is corrupted

### B. Extreme Scale Values

- Clamp scale values to valid range (0.5 - 3.0) on load
- Prevent division by zero in calculations
- Validate offset values stay within reasonable bounds

### C. Missing Quadrant State

- Default all quadrants to `true` if `orbSpill` object is missing
- Handle partial quadrant objects gracefully
- Migrate old config format if structure changes

---

## 13. Color Reference

| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Sky 50** | `#F0F9FF` | Orb background, glass overlay |
| **Sky 200** | `#BAE6FD` | Inner glow, border accents |
| **Sky 400** | `#38BDF8` | Adjuster border guide |
| **White** | `#FFFFFF` | Upload button, gradient overlay |
| **Transparent** | `rgba(0,0,0,0)` | Gradient fade-out |

---

## Summary

The Orb Menu spillover system provides:
1. **Flexible Image Display**: Custom uploads or video thumbnails
2. **Selective Spillover**: 4-quadrant control for precise image extension
3. **Advanced Scaling**: Multi-parameter scaling (master, width, height)
4. **Panning Control**: X/Y offset for image positioning
5. **Persistent State**: All settings saved to config storage
6. **Visual Feedback**: Glass overlays and adjustment guides

The system uses SVG clipPath for clipping (WPF: CombinedGeometry) and CSS transforms for scaling/positioning (WPF: TransformGroup with ScaleTransform/TranslateTransform).
