# Audio Visualizer: Animation & Smoothness Logic

This document details the exact animation and signal processing logic used to achieve the ultra-smooth audio visualizer in the application. Use this as a reference for porting or tuning the C# implementation.

---

## 1. The "Secret Sauce" of Smoothness

There is no single magic setting. The smoothness comes from the interaction of three specific architectural decisions:

1.  **Sliding Window FFT (High Overlap)**
2.  **Decoupled Render & Processing Loops**
3.  **Heavy Temporal Smoothing (Exponential Decay)**

### 1.1 Sliding Window FFT (Critical)

This is the most important factor. The "choppiness" in many visualizers comes from processing discrete chunks of audio (Reading Chunk A -> FFT -> Reading Chunk B -> FFT). This creates a discontinuous "strobe" effect.

**Our Approach:**
*   **Sample Rate**: 48,000 Hz
*   **Update Rate**: ~60 FPS (Every 16ms)
*   **New Data per Frame**: ~768 samples (16ms * 48kHz)
*   **FFT Size**: **2048 samples**

**The Math**:
At every 16ms update tick, we do NOT just look at the new 768 samples.
We look at the **last 2048 samples** in the buffer.

```text
Frame 1: [ Oldest .............................. Newest ] (2048 samples)
Frame 2:          [ Oldest .............................. Newest ] (2048 samples)
                    <-- Shared/Overlapping Data (~65%) -->
```

**Result**: Roughly 65% of the data in Frame 2 is identical to Frame 1. This guarantees that the frequency output cannot change drastically between frames, providing intrinsic "physics-like" continuity before any smoothing code is even hit.

### 1.2 Decoupled Loops

We separate the "Math" from the "Pixels".

*   **Processing Loop (`setInterval` @ 16ms)**:
    *   Takes the current tail of the Ring Buffer.
    *   Applies Window Function (Hanning).
    *   Computes FFT.
    *   Maps to 113 Bars.
    *   Applies Temporal Smoothing.
    *   Updates the atomic `currentBarValues` state.

*   **Render Loop (`requestAnimationFrame`)**:
    *   Runs at the monitor's native refresh rate (60Hz, 144Hz, etc.).
    *   Read-only access to `currentBarValues`.
    *   Blindly draws whatever is current.
    *   **Benefit**: If an FFT calculation spikes in CPU time, it does not freeze the frame. The visualizer might show the same frame twice, but the rendering pipeline (and the UI) remains fluid.

---

## 2. Signal Processing Pipeline

### Step 1: Ring Buffer (The Foundation)
**Incoming Data**: We receive audio "packets" from the backend (Rust/C# Audio Thread) whenever they are ready. We do NOT process them immediately.
**Action**: Push to a `RingBuffer` (FIFO Queue) capable of holding ~2 seconds of audio. This absorbs delivery jitter.

### Step 2: The Window Function
Before FFT, the 2048-sample chunk is multiplied by a **Hanning Window**.
```javascript
// Pseudo-code
for (let i = 0; i < fftSize; i++) {
    // Tapers the edges of the signal to zero to prevent spectral leakage
    float multiplier = 0.5 * (1 - cos(2 * PI * i / (fftSize - 1)));
    windowedData[i] = rawData[i] * multiplier;
}
```
*Missing this step causes "flickering" or "ghosting" high frequencies.*

### Step 3: Logarithmic Mapping (Humanizing)
Raw FFT gives linear bins (0-22kHz). This looks wrong to humans because we hear logarithmically.
We map the 1024 FFT bins to our **113 Visual Bars** using a Log Scale.

**Config:**
*   **Min Freq**: 60 Hz (Bass)
*   **Max Freq**: 11,000 Hz (Air/Treble)

**Formula**:
For bar `i` (0 to 112):
$$ Freq_{start} = Min \times (\frac{Max}{Min})^{\frac{i}{TotalBars}} $$

### Step 4: Temporal Smoothing (The "Weight")
The raw FFT values are erratic. We apply a heavy Exponential Moving Average (EMA).

**Value**: `0.75` (Heavy smoothing)

```csharp
// C# Implementation Logic
// smoothingFactor = 0.75
// 1.0 - smoothingFactor = 0.25 (The "Responsiveness")

newValue = (targetValue * 0.25) + (previousValue * 0.75);
```
*   **0.75** means the bar "resists" movement. It retains 75% of its previous height every frame.
*   this simulates "mass" or inertia.
*   **Effect**: The bars glide rather than jump.

---

## 3. C# Implementation Checklist

If your C# app feels "laggy" or "jittery", check these items in order:

1.  **Check Buffer & Overlap**
    *   ❌ **Bad**: Reading 2048 samples, waiting for them to play, then reading the next 2048. (Updates at ~23 FPS).
    *   ✅ **Good**: Reading the latest 2048 samples every **16ms**. (Updates at 60 FPS, with overlapping data).

2.  **Check Threading**
    *   Ensure your `WasapiLoopback` (NAudio/CSCore) is filling a buffer in a background thread.
    *   Ensure your UI (WPF/WinUI) is pulling from that buffer on `CompositionTarget.Rendering` or a high-precision timer.
    *   **Do not trigger UI updates directly from the Audio Data Available event.** That event fires irregularly.

3.  **Tune the Smoothing**
    *   Start with `0.5` linear interpolation.
    *   Increase to `0.7` or `0.8` for a "syrupy" liquid feel.

4.  **Confirm Hanning Window**
    *   Ensure you are applying a window function before the FFT. Without it, the data is mathematically "noisy" at the chunk boundaries.

## 4. Reference Constants

Use these exact values to replicate the Atlas Visualizer feel:

| Parameter | Value | Note |
| :--- | :--- | :--- |
| **FFT Size** | `2048` | Higher = More Bass Resolution |
| **Update Rate** | `16ms` (60Hz) | The loop timer |
| **Smoothing** | `0.75` | 0.0=Raw, 0.9=Slow |
| **Pre-Amp Gain** | `4.0` | Multiplier for raw signal |
| **Min Freq** | `60 Hz` | Below this is usually mud |
| **Max Freq** | `11,000 Hz` | Above this is barely visible |
| **Bar Count** | `113` | Decorative choice |
