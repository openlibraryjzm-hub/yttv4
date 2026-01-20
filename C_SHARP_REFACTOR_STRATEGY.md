# C# Refactoring Strategy for PlaylistsPage

## 🎯 Approach: Phased Refactoring Within Project

**Recommendation**: Build C# files **within this project** in a separate folder structure. This allows:
- ✅ Full context access (documentation, original files)
- ✅ Side-by-side comparison
- ✅ Incremental testing
- ✅ Better agent understanding

---

## 📁 Proposed Folder Structure

```
yttv2/
├── src/                          # Original React files (keep as reference)
├── src-csharp/                   # NEW: C# refactored files
│   ├── Yttv2.Core/              # Core utilities & models
│   │   ├── Utils/
│   │   │   ├── FolderColors.cs
│   │   │   └── YouTubeUtils.cs
│   │   └── Models/
│   │       ├── Playlist.cs
│   │       ├── PlaylistItem.cs
│   │       └── FolderColor.cs
│   │
│   ├── Yttv2.Services/           # State management & API
│   │   ├── Stores/              # Zustand → C# services
│   │   │   ├── PlaylistStore.cs
│   │   │   ├── FolderStore.cs
│   │   │   ├── TabStore.cs
│   │   │   ├── TabPresetStore.cs
│   │   │   ├── LayoutStore.cs
│   │   │   ├── NavigationStore.cs
│   │   │   └── ConfigStore.cs
│   │   └── Api/
│   │       └── PlaylistApiService.cs  # Tauri invoke → C# service
│   │
│   ├── Yttv2.Data/              # Database layer
│   │   ├── Database.cs
│   │   ├── Repositories/
│   │   │   ├── PlaylistRepository.cs
│   │   │   └── FolderRepository.cs
│   │   └── Migrations/
│   │
│   └── Yttv2.UI/                # UI Components (WPF/MAUI/Avalonia)
│       ├── Components/
│       │   ├── PlaylistsPage.xaml.cs
│       │   ├── TabBar.xaml.cs
│       │   ├── PageBanner.xaml.cs
│       │   ├── NewCardMenu.xaml.cs
│       │   └── ...
│       ├── Modals/
│       │   ├── PlaylistUploader.xaml.cs
│       │   ├── BulkPlaylistImporter.xaml.cs
│       │   └── ...
│       └── Skeletons/
│           └── PlaylistCardSkeleton.xaml.cs
│
└── atlas/                        # Documentation (reference)
```

---

## 🔄 Dependency Analysis

### Dependency Graph

```
Level 0 (No Dependencies):
├── Utils/FolderColors.cs
└── Utils/YouTubeUtils.cs

Level 1 (Depend on Utils):
├── Services/Stores/*.cs (use FolderColors)
└── Data/Database.cs (schema only)

Level 2 (Depend on Stores + Utils):
├── Services/Api/PlaylistApiService.cs
└── UI/Components/Simple components

Level 3 (Depend on Other Components):
├── UI/Components/TabBar.cs (uses TabPresetsDropdown)
├── UI/Components/PlaylistsPage.cs (uses everything)
└── UI/Modals/*.cs (use stores + API)
```

---

## 📋 Phased Refactoring Plan

### **Phase 0: Foundation Setup** (Do First)
**Can be done independently, no dependencies**

1. **Create folder structure** (`src-csharp/`)
2. **Set up project files** (.csproj, solution)
3. **Choose UI framework** (WPF/MAUI/Avalonia)
4. **Set up database** (SQLite connection, schema)

**Files to create:**
- Project structure
- Database initialization
- Basic models

---

### **Phase 1: Utilities** (Independent)
**✅ Can refactor individually - no dependencies**

#### 1.1 `Utils/FolderColors.cs`
- **Source**: `src/utils/folderColors.js`
- **Dependencies**: None
- **Complexity**: Low (direct port)
- **Time**: ~30 min

#### 1.2 `Utils/YouTubeUtils.cs`
- **Source**: `src/utils/youtubeUtils.js`
- **Dependencies**: None
- **Complexity**: Low (direct port)
- **Time**: ~45 min

**Agent Instructions:**
```
Convert these JavaScript utility files to C# static classes.
- Maintain exact same function signatures
- Use C# naming conventions (PascalCase)
- Keep logic identical
```

---

### **Phase 2: State Management Stores** (Group by Dependency)
**⚠️ Must refactor stores together - they share patterns**

#### 2.1 Core Stores (Can do individually, but similar patterns)
- `PlaylistStore.cs` ← `src/store/playlistStore.js`
- `FolderStore.cs` ← `src/store/folderStore.js`
- `NavigationStore.cs` ← `src/store/navigationStore.js`
- `LayoutStore.cs` ← `src/store/layoutStore.js`

