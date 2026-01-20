# 🗺️ The Refactor Map: From React to WPF

You nailed the concepts. Now let's apply them to **your specific files**.
This doc is your checklist. Print it out (mentally) and check things off.

---

## 🏗️ Phase 1: The Brain (State Conversion)

**"Define all zustand states... find singleton equivalents"**
*Strategy: Create a `Services` folder. maintain the exact same Logic, just in C# syntax.*

| React Store (`src/store/*.js`) | C# Service (`Services/*.cs`) | Status |
|:--- |:--- |:--- |
| `playlistStore.js` | `PlaylistService.cs` | ⬜ |
| `navigationStore.js` | `NavigationService.cs` | ⬜ |
| `layoutStore.js` | `LayoutService.cs` | ⬜ |
| `configStore.js` | `ConfigService.cs` | ⬜ |
| `folderStore.js` | `FolderService.cs` | ⬜ |
| `tabStore.js` | `TabService.cs` | ⬜ |
| `pinStore.js` | `PinService.cs` | ⬜ |

> **Vibe Tip**: In C#, we usually group these into a `ViewModel` for the page, but since your app is so interconnected, keeping them as Singleton Services (like Zustand) is perfectly fine and easier for you.

---

## 🎨 Phase 2: The Face (Component Conversion)

**"Converting .jsx components... into .xaml and .cs"**

### A. The Core Shell
| React Component | WPF Control (`UserControls/`) | Notes |
|:--- |:--- |:--- |
| `App.jsx` | `MainWindow.xaml` | The Grid that holds the 3 Layers (MPV, Web, UI). |
| `TopNavigation.jsx` | `TopNavigation.xaml` | The tab bar. |
| `PlayerController.jsx` | `PlayerController.xaml` | **Big Task**. The bottom bar. |
| `PageBanner.jsx` | `PageBanner.xaml` | The header image + title. |
| `TabBar.jsx` | `TabBar.xaml` | The tab system (if kept separate). |

### B. The Cards (Data Templates)
*In WPF, we often don't make a whole new file for small items. We define a "DataTemplate" (a blueprint).*

| React Component | WPF Equivalent |
|:--- |:--- |
| `VideoCard.jsx` | `<DataTemplate DataType="{x:Type models:Video}">` |
| `PlaylistCard.jsx` | `<DataTemplate DataType="{x:Type models:Playlist}">` |
| `Card.jsx` | `<Style TargetType="Border" x:Key="CardStyle">` |

### C. The Pages (Views)
| React Component | WPF View (`Views/`) |
|:--- |:--- |
| `PlaylistsPage.jsx` | `PlaylistsView.xaml` |
| `VideosPage.jsx` | `VideosView.xaml` |
| `SettingsPage.jsx` | `SettingsView.xaml` |

---

## 💅 Phase 3: The Vibe (Styling)

**"Define all the tailwind... find styles equivalents"**
*We will create a `Themes/` folder in your C# project.*

| Tailwind Class | WPF Resource (`App.xaml` / `Themes/Generic.xaml`) |
|:--- |:--- |
| `bg-slate-900` | `<SolidColorBrush x:Key="BgDark" Color="#0F172A"/>` |
| `text-sky-500` | `<SolidColorBrush x:Key="TextSky" Color="#0EA5E9"/>` |
| `rounded-xl` | `<Style ...><Setter Property="CornerRadius" Value="12"/></Style>` |
| `backdrop-blur` | `<BlurEffect Radius="10"/>` (Use sparingly in WPF, costs GPU) |
| `shadow-lg` | `<DropShadowEffect BlurRadius="20" Opacity="0.5"/>` |

---

## ⚡ Level Up: The Props vs. Events Logic

You had a small mix-up on Point 4, so let's clarify the logic mapping:

**1. Passing Data Down ("Props")**
*   **React**: `<Card title="My Video" />`
*   **WPF**: Binding. `<Card Title="{Binding VideoTitle}" />`

**2. Handling Clicks ("Callbacks")**
*   **React**: `onClick={() => playVideo(id)}`
*   **WPF**: Commands. `Command="{Binding PlayVideoCommand}" CommandParameter="{Binding Id}"`

**3. Lifecycle ("useEffect")**
*   **React**: `useEffect(() => { loadData() }, [])`
*   **WPF**: `Loaded` Event. `<UserControl Loaded="OnLoaded">`
    *   *Or better*: The ViewModel constructor calls `LoadData()`.

---

## 🏁 Your Mission Checklist

1. [ ] **Setup**: Create `src-csharp` folder & .NET 8 WPF Project.
2. [ ] **Install**: `Wpf.Ui` (Nuget) for the "Vibe".
3. [ ] **Data First**: Port `PlaylistStore.js` -> `PlaylistService.cs`.
4. [ ] **Shell**: Create `MainWindow` with the 3 empty layers.
5. [ ] **UI**: Port `TopNavigation` to prove you can do buttons + styling.
6. [ ] **Grid**: Port `PlaylistsPage` to prove you can do a list of cards.

**Ready to start Step 1?**
