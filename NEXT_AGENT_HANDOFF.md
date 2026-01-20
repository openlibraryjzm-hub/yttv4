# 🤖 NEXT AGENT HANDOFF: C# Migration & Sandwich Architecture

## 🏁 Current Status
**We have successfully established the "Sandwich Implementation" Proof of Concept.**
*   **Frontend:** The existing React/Vite app is running (`npm run dev`) on port 1420.
*   **Backend Host:** A new C# WPF application (`src-csharp/Yttv2.Host`) is running (`dotnet watch run`), hosting the React app in a specific `WebView2` control.
*   **Connectivity:** The C# Host successfully injects a `bridge` object. We have verified we can call C# methods from the React console.

## 🎯 The Mission
**Migrate the entire backend from Rust (Tauri) to C# (.NET 8 WPF).**
The User wants to use C# because it natively supports:
1.  **Child Windows inside the App** (Mock Browser Requirement).
2.  **Complex native layer composition** (MPV Video Player *under* the UI, WebView *over* the UI).

## 📂 Key Directories
*   `src/`: The React Frontend (Reuse 100%).
*   `src-tauri/src/`: The Old Rust Backend (Source of Truth for Logic/SQL).
*   `src-csharp/Yttv2.Host/`: The New C# Backend (Target for Migration).

## 🗺️ The Roadmap (Already Defined)
**Refer to `C_SHARP_MIGRATION_PLAN.md` for the step-by-step checklist.**
We are currently at **Phase 1**.

### Phase 1 & 2: Frontend Bridge Abstraction 🚧 (IMMEDIATE NEXT STEP)
We need to refactor the Frontend API so it works with **both** Tauri (for safety) and C# (for the future).
1.  Create `src/utils/bridge.js` to wrap calls.
    *   If `window.chrome.webview.hostObjects.bridge` exists -> Call C# Bridge.
    *   Else -> Call Tauri `invoke`.
2.  Refactor `src/api/playlistApi.js` to use this new wrapper.

### Phase 3: The Great Database Port 📦
We need to copy the SQL logic from `src-tauri/src/database.rs` to `src-csharp/Yttv2.Host/Services/DatabaseService.cs`.
*   **Completed:** `GetAllPlaylists`
*   **ToDo:** ~30 methods (Create, Delete, Update, Folder Logic, etc.).
*   **Note:** The Schema is identical. We are just translating the *calling code* from Rust to C#.

### Phase 4: Building the Bridge 🌉
Expose the new C# Services to JavaScript via `AppBridge.cs`.
*   Ensure C# methods return JSON strings (React expects JSON).

### Phase 5 & 6: Audio & Video 🎵 🎥
*   **Audio:** Implementation of `NAudio` `WasapiLoopbackCapture` to replace Rust `cpal`.
*   **Video:** implementation of `Mpv.NET` to replace the Tauri MPV plugin.

## 🛠️ How to Resume Work
1.  **Open 2 Terminals:**
    *   T1: `npm run dev`
    *   T2: `dotnet watch run --project src-csharp/Yttv2.Host`
2.  **Read:** `C_SHARP_MIGRATION_PLAN.md`.
3.  **Action:** Start creating `src/utils/bridge.js` as described in Phase 1.

## 🧠 Context for the AI
*   The User is **NOT** rewriting the Frontend. It stays React/Zustand.
*   The User has "Extreme Fear" about the Audio Visualizer breaking. Reassure them that `NAudio` is a superior solution for Windows, but it involves a rewrite of the capture logic later (Phase 5).
*   Use `Microsoft.Data.Sqlite` for the database.
*   We operate in a "Hybrid" state right now. The App opens, UI works, but data is empty until we port the SQL queries.
