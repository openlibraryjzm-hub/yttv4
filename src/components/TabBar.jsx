import React, { useState } from 'react';
import { useTabStore } from '../store/tabStore';
import { useTabPresetStore } from '../store/tabPresetStore';
import { useLayoutStore } from '../store/layoutStore';
import AddPlaylistToTabModal from './AddPlaylistToTabModal';
import TabPresetsDropdown from './TabPresetsDropdown';

const TabBar = ({ onAddPlaylistToTab }) => {
  const { tabs, activeTabId, setActiveTab, createTab, deleteTab, renameTab } = useTabStore();
  const { inspectMode } = useLayoutStore();

  // Helper to get inspect label
  const getInspectTitle = (label) => inspectMode ? label : undefined;
  const [showCreateTab, setShowCreateTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [editingTabId, setEditingTabId] = useState(null);
  const [editTabName, setEditTabName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTabId, setAddModalTabId] = useState(null);

  const handleCreateTab = () => {
    if (newTabName.trim()) {
      createTab(newTabName.trim());
      setNewTabName('');
      setShowCreateTab(false);
    }
  };

  const handleStartEdit = (tab) => {
    if (tab.id === 'all') return; // Can't edit "All" tab
    setEditingTabId(tab.id);
    setEditTabName(tab.name);
  };

  const handleSaveEdit = (tabId) => {
    if (editTabName.trim()) {
      renameTab(tabId, editTabName.trim());
      setEditingTabId(null);
      setEditTabName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditTabName('');
  };

  const handleOpenAddModal = (tabId, e) => {
    e.stopPropagation();
    setAddModalTabId(tabId);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddModalTabId(null);
  };

  const handleAddPlaylist = (tabId, playlistId) => {
    if (onAddPlaylistToTab) {
      onAddPlaylistToTab(tabId, playlistId);
    }
  };

  const currentTab = tabs.find(t => t.id === addModalTabId);
  const { activePresetId, presets } = useTabPresetStore();
  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

  // Filter tabs based on active preset
  // "All" preset (empty tabIds) shows all tabs, custom presets show only selected tabs
  const visibleTabs = activePresetId === 'all' || !activePreset || activePreset.tabIds.length === 0
    ? tabs
    : tabs.filter(tab => tab.id === 'all' || activePreset.tabIds.includes(tab.id));

  return (
    <>
      {showAddModal && currentTab && (
        <AddPlaylistToTabModal
          tabId={addModalTabId}
          tabName={currentTab.name}
          onClose={handleCloseAddModal}
          onAdd={handleAddPlaylist}
        />
      )}
      <div className="flex items-center gap-2 w-full">
        {/* Tab Presets Dropdown - Fixed on left, outside scroll container */}
        <div className="flex-shrink-0 relative z-20">
          <TabPresetsDropdown />
        </div>

        {/* Scrollable Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pb-1 no-scrollbar">

          {/* Visible Tabs */}
          {visibleTabs.map((tab) => (
            <div key={tab.id} className="flex items-center gap-1 flex-shrink-0">
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editTabName}
                  onChange={(e) => setEditTabName(e.target.value)}
                  onBlur={() => handleSaveEdit(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(tab.id);
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                  className="px-2 py-1 text-sm bg-slate-700 text-white rounded border border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  style={{ minWidth: '60px', width: 'auto' }}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-1 group">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTabId === tab.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    onDoubleClick={() => handleStartEdit(tab)}
                    title={getInspectTitle(`Tab: ${tab.name}`) || (tab.id !== 'all' ? 'Double-click to rename' : '')}
                  >
                    <span>{tab.name}</span>
                    {tab.id !== 'all' && (
                      <span className="text-xs opacity-70">({tab.playlistIds.length})</span>
                    )}
                  </button>
                  {tab.id !== 'all' && (
                    <>
                      <button
                        onClick={(e) => handleOpenAddModal(tab.id, e)}
                        className="p-1 rounded hover:bg-slate-600 transition-colors"
                        title={getInspectTitle('Add playlists to tab') || 'Add playlists to tab'}
                        style={{
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTab(tab.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-600 transition-opacity"
                        title={getInspectTitle('Delete tab') || 'Delete tab'}
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {showCreateTab ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onBlur={() => {
                  if (newTabName.trim()) {
                    handleCreateTab();
                  } else {
                    setShowCreateTab(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTab();
                  } else if (e.key === 'Escape') {
                    setShowCreateTab(false);
                    setNewTabName('');
                  }
                }}
                placeholder="Tab name"
                className="px-2 py-1.5 text-sm bg-slate-700 text-white rounded border border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                style={{ minWidth: '100px' }}
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setShowCreateTab(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors flex-shrink-0"
              title="Create new tab"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TabBar;