**Pattern**: Zustand → C# class with `INotifyPropertyChanged`

#### 2.2 Persisted Stores (Must understand localStorage pattern)
- `TabStore.cs` ← `src/store/tabStore.js` (localStorage)
- `TabPresetStore.cs` ← `src/store/tabPresetStore.js` (localStorage)
- `ConfigStore.cs` ← `src/store/configStore.js` (localStorage)

**Pattern**: localStorage → C# Settings/Registry/JSON file

**Agent Instructions:**
```
Convert Zustand stores to C# services:
1. Create class implementing INotifyPropertyChanged
2. Convert state properties to C# properties
3. Convert actions to methods
4. Convert localStorage to C# settings persistence
5. Use dependency injection pattern
```

**Recommendation**: Refactor all stores in one session to establish consistent patterns.

---

### **Phase 3: Database & API Layer** (Can do in parallel)
**✅ Independent from UI, but needed by components**

#### 3.1 Database Schema
- Create SQLite tables (reference `atlas/database-schema.md`)
- Set up repositories

#### 3.2 API Service Layer
- `PlaylistApiService.cs` ← `src/api/playlistApi.js`
- Convert Tauri `invoke()` calls to C# service methods
- Connect to database repositories

**Agent Instructions:**
```
1. Create service interface (IPlaylistApiService)
2. Implement methods matching playlistApi.js functions
3. Replace invoke() calls with direct database calls
4. Maintain same method signatures (camelCase → PascalCase)
```

---

### **Phase 4: Simple UI Components** (Can do individually)
**✅ Independent components - can refactor one at a time**

#### 4.1 Loading States
- `PlaylistCardSkeleton.xaml.cs` ← `src/components/skeletons/PlaylistCardSkeleton.jsx`
- **Dependencies**: None (pure UI)
- **Complexity**: Low

#### 4.2 Simple Components
- `PageBanner.xaml.cs` ← `src/components/PageBanner.jsx`
  - **Dependencies**: `ConfigStore`, `FolderColors`
- `UnifiedBannerBackground.xaml.cs` ← `src/components/UnifiedBannerBackground.jsx`
  - **Dependencies**: `ConfigStore`
- `NewCardMenu.xaml.cs` ← `src/components/NewCardMenu.jsx`
  - **Dependencies**: `LayoutStore`

**Agent Instructions:**
```
For each component:
1. Read original JSX file
2. Convert JSX to XAML (or C# markup)
3. Convert React hooks to C# properties/events
4. Connect to stores via dependency injection
5. Maintain exact same visual appearance
```

---

### **Phase 5: Tab System Components** (Refactor together)
**⚠️ Tightly coupled - refactor together**

#### 5.1 Tab Components (Must do together)
- `TabBar.xaml.cs` ← `src/components/TabBar.jsx`
- `TabPresetsDropdown.xaml.cs` ← `src/components/TabPresetsDropdown.jsx`
- `AddPlaylistToTabModal.xaml.cs` ← `src/components/AddPlaylistToTabModal.jsx`

**Why together**: TabBar uses TabPresetsDropdown, both use TabStore/TabPresetStore

**Agent Instructions:**
```
Refactor these 3 components in one session:
1. Start with TabStore/TabPresetStore (Phase 2)
2. Then TabPresetsDropdown (simpler)
3. Then AddPlaylistToTabModal (uses TabStore)
4. Finally TabBar (uses both)
```

---

### **Phase 6: Modal Components** (Can do individually)
**✅ Independent modals - can refactor one at a time**

- `PlaylistUploader.xaml.cs` ← `src/components/PlaylistUploader.jsx`
- `BulkPlaylistImporter.xaml.cs` ← `src/components/BulkPlaylistImporter.jsx`
- `LocalVideoUploader.xaml.cs` ← `src/components/LocalVideoUploader.jsx`

**Dependencies**: `PlaylistApiService`, stores

**Agent Instructions:**
```
Each modal is independent:
1. Convert JSX to XAML modal
2. Connect to PlaylistApiService
3. Handle async operations with C# async/await
4. Maintain same user flow
```

---

### **Phase 7: Main Component** (Do Last)
**⚠️ Depends on everything - refactor last**

- `PlaylistsPage.xaml.cs` ← `src/components/PlaylistsPage.jsx`

**Dependencies**: ALL of the above

**Agent Instructions:**
```
This is the integration point:
1. Ensure all dependencies are complete
2. Convert complex React component to C# page
3. Wire up all child components
4. Connect to all stores
5. Test full functionality
```

---

## 🎓 Agent Onboarding Instructions

### Step 1: Read Context Files
```
1. Read: atlas/README.md (project overview)
2. Read: atlas/playlist&tab.md (feature documentation)
3. Read: atlas/database-schema.md (data structure)
4. Read: atlas/api-bridge.md (API patterns)
5. Read: REFACTOR_PLAYLISTS_PAGE_FILES.md (file list)
```

