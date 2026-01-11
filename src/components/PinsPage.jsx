import React, { useMemo } from 'react';
import { usePinStore } from '../store/pinStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useLayoutStore } from '../store/layoutStore';
import VideoCard from './VideoCard';
import PageBanner from './PageBanner';
import StickyVideoCarousel from './StickyVideoCarousel';

const PinsPage = ({ onVideoSelect }) => {
    const { pinnedVideos, priorityPinIds } = usePinStore();
    const { currentVideoIndex, currentPlaylistItems } = usePlaylistStore();
    const { inspectMode } = useLayoutStore();

    // Helper to get inspect label
    const getInspectTitle = (label) => inspectMode ? label : undefined;

    // Split videos into Priority and Regular
    const { priorityVideos, regularVideos } = useMemo(() => {
        if (!pinnedVideos) return { priorityVideos: [], regularVideos: [] };

        const priority = [];
        const regular = [];

        // Use Set for fast lookup if we had many IDs, but array includes is fine for small lists
        const priorityIds = priorityPinIds || [];

        // Distribute videos
        pinnedVideos.forEach(video => {
            if (priorityIds.includes(video.id)) {
                priority.push(video);
            } else {
                regular.push(video);
            }
        });

        // Sort priority videos by their order in priorityPinIds (most recent first)
        priority.sort((a, b) => {
            return priorityIds.indexOf(a.id) - priorityIds.indexOf(b.id);
        });

        // Sort regular videos by pinnedAt timestamp (newest first)
        regular.sort((a, b) => {
            const timeA = a.pinnedAt || 0;
            const timeB = b.pinnedAt || 0;
            return timeB - timeA;
        });

        return { priorityVideos: priority, regularVideos: regular };
    }, [pinnedVideos, priorityPinIds]);

    const renderContent = () => {
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

        // Get top 10 priority pins for carousel
        const carouselVideos = priorityVideos.slice(0, 10);

        return (
            <div className="flex flex-col gap-4">
                {/* Priority Pins Carousel */}
                {carouselVideos.length > 0 && (
                    <StickyVideoCarousel title="Priority Pins">
                        {carouselVideos.map((video, index) => {
                            const isCurrentlyPlaying = currentPlaylistItems?.[currentVideoIndex]?.id === video.id;
                            return (
                                <VideoCard
                                    key={video.id || `priority-${index}`}
                                    video={video}
                                    index={index}
                                    originalIndex={index}
                                    isSelected={false}
                                    isCurrentlyPlaying={isCurrentlyPlaying}
                                    videoFolders={[]} // Pinned view doesn't show folder context usually
                                    onVideoSelect={onVideoSelect}
                                    onVideoClick={() => onVideoSelect(video.video_url)}
                                />
                            );
                        })}
                    </StickyVideoCarousel>
                )}

                {/* Regular Pins Grid */}
                {regularVideos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regularVideos.map((video, index) => {
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
                                    // ENABLE TIMER ONLY FOR REGULAR PINS ON THIS PAGE
                                    showTimer={true}
                                />
                            );
                        })}
                    </div>
                )}
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
                {renderContent()}
            </div>
        </div>
    );
};

export default PinsPage;
