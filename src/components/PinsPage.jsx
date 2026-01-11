import React, { useState, useMemo } from 'react';
import { usePinStore } from '../store/pinStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useLayoutStore } from '../store/layoutStore';
import VideoCard from './VideoCard';
import PageBanner from './PageBanner';

const PinsPage = ({ onVideoSelect }) => {
    const { pinnedVideos, priorityPinId } = usePinStore();
    const { currentVideoIndex, currentPlaylistItems } = usePlaylistStore();
    const { inspectMode } = useLayoutStore();

    // Helper to get inspect label
    const getInspectTitle = (label) => inspectMode ? label : undefined;

    // Render video cards
    const renderVideos = () => {
        if (!pinnedVideos || pinnedVideos.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <h3 className="text-xl font-medium mb-2">No Pinned Videos</h3>
                    <p>Pin videos from any playlist to access them quickly here.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedVideos.map((video, index) => {
                    const isCurrentlyPlaying = currentPlaylistItems?.[currentVideoIndex]?.id === video.id;

                    return (
                        <VideoCard
                            key={video.id || `pinned-${index}`}
                            video={video}
                            index={index}
                            originalIndex={index}
                            isSelected={false}
                            isCurrentlyPlaying={isCurrentlyPlaying}
                            videoFolders={[]} // Pinned view doesn't show folder context usually
                            onVideoSelect={onVideoSelect}
                            onVideoClick={() => onVideoSelect(video.video_url)}
                        // Minimal props since we might not have full context
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            <PageBanner
                title="Pinned Videos"
                description="Your collection of pinned videos from across all playlists."
                color={null}
                isEditable={false}
            />

            <div className="flex-1 overflow-y-auto p-4">
                {renderVideos()}
            </div>
        </div>
    );
};

export default PinsPage;
