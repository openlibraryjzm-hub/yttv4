import React, { useState, useRef } from 'react';
import Card from './Card';
import CardThumbnail from './CardThumbnail';
import CardContent from './CardContent';
import CardActions from './CardActions';
import BulkTagColorGrid from './BulkTagColorGrid';
import StarColorPicker from './StarColorPicker';
import { getThumbnailUrl } from '../utils/youtubeUtils';
import { FOLDER_COLORS, getFolderColorById } from '../utils/folderColors';
import { usePinStore } from '../store/pinStore';
import { useLayoutStore } from '../store/layoutStore';
import { useFolderStore } from '../store/folderStore';
import { Pin } from 'lucide-react';

/**
 * VideoCard - Example of how easy it is to build complex cards with the new system
 * All functionality is cleanly separated and easy to extend
 */
const VideoCard = ({
  video,
  index,
  originalIndex,
  isSelected = false,
  isCurrentlyPlaying = false,
  videoFolders = [],
  selectedFolder = null,
  onVideoClick,
  onStarClick,
  onStarColorLeftClick,
  onStarColorRightClick,
  onMenuOptionClick,
  onQuickAssign,
  bulkTagMode = false,
  bulkTagSelections = new Set(),
  onBulkTagColorClick,
  onPinClick,
  onSecondPlayerSelect,
  progress = 0,
  isWatched = false,
}) => {
  const { inspectMode } = useLayoutStore();
  const { quickAssignFolder } = useFolderStore();

  // Helper to get inspect label
  const getInspectTitle = (label) => inspectMode ? label : undefined;
  const [isHovered, setIsHovered] = useState(false);
  const [isStarHovered, setIsStarHovered] = useState(false);
  const starHoverTimeoutRef = useRef(null);
  const starHoverDelayRef = useRef(null);
  const thumbnailUrl = getThumbnailUrl(video.video_id, 'medium');
  const primaryFolder = videoFolders.length > 0 ? getFolderColorById(videoFolders[0]) : null;
  const quickAssignColor = getFolderColorById(quickAssignFolder);
  const { isPinned, togglePin, setFirstPin, isPriorityPin } = usePinStore();
  const isPinnedVideo = isPinned(video.id);
  const isPriority = isPriorityPin(video.id);

  // Quick action - star for folder assignment (must be defined before badges)
  const quickActions = [];

  // Menu options - easy to extend! (must be defined before badges)
  const menuOptions = [
    {
      label: 'Delete',
      danger: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      action: 'delete',
    },
    {
      label: 'Move to Playlist',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      ),
      action: 'moveToPlaylist',
    },
    {
      label: 'Copy to Playlist',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      action: 'copyToPlaylist',
    },
    {
      label: 'Assign to Folder',
      submenu: 'folders',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Quick Assign',
      submenu: 'quickFolders',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  // Submenu options for folders (must be defined before badges)
  const submenuOptions = {
    folders: FOLDER_COLORS.map((color) => ({
      label: color.name,
      icon: (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color.hex }}
        />
      ),
      action: 'assignFolder',
      folderColor: color.id,
    })),
    quickFolders: FOLDER_COLORS.map((color) => ({
      label: `Set ${color.name} as Quick Assign`,
      icon: (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color.hex }}
        />
      ),
      action: 'setQuickAssign',
      folderColor: color.id,
    })),
  };

  // Handle pin click
  const handlePinClick = (e) => {
    e.stopPropagation(); // Prevent card click
    togglePin(video);
    if (onPinClick) {
      onPinClick(video);
    }
  };

  // Handle priority pin click
  const handlePriorityPinClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setFirstPin(video);
  };

  // Play overlay for hover (only show when not in bulk tag mode)
  const playOverlay = !bulkTagMode ? (
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3 pointer-events-none group-hover:pointer-events-auto">
      {/* Play button for main player */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onVideoClick) {
            onVideoClick();
          }
        }}
        className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 transition-all active:scale-90 shadow-lg pointer-events-auto"
        title={getInspectTitle('Play video') || 'Play video'}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </button>
      {/* Priority pin button */}
      <button
        onClick={handlePriorityPinClick}
        className="rounded-full flex items-center justify-center border-2 border-amber-400 shadow-sm bg-white hover:bg-amber-50 transition-all active:scale-90 pointer-events-auto"
        style={{ width: '48px', height: '48px', borderColor: '#fbbf24' }}
        title={getInspectTitle(isPriority ? 'Priority pin (click to replace)' : 'Set as priority pin') || (isPriority ? 'Priority pin (click to replace)' : 'Set as priority pin')}
      >
        <Pin size={24} color="#fbbf24" fill={isPriority ? "#fbbf24" : "none"} strokeWidth={2} />
      </button>
    </div>
  ) : null;

  // Badges for thumbnail (now can safely use quickActions, menuOptions, submenuOptions)
  const badges = [
    isCurrentlyPlaying && {
      component: (
        <div className="bg-sky-500 text-white text-xs font-bold px-2 py-1 rounded">
          Now Playing
        </div>
      ),
      position: 'top-left',
    },
    // Watched badge (only if NOT playing)
    !isCurrentlyPlaying && isWatched && {
      component: (
        <div className="bg-black/90 text-green-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-900 tracking-wider shadow-md">
          WATCHED
        </div>
      ),
      position: 'top-left',
    },
    {
      component: (
        <div className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
          #{originalIndex >= 0 ? originalIndex + 1 : index + 1}
        </div>
      ),
      position: 'bottom-left',
    },
    // Pin icon badge - bottom-right
    !bulkTagMode && {
      component: (
        <button
          onClick={handlePinClick}
          className={`p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${isPinnedVideo
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-black/70 hover:bg-black/90 text-white/70 hover:text-white'
            }`}
          title={getInspectTitle(isPinnedVideo ? 'Unpin video' : 'Pin video') || (isPinnedVideo ? 'Unpin video' : 'Pin video')}
        >
          <svg
            className="w-4 h-4"
            fill={isPinnedVideo ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={isPinnedVideo ? 0 : 2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      ),
      position: 'bottom-right',
    },
    // Quick Actions Badge (Star) - Top Right - Visible on Hover
    !bulkTagMode && {
      component: (
        <div 
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative"
          onMouseEnter={() => {
            // Clear any existing delay or hide timeout
            if (starHoverDelayRef.current) {
              clearTimeout(starHoverDelayRef.current);
            }
            if (starHoverTimeoutRef.current) {
              clearTimeout(starHoverTimeoutRef.current);
              starHoverTimeoutRef.current = null;
            }
            // Add 1.2 second delay before showing menu
            starHoverDelayRef.current = setTimeout(() => {
              setIsStarHovered(true);
              starHoverDelayRef.current = null;
            }, 1200);
          }}
          onMouseLeave={() => {
            // Clear the delay if mouse leaves before menu appears
            if (starHoverDelayRef.current) {
              clearTimeout(starHoverDelayRef.current);
              starHoverDelayRef.current = null;
            }
            // Use a small delay to allow mouse to move to picker
            starHoverTimeoutRef.current = setTimeout(() => {
              setIsStarHovered(false);
            }, 150);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onStarClick) {
                onStarClick(e);
              }
            }}
            onMouseEnter={() => {
              // Clear any existing delay or hide timeout
              if (starHoverDelayRef.current) {
                clearTimeout(starHoverDelayRef.current);
              }
              if (starHoverTimeoutRef.current) {
                clearTimeout(starHoverTimeoutRef.current);
                starHoverTimeoutRef.current = null;
              }
              // Add 1.2 second delay before showing menu
              starHoverDelayRef.current = setTimeout(() => {
                setIsStarHovered(true);
                starHoverDelayRef.current = null;
              }, 1200);
            }}
            onMouseLeave={() => {
              // Clear the delay if mouse leaves before menu appears
              if (starHoverDelayRef.current) {
                clearTimeout(starHoverDelayRef.current);
                starHoverDelayRef.current = null;
              }
            }}
            className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 transition-all"
            title={getInspectTitle(
              videoFolders.length > 0
                ? `Assigned to: ${videoFolders.map(f => getFolderColorById(f).name).join(', ')}`
                : 'Click to assign to folder'
            ) || (
              videoFolders.length > 0
                ? `Assigned to: ${videoFolders.map(f => getFolderColorById(f).name).join(', ')}`
                : 'Click to assign to folder'
            )}
            style={{ color: primaryFolder ? primaryFolder.hex : quickAssignColor.hex }}
            data-card-action="true"
          >
            <svg
              className="w-5 h-5"
              fill={videoFolders.length > 0 ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={videoFolders.length > 0 ? 0 : 2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      ),
      position: 'top-right',
    },
  ].filter(Boolean);

  return (
    <Card
      onClick={bulkTagMode ? undefined : onVideoClick}
      selected={isSelected}
      playing={isCurrentlyPlaying}
      className={bulkTagMode ? 'cursor-default' : ''}
      variant="minimal"
    >
      <div
        onMouseEnter={() => bulkTagMode && setIsHovered(true)}
        onMouseLeave={() => bulkTagMode && setIsHovered(false)}
        className="relative group rounded-lg overflow-hidden" // Added rounded-lg overflow-hidden here to round the image
      >
        <CardThumbnail
          src={thumbnailUrl}
          alt={video.title || `Video ${index + 1}`}
          overlay={playOverlay}
          badges={bulkTagMode ? badges.filter(b => b.position !== 'top-right') : badges}
          progress={progress}
        />

        {/* Star color picker overlay */}
        {isStarHovered && !bulkTagMode && (
          <div
            data-star-picker="true"
            className="absolute inset-0 flex items-start justify-center pt-2 z-30 pointer-events-none"
            onMouseEnter={() => {
              if (starHoverTimeoutRef.current) {
                clearTimeout(starHoverTimeoutRef.current);
                starHoverTimeoutRef.current = null;
              }
              setIsStarHovered(true);
            }}
            onMouseLeave={() => {
              setIsStarHovered(false);
            }}
          >
            <div className="pointer-events-auto">
              <StarColorPicker
                currentFolders={videoFolders}
                quickAssignFolder={quickAssignFolder}
                onColorLeftClick={(folderColor) => {
                  if (onStarColorLeftClick) {
                    onStarColorLeftClick(video, folderColor);
                  }
                  setIsStarHovered(false);
                }}
                onColorRightClick={(folderColor) => {
                  if (onStarColorRightClick) {
                    onStarColorRightClick(folderColor);
                  }
                  setIsStarHovered(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Bulk tag color grid overlay */}
        {bulkTagMode && isHovered && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <BulkTagColorGrid
              videoId={video.id}
              currentFolders={videoFolders}
              selectedFolders={bulkTagSelections}
              onColorClick={onBulkTagColorClick}
            />
          </div>
        )}
      </div>

      <CardContent
        title={video.title || `Video ${index + 1}`}
        subtitle={video.video_id}
        className="[&>p]:opacity-0 [&>p]:group-hover:opacity-100 [&>p]:transition-opacity [&>p]:duration-200"
        padding="p-0 pt-3"
        headerActions={!bulkTagMode && (
          <CardActions
            menuOptions={menuOptions}
            onMenuOptionClick={onMenuOptionClick}
            submenuOptions={submenuOptions}
            className="flex-nowrap"
          />
        )}
      />
    </Card>
  );
};

export default VideoCard;

