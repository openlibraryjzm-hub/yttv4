import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePlaylistStore } from '../store/playlistStore';
import { useFolderStore } from '../store/folderStore';
import { useLayoutStore } from '../store/layoutStore';
import { assignVideoToFolder, unassignVideoFromFolder, getVideoFolderAssignments, getVideosInFolder, removeVideoFromPlaylist, getWatchedVideoIds, getAllVideoProgress } from '../api/playlistApi';
import { FOLDER_COLORS, getFolderColorById } from '../utils/folderColors';
import { extractVideoId } from '../utils/youtubeUtils';
import VideoCard from './VideoCard';
import PlaylistSelectionModal from './PlaylistSelectionModal';
import PlaylistUploader from './PlaylistUploader';
import { addVideoToPlaylist, getPlaylistItems } from '../api/playlistApi';
import { useStickyStore } from '../store/stickyStore';
import StickyVideoCarousel from './StickyVideoCarousel';

const VideosPage = ({ onVideoSelect, onSecondPlayerSelect }) => {
  const {
    currentPlaylistItems,
    currentVideoIndex,
    currentPlaylistId,
    setPlaylistItems,
    previewPlaylistItems,
    previewPlaylistId,
    previewFolderInfo,
    setPreviewPlaylist,
  } = usePlaylistStore();
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const {
    selectedFolder,
    setSelectedFolder,
    setVideoFolders,
    videoFolderAssignments,
    loadVideoFolders,
    quickAssignFolder,
    setQuickAssignFolder,
    bulkTagMode,
    setBulkTagMode,
    bulkTagSelections,
    toggleBulkTagSelection,
    clearBulkTagSelections,
  } = useFolderStore();
  const { setViewMode, inspectMode } = useLayoutStore();

  // Helper to get inspect label
  const getInspectTitle = (label) => inspectMode ? label : undefined;
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [savingBulkTags, setSavingBulkTags] = useState(false);
  const [sortBy, setSortBy] = useState('default'); // 'default', 'progress'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [includeUnwatched, setIncludeUnwatched] = useState(true);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [watchedVideoIds, setWatchedVideoIds] = useState(new Set());
  const [videoProgress, setVideoProgress] = useState(new Map()); // Map<videoId, { percentage: number, hasFullyWatched: boolean }>

  // Move/Copy state
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [selectedVideoForAction, setSelectedVideoForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'move' or 'copy'
  const [showUploader, setShowUploader] = useState(false);

  // Use preview items if available, otherwise use current playlist items
  const activePlaylistItems = previewPlaylistItems || currentPlaylistItems;
  const activePlaylistId = previewPlaylistId || currentPlaylistId;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Ref for scrolling to top on page change
  const scrollContainerRef = useRef(null);

  // Reset page when playlist, folder, or sort filters change
  useEffect(() => {
    setCurrentPage(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activePlaylistId, selectedFolder, sortBy, sortDirection, includeUnwatched, showOnlyCompleted]);

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  useEffect(() => {
    // Sync selected video with current playing video
    if (currentVideoIndex >= 0 && activePlaylistItems.length > 0) {
      setSelectedVideoIndex(currentVideoIndex);
    }
  }, [currentVideoIndex, activePlaylistItems]);

  const { isStickied, toggleSticky, stickiedVideos: allStickiedVideos } = useStickyStore();

  const handleToggleSticky = (playlistId, videoId) => {
    console.log(`[VideosPage] Toggling sticky for playlist ${playlistId}, video ${videoId}, folder ${selectedFolder}`);
    // Pass selectedFolder to toggle function to scope the key
    toggleSticky(playlistId, videoId, selectedFolder);
  };

  // Debug effect
  useEffect(() => {
    console.log('[VideosPage] Active Playlist:', activePlaylistId);
    console.log('[VideosPage] Sticky Data:', allStickiedVideos);
    console.log('[VideosPage] Selected Folder:', selectedFolder);
  }, [activePlaylistId, allStickiedVideos, selectedFolder]);

  // Reset selected folder when playlist changes to prevent showing wrong videos
  useEffect(() => {
    setSelectedFolder(null);
  }, [activePlaylistId, setSelectedFolder]);

  // Clear bulk tag selections when exiting bulk tag mode
  useEffect(() => {
    if (!bulkTagMode) {
      clearBulkTagSelections();
    }
  }, [bulkTagMode, clearBulkTagSelections]);

  // Load video progress data for sorting
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load watched video IDs (>= 85% progress)
        const watchedIds = await getWatchedVideoIds();
        setWatchedVideoIds(new Set(watchedIds));

        // Load all video progress
        const allProgress = await getAllVideoProgress();
        const progressMap = new Map();
        for (const progress of allProgress) {
          progressMap.set(progress.video_id, {
            percentage: progress.progress_percentage,
            hasFullyWatched: progress.has_fully_watched
          });
        }
        setVideoProgress(progressMap);
      } catch (error) {
        console.error('Failed to load video progress:', error);
      }
    };

    loadProgress();

    // Poll for progress updates every 5 seconds to keep UI fresh
    const intervalId = setInterval(loadProgress, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Refresh video progress when current video changes (to update sorting in real-time)
  useEffect(() => {
    const refreshProgress = async () => {
      if (activePlaylistItems.length > 0 && currentVideoIndex < activePlaylistItems.length) {
        try {
          // Refresh watched video IDs
          const watchedIds = await getWatchedVideoIds();
          setWatchedVideoIds(new Set(watchedIds));

          // Refresh all progress data
          const allProgress = await getAllVideoProgress();
          const progressMap = new Map();
          for (const progress of allProgress) {
            progressMap.set(progress.video_id, progress.progress_percentage);
          }
          setVideoProgress(progressMap);
        } catch (error) {
          console.error('Failed to refresh video progress:', error);
        }
      }
    };

    // Debounce the refresh to avoid too many API calls
    const timeoutId = setTimeout(refreshProgress, 2000);
    return () => clearTimeout(timeoutId);
  }, [currentVideoIndex, activePlaylistItems]);

  // Load folder assignments when playlist changes (but don't filter here)
  useEffect(() => {
    const loadAssignments = async () => {
      if (!activePlaylistId || activePlaylistItems.length === 0) {
        loadVideoFolders({});
        return;
      }

      try {
        const assignments = {};
        for (const video of activePlaylistItems) {
          try {
            const folders = await getVideoFolderAssignments(activePlaylistId, video.id);
            // Only include videos that actually have folder assignments
            assignments[video.id] = Array.isArray(folders) && folders.length > 0 ? folders : [];
          } catch (error) {
            console.error(`Failed to load folders for video ${video.id}:`, error);
            assignments[video.id] = [];
          }
        }
        loadVideoFolders(assignments);
      } catch (error) {
        console.error('Failed to load folder assignments:', error);
        loadVideoFolders({});
      }
    };

    loadAssignments();
  }, [activePlaylistId, activePlaylistItems, loadVideoFolders]);

  // Filter videos by selected folder - this is the main filtering logic
  useEffect(() => {
    if (!activePlaylistId || activePlaylistItems.length === 0) {
      setDisplayedVideos([]);
      return;
    }

    const filterVideos = async () => {
      if (selectedFolder === null) {
        // Show all videos when no folder is selected
        setDisplayedVideos(activePlaylistItems);
        return;
      }

      setLoadingFolders(true);
      try {
        if (selectedFolder === 'unsorted') {
          // Filter for videos with no folder assignments
          const unsortedVideos = [];
          for (const video of activePlaylistItems) {
            // Check stored assignments
            const folders = videoFolderAssignments[video.id];

            // If we have loaded assignments and it's empty, or if we haven't loaded, let's check
            // Note: videoFolderAssignments is populated on playlist change, so it should be reliable.
            // However, to be safe, we could check DB but that's slow for "Unsorted" filter.
            // Let's rely on useFolderStore's loaded state which is refreshed on playlist change.
            if (!folders || folders.length === 0) {
              unsortedVideos.push(video);
            }
          }
          console.log(`Unsorted filter: Found ${unsortedVideos.length} videos`);
          setDisplayedVideos(unsortedVideos);
        } else {
          // When a color folder is selected, only show videos explicitly assigned to that folder
          // The database query uses INNER JOIN so it will only return videos with assignments
          const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
          // Ensure we only show videos that are actually in the result (should be empty if no assignments)
          console.log(`Folder ${selectedFolder}: Found ${videos?.length || 0} videos with assignments`);
          setDisplayedVideos(Array.isArray(videos) ? videos : []);
        }
      } catch (error) {
        console.error('Failed to load folder videos:', error);
        // On error, show empty array (folder should be empty)
        setDisplayedVideos([]);
      } finally {
        setLoadingFolders(false);
      }
    };

    filterVideos();
  }, [selectedFolder, activePlaylistId, activePlaylistItems]);

  const handleMenuOptionClick = async (option, video) => {
    console.log('handleMenuOptionClick:', option.action, video.id, 'activePermission:', !!activePlaylistId);
    if (!activePlaylistId) {
      console.warn('Action attempted without activePlaylistId');
      // Temporarily allow for testing if that's the issue, or alert user
      // return; 
    }

    try {
      switch (option.action) {
        case 'delete':
          const confirmed = window.confirm(
            `Are you sure you want to remove "${video.title || 'this video'}" from the playlist?`
          );
          if (!confirmed) return;

          await removeVideoFromPlaylist(activePlaylistId, video.id);

          // Remove from displayed videos
          setDisplayedVideos(prev => prev.filter(v => v.id !== video.id));

          // Remove from active playlist items
          // Use activePlaylistItems instead of currentPlaylistItems as base if possible, 
          // but we need to update the store which expects us to update the specific list.
          // Since we are modifying the *active* playlist, we should update the store for that playlist.

          if (previewPlaylistId) {
            // We are in preview mode
            const updatedItems = previewPlaylistItems.filter(v => v.id !== video.id);
            // We need a clearPreview or setPreviewPlaylist method, but setPreviewPlaylist is safer
            setPreviewPlaylist(updatedItems, previewPlaylistId, previewFolderInfo);
          } else {
            // We are in current playback mode
            const updatedItems = currentPlaylistItems.filter(v => v.id !== video.id);
            setPlaylistItems(updatedItems, currentPlaylistId);
          }
          break;

        case 'assignFolder':
          if (option.folderColor) {
            const currentFolders = videoFolderAssignments[video.id] || [];
            const isAssigned = currentFolders.includes(option.folderColor);

            if (isAssigned) {
              await unassignVideoFromFolder(activePlaylistId, video.id, option.folderColor);
              setVideoFolders(video.id, currentFolders.filter(f => f !== option.folderColor));
            } else {
              await assignVideoToFolder(activePlaylistId, video.id, option.folderColor);
              setVideoFolders(video.id, [...currentFolders, option.folderColor]);
            }

            // Refresh folder view if viewing that folder
            if (selectedFolder === option.folderColor) {
              const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
              setDisplayedVideos(videos || []);
            }
          }
          break;

        case 'setQuickAssign':
          if (option.folderColor) {
            setQuickAssignFolder(option.folderColor);
            console.log('Quick assign folder set to:', option.folderColor);
          }
          break;

        case 'moveToPlaylist':
          setSelectedVideoForAction(video);
          setActionType('move');
          setShowPlaylistSelector(true);
          break;

        case 'copyToPlaylist':
          setSelectedVideoForAction(video);
          setActionType('copy');
          setShowPlaylistSelector(true);
          break;

        default:
          console.log('Unknown action:', option.action);
      }
    } catch (error) {
      console.error('Failed to handle menu action:', error);
      alert(`Failed to ${option.label.toLowerCase()}: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStarClick = async (e, video) => {
    if (!activePlaylistId) return;

    const currentFolders = videoFolderAssignments[video.id] || [];

    // Use quick assign folder (stored preference) instead of selected folder
    const targetFolder = quickAssignFolder;
    const isAssigned = currentFolders.includes(targetFolder);

    try {
      if (isAssigned) {
        // Unassign from quick assign folder
        await unassignVideoFromFolder(activePlaylistId, video.id, targetFolder);
        const updatedFolders = currentFolders.filter(f => f !== targetFolder);
        setVideoFolders(video.id, updatedFolders);

        // Refresh folder view if viewing that folder
        if (selectedFolder === targetFolder) {
          const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
          setDisplayedVideos(videos || []);
        }
      } else {
        // Assign to quick assign folder
        await assignVideoToFolder(activePlaylistId, video.id, targetFolder);
        setVideoFolders(video.id, [...currentFolders, targetFolder]);

        // Refresh folder view if viewing that folder
        if (selectedFolder === targetFolder) {
          const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
          setDisplayedVideos(videos || []);
        }
      }
    } catch (error) {
      console.error('Failed to toggle folder assignment:', error);
      alert(`Failed to ${isAssigned ? 'unassign' : 'assign'} video: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle star color left click - assign video to folder
  const handleStarColorLeftClick = async (video, folderColor) => {
    if (!activePlaylistId) return;

    const currentFolders = videoFolderAssignments[video.id] || [];
    const isAssigned = currentFolders.includes(folderColor);

    try {
      if (isAssigned) {
        // Unassign from folder
        await unassignVideoFromFolder(activePlaylistId, video.id, folderColor);
        const updatedFolders = currentFolders.filter(f => f !== folderColor);
        setVideoFolders(video.id, updatedFolders);

        // Refresh folder view if viewing that folder
        if (selectedFolder === folderColor) {
          const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
          setDisplayedVideos(videos || []);
        }
      } else {
        // Assign to folder
        await assignVideoToFolder(activePlaylistId, video.id, folderColor);
        setVideoFolders(video.id, [...currentFolders, folderColor]);

        // Refresh folder view if viewing that folder
        if (selectedFolder === folderColor) {
          const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
          setDisplayedVideos(videos || []);
        }
      }
    } catch (error) {
      console.error('Failed to toggle folder assignment:', error);
      alert(`Failed to ${isAssigned ? 'unassign' : 'assign'} video: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle star color right click - set as quick assign default
  const handleStarColorRightClick = (folderColor) => {
    setQuickAssignFolder(folderColor);
    console.log('Quick assign folder set to:', folderColor);
  };

  const handleVideoClick = (video, index) => {
    if (bulkTagMode) return; // Don't play videos in bulk tag mode
    const originalIndex = activePlaylistItems.findIndex(v => v.id === video.id);
    setSelectedVideoIndex(originalIndex >= 0 ? originalIndex : index);
    if (onVideoSelect) {
      onVideoSelect(video.video_url);
    }
  };

  const handleBulkTagColorClick = (video, folderColor) => {
    toggleBulkTagSelection(video.id, folderColor);
  };

  const handleSaveBulkTags = async () => {
    if (!activePlaylistId) return;

    const selections = Object.entries(bulkTagSelections);
    if (selections.length === 0) {
      alert('No selections to save');
      return;
    }

    setSavingBulkTags(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const [videoId, folderColors] of selections) {
        const videoIdNum = parseInt(videoId);
        const folders = Array.from(folderColors);

        // Get current folder assignments for this video
        const currentFolders = videoFolderAssignments[videoIdNum] || [];

        // Determine which folders to add and which to remove
        const foldersToAdd = folders.filter(f => !currentFolders.includes(f));
        const foldersToRemove = currentFolders.filter(f => !folders.includes(f));

        // Add new assignments
        for (const folderColor of foldersToAdd) {
          try {
            await assignVideoToFolder(activePlaylistId, videoIdNum, folderColor);
            successCount++;
          } catch (error) {
            console.error(`Failed to assign video ${videoIdNum} to folder ${folderColor}:`, error);
            errorCount++;
          }
        }

        // Remove old assignments
        for (const folderColor of foldersToRemove) {
          try {
            await unassignVideoFromFolder(activePlaylistId, videoIdNum, folderColor);
            successCount++;
          } catch (error) {
            console.error(`Failed to unassign video ${videoIdNum} from folder ${folderColor}:`, error);
            errorCount++;
          }
        }

        // Update local state
        setVideoFolders(videoIdNum, folders);
      }

      // Refresh folder assignments
      const assignments = {};
      for (const video of activePlaylistItems) {
        try {
          const folders = await getVideoFolderAssignments(activePlaylistId, video.id);
          assignments[video.id] = Array.isArray(folders) && folders.length > 0 ? folders : [];
        } catch (error) {
          console.error(`Failed to load folders for video ${video.id}:`, error);
          assignments[video.id] = [];
        }
      }
      loadVideoFolders(assignments);

      // Refresh folder view if viewing a folder
      if (selectedFolder !== null) {
        const videos = await getVideosInFolder(activePlaylistId, selectedFolder);
        setDisplayedVideos(videos || []);
      }

      // Clear selections and exit bulk tag mode
      clearBulkTagSelections();
      setBulkTagMode(false);

      if (errorCount > 0) {
        alert(`Saved ${successCount} assignments, but ${errorCount} failed. Check console for details.`);
      } else {
        alert(`Successfully saved ${successCount} folder assignments!`);
      }
    } catch (error) {
      console.error('Failed to save bulk tags:', error);
      alert(`Failed to save bulk tags: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingBulkTags(false);
    }
  };

  const handleCancelBulkTags = () => {
    clearBulkTagSelections();
    setBulkTagMode(false);
  };

  const handlePlaylistSelect = async (playlistId) => {
    if (!selectedVideoForAction || !actionType) return;

    try {
      const video = selectedVideoForAction;
      console.log(`${actionType === 'move' ? 'Moving' : 'Copying'} video to playlist ${playlistId}:`, video.title);

      const videoId = extractVideoId(video.video_url) || video.video_id;

      // 1. Add to destination playlist (Copy logic)
      await addVideoToPlaylist(
        playlistId,
        video.video_url,
        videoId,
        video.title,
        video.thumbnail_url
      );

      // 2. If 'move', remove from current playlist
      if (actionType === 'move' && activePlaylistId) {
        await removeVideoFromPlaylist(activePlaylistId, video.id);

        // Update UI locally to reflect removal
        setDisplayedVideos(prev => prev.filter(v => v.id !== video.id));

        // Update global store
        if (previewPlaylistId) {
          const updatedItems = previewPlaylistItems.filter(v => v.id !== video.id);
          setPreviewPlaylist(updatedItems, previewPlaylistId, previewFolderInfo);
        } else {
          const updatedItems = currentPlaylistItems.filter(v => v.id !== video.id);
          setPlaylistItems(updatedItems, currentPlaylistId);
        }
      }

      // Success feedback (could use a toast)
      console.log(`Video successfully ${actionType === 'move' ? 'moved' : 'copied'}!`);
      // Optional: alert(`Video ${actionType === 'move' ? 'moved' : 'copied'} successfully!`);

    } catch (error) {
      console.error(`Failed to ${actionType} video:`, error);
      alert(`Failed to ${actionType} video: ${error.message}`);
    } finally {
      setShowPlaylistSelector(false);
      setSelectedVideoForAction(null);
      setActionType(null);
    }
  };

  const handleUploadComplete = async () => {
    setShowUploader(false);

    // Reload the current playlist to show new videos
    if (activePlaylistId) {
      try {
        const items = await getPlaylistItems(activePlaylistId);
        if (previewPlaylistId) {
          setPreviewPlaylist(items, previewPlaylistId, previewFolderInfo);
        } else {
          setPlaylistItems(items, currentPlaylistId);
        }
      } catch (error) {
        console.error('Failed to reload playlist after upload:', error);
      }
    }
  };

  // Sort videos based on selected sort option
  // IMPORTANT: This hook must be called BEFORE any early returns
  const sortedVideos = useMemo(() => {
    // Determine which videos to display (folder filtered or all)
    const baseVideos = selectedFolder !== null ? displayedVideos : activePlaylistItems;

    // Handle empty arrays
    if (!baseVideos || baseVideos.length === 0) {
      return [];
    }

    if (sortBy === 'default') {
      return baseVideos;
    }

    if (sortBy === 'progress') {
      let filtered = [...baseVideos];

      // Filter: Hide Unwatched
      if (!includeUnwatched) {
        filtered = filtered.filter(video => {
          const videoId = extractVideoId(video.video_url) || video.video_id;
          const data = videoProgress.get(videoId);
          // Check if data exists and percentage > 0.
          const percentage = data ? (typeof data === 'number' ? data : data.percentage) : 0;
          return percentage > 0;
        });
      }

      // Filter: Show Only Completed (Redefined by user as "Toggle to show/hide fully watched videos")
      // If the button is ACTIVE (state true), we HIDE completed videos.
      // Wait, standard UI pattern:
      // Button "Show Completed" (Active) -> Show them.
      // But user said "I want that button to be a toggle to show/hide fully watched videos - leaving just partially watched and unwatched behind" 
      // This implies the ACTION of the button is to REMOVE them.
      // So if `showOnlyCompleted` is TRUE, we HIDE them.
      // Just to satisfy the prompt exactly: "toggle to show/hide fully watched videos"
      // If the state is true, we HIDE them. If false, we SHOW them.
      // Let's assume the button label should ideally change or is abstract "Toggle Completed".
      if (showOnlyCompleted) {
        filtered = filtered.filter(video => {
          const videoId = extractVideoId(video.video_url) || video.video_id;
          const data = videoProgress.get(videoId);
          const hasFullyWatched = data ? (typeof data === 'object' ? data.hasFullyWatched : false) : false;
          return !hasFullyWatched; // HIDE if watched
        });
      }

      const sorted = filtered.sort((a, b) => {
        const idA = extractVideoId(a.video_url) || a.video_id;
        const idB = extractVideoId(b.video_url) || b.video_id;

        const dataA = videoProgress.get(idA);
        const dataB = videoProgress.get(idB);

        const progressA = dataA ? (typeof dataA === 'number' ? dataA : dataA.percentage) : 0;
        const progressB = dataB ? (typeof dataB === 'number' ? dataB : dataB.percentage) : 0;

        return sortDirection === 'asc'
          ? progressA - progressB
          : progressB - progressA;
      });
      return sorted;
    }

    return baseVideos;
  }, [selectedFolder, displayedVideos, activePlaylistItems, sortBy, sortDirection, videoProgress, includeUnwatched, showOnlyCompleted]);

  // Determine which videos to display (for count display)
  const videosToDisplay = selectedFolder !== null ? displayedVideos : activePlaylistItems;

  // Split sorted videos into stickied and regular
  // Use allStickiedVideos to ensure reactivity
  const stickiedVideos = sortedVideos.filter(v => {
    // Check specific folder key
    const folderKey = selectedFolder === null ? 'root' : selectedFolder;
    const key = `${activePlaylistId}::${folderKey}`;
    const stickies = allStickiedVideos[key] || [];
    return stickies.includes(v.id);
  });

  const regularVideos = sortedVideos;

  const bulkTagSelectionCount = Object.values(bulkTagSelections).reduce(
    (total, folders) => total + folders.size,
    0
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* ... (Header omitted) ... */}

      {/* Video Grid - 3 per row */}
      {showUploader ? (
        <div className="flex-1 overflow-y-auto p-4 bg-transparent">
          <PlaylistUploader
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploader(false)}
            initialPlaylistId={activePlaylistId}
          />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
        >
          {loadingFolders ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mr-3"></div>
              Loading videos...
            </div>
          ) : sortedVideos.length > 0 ? (
            <>
              {/* Sticky Carousel Section - Hide on Unsorted page */}
              {stickiedVideos.length > 0 && selectedFolder !== 'unsorted' && (
                <StickyVideoCarousel>
                  {stickiedVideos.map((video, index) => {
                    const originalIndex = activePlaylistItems.findIndex(v => v.id === video.id);
                    return (
                      <VideoCard
                        key={video.id}
                        video={video}
                        index={index}
                        originalIndex={originalIndex}
                        isSelected={selectedVideoIndex === originalIndex}
                        isCurrentlyPlaying={currentVideoIndex === originalIndex}
                        videoFolders={videoFolderAssignments[video.id] || []}
                        selectedFolder={selectedFolder}
                        onVideoClick={() => handleVideoClick(video, index)}
                        onStarClick={(e) => handleStarClick(e, video)}
                        onStarColorLeftClick={handleStarColorLeftClick}
                        onStarColorRightClick={handleStarColorRightClick}
                        onMenuOptionClick={(option) => {
                          if (option.action === 'toggleSticky') {
                            handleToggleSticky(activePlaylistId, video.id);
                          } else {
                            handleMenuOptionClick(option, video);
                          }
                        }}
                        onQuickAssign={handleStarClick}
                        bulkTagMode={bulkTagMode}
                        bulkTagSelections={bulkTagSelections[video.id] || new Set()}
                        onBulkTagColorClick={(color) => handleBulkTagColorClick(video, color)}
                        onPinClick={() => { }} // Handled internally in VideoCard via store
                        isStickied={true} // It is stickied in this list
                      />
                    );
                  })}
                </StickyVideoCarousel>
              )}

              {/* Regular Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-fade-in">
                {regularVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((video, index) => {
                  const originalIndex = activePlaylistItems.findIndex(v => v.id === video.id);
                  // Check stickied status for this specific folder context
                  const folderKey = selectedFolder === null ? 'root' : selectedFolder;
                  const key = `${activePlaylistId}::${folderKey}`;
                  const isContextStickied = (allStickiedVideos[key] || []).includes(video.id);

                  return (
                    <VideoCard
                      key={video.id}
                      video={video}
                      index={index}
                      originalIndex={originalIndex}
                      isSelected={selectedVideoIndex === originalIndex}
                      isCurrentlyPlaying={currentVideoIndex === originalIndex}
                      videoFolders={videoFolderAssignments[video.id] || []}
                      selectedFolder={selectedFolder}
                      onVideoClick={() => handleVideoClick(video, index)}
                      onStarClick={(e) => handleStarClick(e, video)}
                      onStarColorLeftClick={handleStarColorLeftClick}
                      onStarColorRightClick={handleStarColorRightClick}
                      onMenuOptionClick={(option) => {
                        if (option.action === 'toggleSticky') {
                          handleToggleSticky(activePlaylistId, video.id);
                        } else {
                          handleMenuOptionClick(option, video);
                        }
                      }}
                      onQuickAssign={handleStarClick}
                      bulkTagMode={bulkTagMode}
                      bulkTagSelections={bulkTagSelections[video.id] || new Set()}
                      onBulkTagColorClick={(color) => handleBulkTagColorClick(video, color)}
                      onPinClick={() => { }} // Handled internally in VideoCard via store
                      isStickied={isContextStickied}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-8">
              No videos found in this playlist.
            </div>
          )}

          {/* Pagination Controls - Based on Regular Videos only, since Stickies are always shown */}
          {regularVideos.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-slate-600 text-sky-400 hover:text-sky-300"
              >
                Previous
              </button>

              <span className="text-slate-400 font-medium">
                Page {currentPage} of {Math.ceil(regularVideos.length / itemsPerPage)}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(regularVideos.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(regularVideos.length / itemsPerPage)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors border border-slate-600 text-sky-400 hover:text-sky-300"
              >
                Next
              </button>
            </div>
          )}
        </div >
      )}

      {/* Playlist Selection Modal */}
      <PlaylistSelectionModal
        isOpen={showPlaylistSelector}
        onClose={() => {
          setShowPlaylistSelector(false);
          setSelectedVideoForAction(null);
          setActionType(null);
        }}
        onSelect={handlePlaylistSelect}
        title={actionType === 'move' ? 'Move to Playlist' : 'Copy to Playlist'}
      />
    </div >
  );
};

export default VideosPage;

