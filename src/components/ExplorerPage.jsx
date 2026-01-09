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
    const [activeTab, setActiveTab] = useState('presets');
    const [playlistThumbnails, setPlaylistThumbnails] = useState({});
    const [expandedItems, setExpandedItems] = useState(new Set()); // expansion state
    const [playlistFolders, setPlaylistFolders] = useState({}); // Cache for playlist folders
    const [activeFilters, setActiveFilters] = useState([]); // Array of { id, type, name }
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
        const exists = activeFilters.find(f => f.id === id);

        if (exists) {
            setActiveFilters(prev => prev.filter(f => f.id !== id));
        } else {
            setActiveFilters(prev => [...prev, { id, type, name }]);
        }
    };

    const clearFilters = () => setActiveFilters([]);

    // Filter Logic
    const getFilteredItems = (items, targetType) => {
        if (activeFilters.length === 0) return items;

        // Group active filters by type
        const presetFilters = activeFilters.filter(f => f.type === 'preset');
        const tabFilters = activeFilters.filter(f => f.type === 'tab');
        const playlistFilters = activeFilters.filter(f => f.type === 'playlist');

        let filteredItems = items;

        // 1. Filter Tabs based on Preset Filters
        if (targetType === 'tab' && presetFilters.length > 0) {
            const allowedTabIds = new Set();
            presetFilters.forEach(pf => {
                const preset = presets.find(p => p.id === pf.id);
                if (preset) preset.tabIds.forEach(tid => allowedTabIds.add(tid));
            });
            filteredItems = filteredItems.filter(item => allowedTabIds.has(item.id));
        }

        // 2. Filter Playlists based on Tab Filters AND Preset Filters
        if (targetType === 'playlist') {
            const allowedPlaylistIds = new Set();
            let hasUpstreamFilters = false;

            if (presetFilters.length > 0) {
                hasUpstreamFilters = true;
                presetFilters.forEach(pf => {
                    const preset = presets.find(p => p.id === pf.id);
                    if (preset) {
                        const tabsInPreset = tabs.filter(t => preset.tabIds.includes(t.id));
                        tabsInPreset.forEach(t => t.playlistIds.forEach(pid => allowedPlaylistIds.add(pid)));
                    }
                });
            }

            if (tabFilters.length > 0) {
                hasUpstreamFilters = true;
                tabFilters.forEach(tf => {
                    const tab = tabs.find(t => t.id === tf.id);
                    if (tab) tab.playlistIds.forEach(pid => allowedPlaylistIds.add(pid));
                });
            }

            if (hasUpstreamFilters) {
                filteredItems = filteredItems.filter(item => allowedPlaylistIds.has(item.id));
            }
        }

        // 3. Filter Folders based on Playlist Filters (and upstream Tab/Preset)
        if (targetType === 'folder') {
            const allowedPlaylistIds = new Set();
            let hasUpstreamFilters = false;

            // Preset -> Tabs -> Playlists
            if (presetFilters.length > 0) {
                hasUpstreamFilters = true;
                presetFilters.forEach(pf => {
                    const preset = presets.find(p => p.id === pf.id);
                    if (preset) {
                        const tabsInPreset = tabs.filter(t => preset.tabIds.includes(t.id));
                        tabsInPreset.forEach(t => t.playlistIds.forEach(pid => allowedPlaylistIds.add(pid)));
                    }
                });
            }

            // Tabs -> Playlists
            if (tabFilters.length > 0) {
                hasUpstreamFilters = true;
                tabFilters.forEach(tf => {
                    const tab = tabs.find(t => t.id === tf.id);
                    if (tab) tab.playlistIds.forEach(pid => allowedPlaylistIds.add(pid));
                });
            }

            // Playlist Filters (Direct)
            if (playlistFilters.length > 0) {
                hasUpstreamFilters = true;
                playlistFilters.forEach(pf => allowedPlaylistIds.add(pf.id));
            }

            if (activeFilters.length > 0) {
                // Union logic for checkboxes: 
                // If I have Preste A (implies Playlist P1) AND Playlist P2 selected -> Show P1 and P2 folders.
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

    const renderContent = () => {
        switch (activeTab) {
            case 'presets':
                return <div className="flex flex-col gap-3">{presets.map(preset =>
                    renderCard(
                        preset.id,
                        preset.name,
                        `${preset.id === 'all' ? tabs.length : preset.tabIds.length} tabs`,
                        <Layers />,
                        '#8b5cf6',
                        null,
                        'preset'
                    )
                )}</div>;
            case 'tabs':
                const visibleTabs = getFilteredItems(tabs, 'tab');
                return <div className="flex flex-col gap-3">
                    {visibleTabs.length === 0 && <div className="text-slate-400 italic text-center py-4">No tabs match the current filter.</div>}
                    {visibleTabs.map(tab =>
                        renderCard(
                            tab.id,
                            tab.name,
                            `${tab.id === 'all' ? allPlaylists.length : tab.playlistIds.length} playlists`,
                            <Layout />,
                            '#3b82f6',
                            null,
                            'tab'
                        )
                    )}
                </div>;
            case 'playlists':
                const visiblePlaylists = getFilteredItems(allPlaylists, 'playlist');
                return <div className="flex flex-col gap-3">
                    {visiblePlaylists.length === 0 && <div className="text-slate-400 italic text-center py-4">No playlists match the current filter.</div>}
                    {visiblePlaylists.map(playlist => renderCard(playlist.id, playlist.name, 'Playlist', <FolderOpen />, '#10b981', playlistThumbnails[playlist.id], 'playlist'))}
                </div>;
            case 'folders':
                const visibleFolders = getFilteredItems(allFolders, 'folder');
                return <div className="flex flex-col gap-3">
                    {visibleFolders.length === 0 && <div className="text-slate-400 italic text-center py-4">No folders match the current filter.</div>}
                    {visibleFolders.map((folder, idx) => {
                        const fColor = getFolderColorById(folder.folder_color);
                        const thumb = folder.first_video ? getThumbnailUrl(folder.first_video.video_id, 'medium') : null;
                        return renderCard(folder.uniqueId || `${folder.playlist_id}-${folder.folder_color}-${idx}`, `${fColor.name} Folder (${folder.playlistName})`, `${folder.video_count || 'Some'} videos`, <Folder />, fColor.hex, thumb, 'folder');
                    })}
                </div>;
            default: return null;
        }
    };

    const navTabs = [
        { id: 'presets', label: 'Preset' },
        { id: 'tabs', label: 'Tab' },
        { id: 'playlists', label: 'Playlist' },
        { id: 'folders', label: 'Colored Folder' },
    ];

    return (
        <div className="w-full h-full overflow-y-auto p-6 bg-transparent">
            <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white mb-2">Explorer</h2>
                        {activeFilters.length > 0 && (
                            <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-right-4">
                                <span className="text-sky-400 text-sm font-medium">Filters: <span className="text-white">{activeFilters.length} active</span></span>
                                <button onClick={clearFilters} className="text-sky-400 hover:text-white transition-colors" title="Clear all filters"><X size={16} /></button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-4 mb-2 overflow-x-auto">
                        {navTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ExplorerPage;
