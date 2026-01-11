import React, { useState, useEffect } from 'react';
import { usePlaylistStore } from '../store/playlistStore';
import { getAllPlaylists, getPlaylistItems, createPlaylist } from '../api/playlistApi';
import VideoCard from './VideoCard';
import PageBanner from './PageBanner';
import { useLayoutStore } from '../store/layoutStore';

const LikesPage = ({ onVideoSelect }) => {
    const [likesPlaylistId, setLikesPlaylistId] = useState(null);
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentVideoIndex, currentPlaylistItems } = usePlaylistStore();
    const { inspectMode } = useLayoutStore();

    useEffect(() => {
        const initLikes = async () => {
            setLoading(true);
            try {
                const playlists = await getAllPlaylists();
                let likesPlaylist = playlists.find(p => p.name === 'Likes');

                // Create if doesn't exist (consistency with PlayerController)
                if (!likesPlaylist) {
                    const newId = await createPlaylist('Likes', 'Videos you have liked');
                    setLikesPlaylistId(newId);
                    setLikedVideos([]);
                } else {
                    setLikesPlaylistId(likesPlaylist.id);
                    const items = await getPlaylistItems(likesPlaylist.id);
                    setLikedVideos(items || []);
                }
            } catch (error) {
                console.error('Failed to load likes:', error);
            } finally {
                setLoading(false);
            }
        };
        initLikes();
    }, []);

    // Render video cards
    const renderVideos = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-12 text-slate-400">
                    <p>Loading liked videos...</p>
                </div>
            );
        }

        if (!likedVideos || likedVideos.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-medium mb-2">No Liked Videos</h3>
                    <p>Videos you like will appear here.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likedVideos.map((video, index) => {
                    // We'll use basic VideoCard rendering
                    // Note: we might not show "folder context" here unless we fetched it, 
                    // likely overkill for a simple Likes page unless requested.
                    const isCurrentlyPlaying = currentPlaylistItems?.[currentVideoIndex]?.id === video.id;

                    return (
                        <VideoCard
                            key={video.id || `liked-${index}`}
                            video={video}
                            index={index}
                            originalIndex={index}
                            isSelected={false}
                            isCurrentlyPlaying={isCurrentlyPlaying}
                            videoFolders={[]} // Not showing specific folder context for now
                            onVideoSelect={onVideoSelect}
                            onVideoClick={() => onVideoSelect(video.video_url)}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            <PageBanner
                title="Liked Videos"
                description="Your collection of liked videos."
                color={null}
                isEditable={false}
            />

            <div className="flex-1 overflow-y-auto p-4">
                {renderVideos()}
            </div>
        </div>
    );
};

export default LikesPage;