### Step 2: Understand Patterns
```
1. Study original React component structure
2. Understand Zustand store patterns
3. Understand Tauri API call patterns
4. Review C# conversion examples (if any)
```

### Step 3: Start with Phase 0-1
```
1. Set up project structure
2. Convert utilities first (easiest, no dependencies)
3. Establish conversion patterns
4. Test utilities work correctly
```

### Step 4: Follow Phased Approach
```
Work through phases in order:
- Phase 0: Setup
- Phase 1: Utilities
- Phase 2: Stores (all together)
- Phase 3: Database/API
- Phase 4: Simple components (one at a time)
- Phase 5: Tab system (together)
- Phase 6: Modals (one at a time)
- Phase 7: Main component (last)
```

---

## ✅ What Can Be Done Individually

**Safe to refactor one at a time:**
- ✅ Utilities (FolderColors, YouTubeUtils)
- ✅ Simple UI components (Skeleton, PageBanner, UnifiedBannerBackground)
- ✅ Modal components (PlaylistUploader, BulkImporter, LocalVideoUploader)
- ✅ Database schema setup
- ✅ API service methods (one method at a time)

**Must refactor together:**
- ⚠️ All stores (establish consistent patterns)
- ⚠️ Tab system (TabBar + TabPresetsDropdown + AddPlaylistToTabModal)
- ⚠️ Main PlaylistsPage (depends on everything)

---

## 🔧 Conversion Patterns Reference

### React → C# Patterns

#### State Management
```javascript
// Zustand
const useStore = create((set) => ({
  value: 0,
  setValue: (v) => set({ value: v })
}));
```

```csharp
// C# Service
public class Store : INotifyPropertyChanged
{
    private int _value;
    public int Value
    {
        get => _value;
        set { _value = value; OnPropertyChanged(); }
    }
    
    public void SetValue(int v) => Value = v;
}
```

#### Component Props
```javascript
// React
const Component = ({ title, onClose }) => { ... }
```

```csharp
// C# (WPF)
public partial class Component : UserControl
{
    public string Title { get; set; }
    public event EventHandler Close;
}
```

#### API Calls
```javascript
// Tauri
const result = await invoke('get_all_playlists');
```

```csharp
// C# Service
public async Task<List<Playlist>> GetAllPlaylistsAsync()
{
    return await _repository.GetAllPlaylistsAsync();
}
```

---

## 📝 Testing Strategy

### After Each Phase:
1. **Unit tests** for utilities
2. **Integration tests** for stores
3. **UI tests** for components (manual or automated)

### Final Integration:
1. Test full PlaylistsPage flow
2. Test all modals
3. Test tab system
4. Test folder operations
5. Test playlist CRUD

---

## 🚀 Quick Start for Agent

1. **Read this document** (you're here!)
2. **Read**: `atlas/README.md` for project context
3. **Read**: `atlas/playlist&tab.md` for feature details
4. **Start with**: Phase 0 (setup) → Phase 1 (utilities)
5. **Ask questions** if patterns are unclear
6. **Build incrementally** - test after each phase

---

## 💡 Key Principles

1. **Maintain exact functionality** - UI should behave identically
2. **Preserve data structures** - Models should match database schema
3. **Follow C# conventions** - PascalCase, async/await, INotifyPropertyChanged
4. **Test incrementally** - Don't wait until the end
5. **Reference original files** - Keep React files for comparison
6. **Document differences** - Note any C#-specific changes

---

## ❓ Questions to Answer Before Starting

- [ ] Which UI framework? (WPF/MAUI/Avalonia)
- [ ] Which state management pattern? (MVVM/DI/Other)
- [ ] Which persistence mechanism? (Settings/Registry/JSON)
- [ ] Which database library? (System.Data.SQLite/Microsoft.Data.Sqlite)
- [ ] Which async pattern? (async/await/Task)

---

## 📊 Progress Tracking

Use this checklist:

- [ ] Phase 0: Foundation Setup
- [ ] Phase 1: Utilities (2 files)
- [ ] Phase 2: Stores (7 files)
- [ ] Phase 3: Database & API
- [ ] Phase 4: Simple Components (3 files)
- [ ] Phase 5: Tab System (3 files)
- [ ] Phase 6: Modals (3 files)
- [ ] Phase 7: Main Component (1 file)

**Total: ~20 files to convert**

---

## 🎯 Success Criteria

The refactored C# PlaylistsPage should:
- ✅ Display playlists in a grid (same layout)
- ✅ Support tab filtering
- ✅ Support folder expansion/sticky folders
- ✅ Open modals correctly
- ✅ Connect to database
- ✅ Maintain all functionality from React version
