import React, { useState, useEffect } from 'react';
import { useTabPresetStore } from '../store/tabPresetStore';
import { useTabStore } from '../store/tabStore';
import { usePlaylistStore } from '../store/playlistStore';
import { FOLDER_COLORS, getFolderColorById } from '../utils/folderColors';
import { useLayoutStore } from '../store/layoutStore';
import { getPlaylistItems, getFoldersForPlaylist } from '../api/playlistApi';
import { getThumbnailUrl } from '../utils/youtubeUtils';
import Card from './Card';
import { Layers, Layout, Folder, FolderOpen, ChevronDown, ChevronRight, CheckSquare, Square, X, Filter } from 'lucide-react';

const ExplorerPage = ({ onVideoSelect }) => {
    const [activeTab, setActiveTab] = useState('playlists');
    const [playlistThumbnails, setPlaylistThumbnails] = useState({});
    const [expandedItems, setExpandedItems] = useState(new Set()); // expansion state
    const [playlistFolders, setPlaylistFolders] = useState({}); // Cache for playlist folders
    const [activeFilters, setActiveFilters] = useState([{ id: 'all', type: 'preset', name: 'All' }]); // Array of { id, type, name }
    const [allFolders, setAllFolders] = useState([]); // Flat list of all folders

    const { presets } = useTabPresetStore();
    const { tabs } = useTabStore();
    const { allPlaylists } = usePlaylistStore();
    const { inspectMode } = useLayoutStore();

    // Helper to get inspect label
    const getInspectTitle = (label) => inspectMode ? label : undefined;

    // Fetch playlist thumbnails (first video)
    useEffect(() => {
        if (allPlaylists.length > 0) {
            const loadThumbnails = async () => {
                const thumbs = {};
                // Process in parallel
                const promises = allPlaylists.map(async (playlist) => {
                    if (playlistThumbnails[playlist.id]) return;
                    try {
                        const items = await getPlaylistItems(playlist.id);
                        if (items && items.length > 0) {
                            thumbs[playlist.id] = getThumbnailUrl(items[0].video_id, 'medium');
                        }
                    } catch (err) {
                        console.error(`Failed to load items for playlist ${playlist.id}`, err);
                    }
                });

                await Promise.all(promises);
                if (Object.keys(thumbs).length > 0) {
                    setPlaylistThumbnails(prev => ({ ...prev, ...thumbs }));
                }
            };
            loadThumbnails();
        }
    }, [allPlaylists, playlistThumbnails]);

    // Load all folders for the Folders tab
    useEffect(() => {
        const loadAllFolders = async () => {
            if (allPlaylists.length === 0) return;

            const folders = [];
            // We can't easily parallelize this too aggressively or we might hit SQLite locks if not handled well, 
            // but reading is usually fine.
            await Promise.all(allPlaylists.map(async (playlist) => {
                try {
                    const pFolders = await getFoldersForPlaylist(playlist.id);
                    if (pFolders && Array.isArray(pFolders)) {
                        pFolders.forEach(f => {
                            folders.push({
                                ...f,
                                playlistName: playlist.name,
                                uniqueId: `${playlist.id}-${f.folder_color}`
                            });
                        });
                    }
                } catch (e) {
                    // console.warn(`Failed to load folders for playlist ${playlist.id}`, e);
                }
            }));
            setAllFolders(folders);
        };
        loadAllFolders();
    }, [allPlaylists, activeTab]); // Reload when tab changes in case of updates, or strictly on playlists change

    // Load folders for expanded playlists (Cache logic)
    const loadFoldersForPlaylist = async (playlistId) => {
        if (playlistFolders[playlistId]) return;
        try {
            const folders = await getFoldersForPlaylist(playlistId);
            setPlaylistFolders(prev => ({
                ...prev,
                [playlistId]: folders || []
            }));
        } catch (error) {
            console.error(`Failed to load folders for playlist ${playlistId}:`, error);
        }
    };

    const toggleExpansion = async (id, type) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
            if (type === 'playlist') {
                await loadFoldersForPlaylist(id);
            }
        }
        setExpandedItems(newExpanded);
    };

    const isExpanded = (id) => expandedItems.has(id);

    const toggleFilter = (id, type, name, e) => {
        e.stopPropagation();

        if (type === 'preset') {
            // Single select logic for Presets
            const isActive = activeFilters.some(f => f.id === id && f.type === 'preset');

            // Prevent deselecting the current preset - one must always be active
            if (isActive) {
                return;
            }

            // Set new preset, CLEAR existing tab filters to avoid invalid states
            setActiveFilters([{ id, type, name }]);
        } else {
            // Multi-select logic for Tabs (or other types)
            const exists = activeFilters.find(f => f.id === id && f.type === type);
            if (exists) {
                setActiveFilters(prev => prev.filter(f => f.id !== id));
            } else {
                setActiveFilters(prev => [...prev, { id, type, name }]);
            }
        }
    };

    const clearFilters = () => setActiveFilters([{ id: 'all', type: 'preset', name: 'All' }]);

    // Filter Logic
    const getFilteredItems = (items, targetType) => {
        if (activeFilters.length === 0) return items;

        const presetFilters = activeFilters.filter(f => f.type === 'preset');
        const tabFilters = activeFilters.filter(f => f.type === 'tab');
        const playlistFilters = activeFilters.filter(f => f.type === 'playlist');

        let filteredItems = items;

        // 1. Filter Tabs view
        if (targetType === 'tab' && presetFilters.length > 0) {
            const hasAllPreset = presetFilters.some(pf => pf.id === 'all');

            if (!hasAllPreset) {
                const allowedTabIds = new Set();
                presetFilters.forEach(pf => {
                    const preset = presets.find(p => p.id === pf.id);
                    if (preset) preset.tabIds.forEach(tid => allowedTabIds.add(tid));
                });
                // Always allow 'all' tab to be visible if we want, or strictly filter?
                // Usually we filter content. If I select "Preset A", I want to see tabs in Preset A.
                filteredItems = filteredItems.filter(item => allowedTabIds.has(item.id));
            }
            // If hasAllPreset is true, we simply don't filter (show all tabs), which matches 'items'
        }

        // 2. Filter Playlists view
        if (targetType === 'playlist') {
            const activePresetFilter = activeFilters.find(f => f.type === 'preset');
            const activeTabFilters = activeFilters.filter(f => f.type === 'tab');
            const activePlaylistFilters = activeFilters.filter(f => f.type === 'playlist'); // Safety/Legacy

            // 1. Should we show ALL playlists?
            // Only if "All" preset is active AND no specific tabs/playlists are selected to drill down.
            if (activePresetFilter && activePresetFilter.id === 'all' && activeTabFilters.length === 0 && activePlaylistFilters.length === 0) {
                return items; // Show everything
            }

            const allowedPlaylistIds = new Set();
            let hasRestriction = false;

            // 2. Tab Filters (Highest Priority for Drill-Down)
            // If user explicitly selected tabs, we show playlists from those tabs.
            if (activeTabFilters.length > 0) {
                hasRestriction = true;
                activeTabFilters.forEach(tf => {
                    const tab = tabs.find(t => t.id === tf.id);
                    if (tab) tab.playlistIds.forEach(pid => allowedPlaylistIds.add(pid));
                });
            } else if (activePresetFilter) {
                // 3. Preset Filter (Context)
                // If NO tabs selected, we show all playlists in the current preset.
                hasRestriction = true;
                if (activePresetFilter.id === 'all') {
                    // "All" Preset with no tabs selected -> actually caught by step 1, but safe fallback
                    return items;
                } else {
                    const preset = presets.find(p => p.id === activePresetFilter.id);
                    if (preset) {
                        const tabsInPreset = tabs.filter(t => preset.tabIds.includes(t.id));
                        tabsInPreset.forEach(t => t.playlistIds.forEach(pid => allowedPlaylistIds.add(pid)));
                    }
                }
            }

            // Legacy/Safety for Playlist direct filters
            if (activePlaylistFilters.length > 0) {
                hasRestriction = true;
                activePlaylistFilters.forEach(pf => allowedPlaylistIds.add(pf.id));
            }

            if (hasRestriction) {
                filteredItems = filteredItems.filter(item => allowedPlaylistIds.has(item.id));
            }
        }

        // 3. Filter Folders view
        if (targetType === 'folder') {
            const activePresetFilter = activeFilters.find(f => f.type === 'preset');
            const activeTabFilters = activeFilters.filter(f => f.type === 'tab');
            const activePlaylistFilters = activeFilters.filter(f => f.type === 'playlist');

            // Priority: Playlist > Tab > Preset
            // We drill down from broadest (Preset) to specific (Tab) to exact (Playlist)

            let allowedPlaylistIds = null; // null implies "allow all" or "not yet set"

            // 1. Check for specific Playlist filters first (Most specific)
            if (activePlaylistFilters.length > 0) {
                const ids = new Set();
                activePlaylistFilters.forEach(pf => ids.add(pf.id));
                allowedPlaylistIds = ids;
            }
            // 2. Fallback to Tab filters if no specific playlist filter
            else if (activeTabFilters.length > 0) {
                const ids = new Set();
                activeTabFilters.forEach(tf => {
                    const tab = tabs.find(t => t.id === tf.id);
                    if (tab) tab.playlistIds.forEach(pid => ids.add(pid));
                });
                allowedPlaylistIds = ids;
            }
            // 3. Fallback to Preset filter
            else if (activePresetFilter) {
                if (activePresetFilter.id === 'all') {
                    // "All" preset -> Allow all (keep allowedPlaylistIds as null)
                } else {
                    const ids = new Set();
                    const preset = presets.find(p => p.id === activePresetFilter.id);
                    if (preset) {
                        const tabsInPreset = tabs.filter(t => preset.tabIds.includes(t.id));
                        tabsInPreset.forEach(t => t.playlistIds.forEach(pid => ids.add(pid)));
                    }
                    allowedPlaylistIds = ids;
                }
            }

            // Apply filter if we have a restriction set
            if (allowedPlaylistIds !== null) {
                filteredItems = filteredItems.filter(folder => allowedPlaylistIds.has(folder.playlist_id));
            }
        }

        return filteredItems;
    };

    // Rendering Helper
    const renderCard = (id, title, subtitle, icon, color = '#3b82f6', imageSrc = null, type, isChild = false) => {
        const expanded = isExpanded(id);
        const canExpand = ['preset', 'tab', 'playlist'].includes(type) && (!isChild || type !== 'folder');
        const canFilter = ['preset', 'tab', 'playlist'].includes(type);
        const isFiltered = activeFilters.some(f => f.id === id);

        return (
            <div key={id} className="flex flex-col w-full animate-in fade-in duration-300">
                <Card
                    className={`flex flex-row gap-5 p-3 rounded-xl transition-all group w-full border border-transparent relative
                        ${isChild ? 'bg-slate-800/20 hover:bg-slate-800/60' : 'bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700/50'}
                        ${isFiltered ? 'border-sky-500/50 bg-slate-800/60' : ''}
                        `}
                    title={getInspectTitle(`Explorer item: ${title}`)}
                    variant="minimal"
                    onClick={(e) => {
                        if (canExpand) {
                            e.stopPropagation();
                            toggleExpansion(id, type);
                        }
                    }}
                >
                    {/* Left: Thumbnail/Icon */}
                    <div
                        className={`${isChild ? 'w-24' : 'w-32'} shrink-0 aspect-square rounded-lg overflow-hidden relative shadow-md flex items-center justify-center transition-all bg-slate-900/50`}
                        style={{ backgroundColor: imageSrc ? '#000' : 'rgba(15, 23, 42, 0.5)' }}
                    >
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div style={{ color: color }}>
                                {React.cloneElement(icon, { size: isChild ? 32 : 48 })}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col justify-center flex-1 min-w-0 py-2">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold mb-1 line-clamp-2 leading-tight transition-colors ${isChild ? 'text-base' : 'text-lg'}`}
                                style={{ color: '#052F4A' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#052F4A'}
                            >
                                {title}
                            </h3>
                            {isFiltered && <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full">Filtered</span>}
                        </div>

                        <div className="flex items-center text-sm text-slate-400 font-medium">
                            {subtitle}
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pr-4">
                        {canFilter && (
                            <button
                                onClick={(e) => toggleFilter(id, type, title, e)}
                                className={`p-2 rounded-lg transition-colors ${isFiltered ? 'text-sky-500' : 'text-slate-500 hover:text-slate-300'}`}
                                title={isFiltered ? "Remove from filter" : "Add to filter"}
                            >
                                {isFiltered ? <CheckSquare size={24} /> : <Square size={24} />}
                            </button>
                        )}

                        {canExpand && (
                            <div className="flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
                                {expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Render Children */}
                {canExpand && renderChildren({ id, ...((type === 'preset' ? presets.find(p => p.id === id) : type === 'tab' ? tabs.find(t => t.id === id) : type === 'playlist' ? allPlaylists.find(p => p.id === id) : {})) }, type)}
            </div>
        );
    };

    const renderChildren = (item, type) => {
        if (!isExpanded(item.id)) return null;
        const childContainerClass = "pl-20 pr-4 py-2 flex flex-col gap-2 border-l-2 border-slate-700/50 ml-12 mb-4";

        switch (type) {
            case 'preset':
                // Special case for 'All' preset to show all tabs
                const isAllPreset = item.id === 'all';
                const childTabs = isAllPreset
                    ? tabs.filter(t => t.id !== 'all') // Show all tabs except the 'All' tab itself to avoid recursion/redundancy in list
                    : item.tabIds.map(tid => tabs.find(t => t.id === tid)).filter(Boolean);

                if (childTabs.length === 0) return <div className={`text-slate-500 text-sm ml-20 italic`}>No tabs found in this preset.</div>;
                return <div className={childContainerClass}>{childTabs.map(tab => renderCard(tab.id, tab.name, `${tab.id === 'all' ? allPlaylists.length : tab.playlistIds.length} playlists`, <Layout size={24} />, '#3b82f6', null, 'tab', true))}</div>;

            case 'tab':
                // Special case for 'All' tab to show all playlists
                const isAllTab = item.id === 'all';
                const childPlaylists = isAllTab
                    ? allPlaylists
                    : item.playlistIds.map(pid => allPlaylists.find(p => p.id === pid)).filter(Boolean);

                if (childPlaylists.length === 0) return <div className={`text-slate-500 text-sm ml-20 italic`}>No playlists found in this tab.</div>;
                return <div className={childContainerClass}>
                    {childPlaylists.map(playlist => renderCard(playlist.id, playlist.name, 'Playlist', <FolderOpen size={24} />, '#10b981', playlistThumbnails[playlist.id], 'playlist', true))}
                </div>;

            case 'playlist':
                const folders = playlistFolders[item.id] || [];
                if (folders.length === 0) return <div className={`text-slate-500 text-sm ml-20 italic`}>No folders found in this playlist.</div>;
                return <div className={childContainerClass}>
                    {folders.map((folder, idx) => {
                        const fColor = getFolderColorById(folder.folder_color);
                        const key = `${item.id}-${folder.folder_color}-${idx}`;
                        const folderThumb = folder.first_video ? getThumbnailUrl(folder.first_video.video_id, 'medium') : null;
                        return renderCard(key, `${fColor.name} Folder`, `${folder.video_count || 'Some'} videos`, <Folder size={24} />, fColor.hex, folderThumb, 'folder', true);
                    })}
                </div>;
            default: return null;
        }
    };

    // Color palette for presets
    const PRESET_COLORS = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
        'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];

    const getPresetColor = (idx) => PRESET_COLORS[idx % PRESET_COLORS.length];

    const renderTags = () => {
        // Determine visible tabs based on active preset
        const activePresetFilter = activeFilters.find(f => f.type === 'preset');
        let visibleTabs = tabs;

        if (activePresetFilter && activePresetFilter.id !== 'all') {
            const preset = presets.find(p => p.id === activePresetFilter.id);
            if (preset) {
                visibleTabs = tabs.filter(t => preset.tabIds.includes(t.id));
            }
        }

        return (
            <div className="flex flex-col gap-4 mb-4">
                {/* Preset Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Presets:</span>
                    {presets.map((preset, idx) => {
                        const isActive = activePresetFilter && activePresetFilter.id === preset.id;
                        // Use specific color for preset, dimmer if not active
                        const baseColor = getPresetColor(idx);
                        return (
                            <button
                                key={preset.id}
                                onClick={(e) => toggleFilter(preset.id, 'preset', preset.name, e)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all border-2 
                                    ${isActive
                                        ? `${baseColor} text-white border-white/50 shadow-md transform scale-105`
                                        : `bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200`
                                    }`}
                            >
                                {preset.name}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Tags - Only show tabs relevant to selected preset */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Tabs:</span>
                    {visibleTabs.length > 0 ? visibleTabs.map(tab => {
                        const isActive = activeFilters.some(f => f.id === tab.id && f.type === 'tab');
                        return (
                            <button
                                key={tab.id}
                                onClick={(e) => toggleFilter(tab.id, 'tab', tab.name, e)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all border-2
                                    ${isActive
                                        ? 'bg-slate-100 text-slate-900 border-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    }) : (
                        <span className="text-sm text-slate-500 italic">No tabs in this preset</span>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'playlists':
                const visiblePlaylists = getFilteredItems(allPlaylists, 'playlist');
                return (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {visiblePlaylists.length === 0 && <div className="text-slate-400 italic text-center py-4">No playlists match the current filter.</div>}
                        {visiblePlaylists.map(playlist =>
                            renderCard(
                                playlist.id,
                                playlist.name,
                                'Playlist',
                                <FolderOpen />,
                                '#10b981',
                                playlistThumbnails[playlist.id],
                                'playlist'
                            )
                        )}
                    </div>
                );
            case 'folders':
                const visibleFolders = getFilteredItems(allFolders, 'folder');
                return (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {visibleFolders.length === 0 && <div className="text-slate-400 italic text-center py-4">No folders match the current filter.</div>}
                        {visibleFolders.map((folder, idx) => {
                            const fColor = getFolderColorById(folder.folder_color);
                            const thumb = folder.first_video ? getThumbnailUrl(folder.first_video.video_id, 'medium') : null;
                            return renderCard(
                                folder.uniqueId || `${folder.playlist_id}-${folder.folder_color}-${idx}`,
                                `${fColor.name} Folder (${folder.playlistName})`,
                                `${folder.video_count || 'Some'} videos`,
                                <Folder />,
                                fColor.hex,
                                thumb,
                                'folder'
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    const navTabs = [
        { id: 'playlists', label: 'Playlists' },
        { id: 'folders', label: 'Colored Folders' },
    ];

    return (
        <div className="w-full h-full overflow-y-auto p-6 bg-transparent">
            <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Explorer</h2>
                        {(activeFilters.length > 1 || (activeFilters.length === 1 && activeFilters[0].id !== 'all')) && (
                            <button onClick={clearFilters} className="text-sky-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                                <X size={16} /> Reset Filters
                            </button>
                        )}
                    </div>

                    {/* Horizontal Page Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-0">
                        {navTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-t-lg font-bold text-sm transition-all duration-200 border-b-2 ${activeTab === tab.id
                                    ? 'border-sky-500 text-sky-400 bg-slate-800/50'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Tags Area */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
                        {renderTags()}
                    </div>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default ExplorerPage;
