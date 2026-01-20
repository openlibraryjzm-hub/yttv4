# C# Sandwich Mode Guide

## 🥪 The Architecture

We are replacing the standard "Tauri" shell with a custom C# "Sandwich":

1.  **Top Layer (Future):** Hidden WebView2 for "Mock Browser" (Always on).
2.  **Middle Layer (Current):** Transparent WebView2 running your React App.
3.  **Bottom Layer (Future):** Native MPV Window for video playback.

## 🚀 How to Run in "Sandwich Mode"

You will now use **two terminals** to develop. This gives you the best of both worlds: React Hot Reloading + C# Native Capabilities.

### Terminal 1: The Frontend (React/Vite)
This serves your UI/CSS/GSAP animations.
```powershell
npm run dev
```
*Note: This starts Vite on http://localhost:1420. It will NOT open a window.*

### Terminal 2: The Host (C#)
This opens the native window that "eats" the sandwich.
```powershell
dotnet watch run --project src-csharp/Yttv2.Host
```
*Note: `dotnet watch` means if you change any C# code (like adding MPV later), it instantly reloads.*

## ✅ What to verify now
1.  Run the commands above.
2.  You should see a **C# Window** (Black/Transparent background) load your React App.
3.  Navigation and Animations should work perfectly.
4.  **Backend features will fail** (Database, File reading) because we haven't bridged them yet. This is expected.

## 🔜 Next Steps
Once you confirm the UI loads:
1.  We add **Mpv.NET** to the C# project.
2.  We wire up the "Transparent Hole" in React so you can see the video.
