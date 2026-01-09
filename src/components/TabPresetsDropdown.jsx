import React, { useState, useRef, useEffect } from 'react';
import { useTabPresetStore } from '../store/tabPresetStore';
import { useTabStore } from '../store/tabStore';

const TabPresetsDropdown = () => {
  const { presets, activePresetId, setActivePreset, createPreset, deletePreset, updatePreset } = useTabPresetStore();
  const { tabs } = useTabStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedTabIds, setSelectedTabIds] = useState(new Set());
  const [editingPresetId, setEditingPresetId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];

  const handleCreatePreset = () => {
    if (newPresetName.trim() && selectedTabIds.size > 0) {
      createPreset(newPresetName.trim(), Array.from(selectedTabIds));
      setNewPresetName('');
      setSelectedTabIds(new Set());
      setShowCreateModal(false);
    }
  };

  const handleStartCreate = () => {
    setSelectedTabIds(new Set());
    setNewPresetName('');
    setShowCreateModal(true);
  };

  const handleToggleTab = (tabId) => {
    setSelectedTabIds(prev => {
      const updated = new Set(prev);
      if (updated.has(tabId)) {
        updated.delete(tabId);
      } else {
        updated.add(tabId);
      }
      return updated;
    });
  };

  const handleEditPreset = (preset) => {
    if (preset.id === 'all') return;
    setEditingPresetId(preset.id);
    setSelectedTabIds(new Set(preset.tabIds));
    setNewPresetName(preset.name);
    setShowCreateModal(true);
  };

  const handleSaveEdit = () => {
    if (newPresetName.trim() && editingPresetId) {
      updatePreset(editingPresetId, newPresetName.trim(), Array.from(selectedTabIds));
      setEditingPresetId(null);
      setNewPresetName('');
      setSelectedTabIds(new Set());
      setShowCreateModal(false);
    }
  };

  const handleDeletePreset = (presetId, e) => {
    e.stopPropagation();
    if (presetId === 'all') return;
    if (window.confirm('Are you sure you want to delete this preset?')) {
      deletePreset(presetId);
    }
  };

  return (
    <>
      <div ref={dropdownRef} className="relative flex-shrink-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activePresetId === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Tab Presets"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>{activePreset.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Preset List */}
            <div className="max-h-64 overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-slate-700 cursor-pointer ${
                    activePresetId === preset.id ? 'bg-sky-600/20' : ''
                  }`}
                  onClick={() => {
                    setActivePreset(preset.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-white text-sm truncate">{preset.name}</span>
                    {preset.id === 'all' ? (
                      <span className="text-xs text-slate-400">({tabs.length} tabs)</span>
                    ) : (
                      <span className="text-xs text-slate-400">({preset.tabIds.length} tabs)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 group">
                    {preset.id !== 'all' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPreset(preset);
                          }}
                          className="p-1 rounded hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit preset"
                        >
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="p-1 rounded hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete preset"
                        >
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create Preset Button */}
            <div className="border-t border-slate-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCreate();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Preset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Preset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingPresetId ? 'Edit Preset' : 'Create Preset'}
            </h3>

            {/* Preset Name Input */}
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name"
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 mb-4"
              autoFocus
            />

            {/* Tab Selection */}
            <div className="flex-1 overflow-y-auto mb-4">
              <p className="text-slate-400 text-sm mb-2">Select tabs to include:</p>
              <div className="space-y-2">
                {tabs.filter(tab => tab.id !== 'all').map((tab) => {
                  const isSelected = selectedTabIds.has(tab.id);
                  return (
                    <div
                      key={tab.id}
                      onClick={() => handleToggleTab(tab.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-600/20 border border-sky-500'
                          : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-sky-500 border-sky-500'
                          : 'border-slate-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white text-sm">{tab.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPresetId(null);
                  setNewPresetName('');
                  setSelectedTabIds(new Set());
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPresetId ? handleSaveEdit : handleCreatePreset}
                disabled={!newPresetName.trim() || selectedTabIds.size === 0}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingPresetId ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TabPresetsDropdown;

