import React from 'react';
import { useNavigationStore } from '../store/navigationStore';
import { useLayoutStore } from '../store/layoutStore';
import { usePlaylistStore } from '../store/playlistStore';
import FolderSelector from './FolderSelector';
import { ChevronLeft } from 'lucide-react';

const TopNavigation = () => {
  const { currentPage, setCurrentPage, history, goBack } = useNavigationStore();
  const { viewMode, setViewMode, inspectMode } = useLayoutStore();
  const { previewPlaylistId, clearPreview } = usePlaylistStore();

  // Helper to get inspect label
  const getInspectTitle = (label) => inspectMode ? label : undefined;

  const tabs = [
    { id: 'playlists', label: 'Playlists' },
    { id: 'videos', label: 'Videos' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleTabClick = (tabId) => {
    setCurrentPage(tabId);
    // Auto-switch to half mode when clicking tabs if in full mode
    const isNavigationTab = ['playlists', 'videos', 'history', 'settings'].includes(tabId);
    if (isNavigationTab && viewMode === 'full') {
      setViewMode('half');
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Tabs row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${currentPage === tab.id
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              title={getInspectTitle(`${tab.label} tab`)}
            >
              {tab.label}
            </button>
          ))}
        </div>



        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Back Button */}
          {(history.length > 0 || previewPlaylistId) && (
            <button
              onClick={() => {
                if (previewPlaylistId) {
                  clearPreview();
                }
                if (history.length > 0) {
                  goBack();
                } else if (previewPlaylistId) {
                  // Fallback if previewing but no history (e.g. direct load)
                  setCurrentPage('playlists');
                }
              }}
              className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              title={getInspectTitle('Go Back') || 'Go Back'}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Close Side Menu Button */}
          <button
            onClick={() => setViewMode('full')}
            className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title={getInspectTitle('Close menu (Full screen)') || 'Close menu (Full screen)'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Folder selector row - only show on videos page */}
      {
        currentPage === 'videos' && (
          <div className="border-t border-slate-700 pt-2">
            <FolderSelector />
          </div>
        )
      }
    </div >
  );
};

export default TopNavigation;

