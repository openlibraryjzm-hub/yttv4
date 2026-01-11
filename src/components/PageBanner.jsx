import React from 'react';
import { FOLDER_COLORS } from '../utils/folderColors';
import { Pen, Play } from 'lucide-react';
import { getThumbnailUrl } from '../utils/youtubeUtils';


import { useConfigStore } from '../store/configStore';

const PageBanner = ({ title, description, folderColor, onEdit, videoCount, creationYear, author, avatar, continueVideo, onContinue, children }) => {
    const { bannerPattern, customPageBannerImage } = useConfigStore();

    // Find color config if folderColor is provided
    // If folderColor is 'unsorted', distinct gray style
    const isUnsorted = folderColor === 'unsorted';

    const colorConfig = (!isUnsorted && folderColor)
        ? FOLDER_COLORS.find(c => c.id === folderColor)
        : null;

    // Determine gradient styles
    let gradientStyle;
    let shadowColor;

    if (customPageBannerImage) {
        gradientStyle = {
            backgroundImage: `url(${customPageBannerImage})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'left center',
        };
        // Use a neutral or dominant color for shadow if possible, or fallback
        shadowColor = colorConfig?.hex || '#3b82f6';
    } else if (isUnsorted) {
        gradientStyle = {
            background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' // Slate/Gray
        };
        shadowColor = '#64748b';
    } else if (colorConfig) {
        gradientStyle = {
            background: `linear-gradient(135deg, ${colorConfig.hex}DD 0%, ${colorConfig.hex} 100%)`
        };
        shadowColor = colorConfig.hex;
    } else {
        // Default Playlist Blue
        gradientStyle = {
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' // Sky to Blue
        };
        shadowColor = '#3b82f6';
    }

    // Define animation for custom banner if needed (e.g., slow pan)
    // For now, we'll keep it static or rely on the pattern overlay if the user wants both.
    // If custom image is set, we might want to hide the pattern overlay to avoid clutter,
    // OR show it if the user explicitly wants texture. 
    // Let's hide the pattern by default if custom image is there, unless we want to support both.
    // Given the UI in Settings uses "Banner Pattern" buttons, maybe custom image is a separate mode?
    // In Settings, we will probably have "Upload" and "Presets". 
    // If "Upload" is active (customPageBannerImage != null), we use it.

    // Check if custom image is a GIF
    const isGif = customPageBannerImage?.startsWith('data:image/gif');

    return (
        <div
            className={`w-full relative overflow-hidden rounded-2xl mb-8 p-8 animate-fade-in shadow-lg group mx-auto ${(customPageBannerImage && !isGif) ? 'animate-page-banner-scroll' : ''}`}
            style={{
                ...gradientStyle,
                boxShadow: `0 10px 25px -5px ${shadowColor}50`
            }}
        >
            {/* Animated Pattern Overlay - Only show if NO custom image is set, OR if we want to overlay it. 
                Let's hide it if custom image is set to let the image shine. */}
            {!customPageBannerImage && (
                <div className={`absolute inset-0 pointer-events-none z-0 pattern-${bannerPattern || 'diagonal'}`} />
            )}

            {/* If custom image is set, maybe add a dark overlay for text readability */}
            {customPageBannerImage && (
                <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
            )}

            {/* Abstract Background Shapes for Premium Feel - Keep these, they look nice over images too */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transform group-hover:scale-110 transition-transform duration-1000 ease-in-out" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

            {/* Edit Button - Visible on hover if onEdit is provided */}
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105 z-20"
                    title="Edit Details"
                >
                    <Pen size={18} />
                </button>
            )}

            {/* Content Container - Flex Row for Avatar + Text */}
            <div className="relative z-10 flex items-center h-full gap-8 w-full">
                {/* Avatar Section (Optional) */}
                {avatar && (
                    <div className="shrink-0 hidden md:flex flex-col items-center gap-1 animate-in fade-in slide-in-from-left-4 duration-700">
                        <span className="text-white/90 font-black tracking-widest uppercase opacity-60 mix-blend-overlay text-[10px]">
                            {author}
                        </span>
                        {avatar.includes('\n') ? (
                            <pre className="font-mono text-[4px] leading-none whitespace-pre text-white/90 drop-shadow-md select-none opacity-70 mix-blend-overlay">
                                {avatar}
                            </pre>
                        ) : (
                            // Single line avatars (Lenny) are larger
                            <div className="font-mono text-3xl font-bold text-white/90 drop-shadow-md whitespace-nowrap opacity-80 mix-blend-overlay">
                                {avatar}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                        {title}
                    </h1>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 text-white/80 font-medium text-sm md:text-base mb-4">
                        {videoCount !== undefined && (
                            <span>{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
                        )}
                        {(videoCount !== undefined && (creationYear || author)) && (
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                        )}
                        {creationYear && (
                            <span>{creationYear}</span>
                        )}
                        {(creationYear && author) && (
                            <span className="w-1 h-1 rounded-full bg-white/60" />
                        )}
                        {author && (
                            <span>{author}</span>
                        )}
                    </div>

                    {description && (
                        <p className="text-lg md:text-xl text-white/95 font-medium max-w-4xl leading-relaxed drop-shadow-sm opacity-90">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right Content (e.g. Graphs) */}
                {children && (
                    <div className="ml-auto pl-8">
                        {children}
                    </div>
                )}
            </div>

            {/* Continue Section - Bottom Right */}
            {continueVideo && (
                <div
                    className="absolute bottom-6 right-6 flex flex-col items-end gap-2 group/continue cursor-pointer z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onContinue) onContinue();
                    }}
                >
                    <span className="text-white/80 font-bold text-sm tracking-wider group-hover/continue:text-white transition-colors">
                        CONTINUE?
                    </span>
                    <div className="relative h-24 aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-white/20 group-hover/continue:border-white transition-all transform group-hover/continue:scale-105">
                        <img
                            src={getThumbnailUrl(continueVideo.video_id, 'medium')}
                            alt={continueVideo.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/continue:opacity-100 transition-opacity">
                            <Play className="text-white fill-white" size={24} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageBanner;
