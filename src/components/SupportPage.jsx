import React, { useState, useEffect } from 'react';
import { Github, Twitter, MessageCircle, Video, Book, ExternalLink, ArrowRight, Heart } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { usePlaylistStore } from '../store/playlistStore';
import { getAllPlaylists, getPlaylistItems } from '../api/playlistApi';
import { useNavigationStore } from '../store/navigationStore';

export default function SupportPage({ onVideoSelect }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const { setPlaylistItems } = usePlaylistStore();
    const { setCurrentPage } = useNavigationStore();
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const all = await getAllPlaylists();
                setPlaylists(all);
            } catch (error) {
                console.error("Failed to fetch playlists for support page:", error);
            }
        };
        fetchPlaylists();
    }, []);

    const navigateToPlaylist = async (nameKeyword) => {
        const target = playlists.find(p => p.name.toLowerCase().includes(nameKeyword.toLowerCase()));
        if (target) {
            try {
                const items = await getPlaylistItems(target.id);
                setPlaylistItems(items, target.id);
                setCurrentPage('videos');
            } catch (e) {
                console.error("Failed to load playlist items", e);
            }
        } else {
            alert(`Playlist "${nameKeyword}" not found. Please create it first.`);
        }
    };

    const items = [
        {
            id: 'code',
            label: 'Source Code',
            sublabel: 'Open Source & Free',
            icon: Github,
            color: 'from-slate-700 to-slate-900',
            textColor: 'text-slate-200',
            action: () => openUrl('https://github.com/your-repo'), // Placeholder
            description: 'Dive into the entire codebase. Completely open-source and free to use.'
        },
        {
            id: 'twitter',
            label: 'Developer',
            sublabel: 'Connect on X',
            icon: Twitter,
            color: 'from-blue-400 to-blue-600',
            textColor: 'text-blue-100',
            action: () => openUrl('https://x.com'), // Placeholder
            description: 'Follow the head developer for updates and behind-the-scenes content.'
        },
        {
            id: 'discord',
            label: 'Community',
            sublabel: 'Join Discord',
            icon: MessageCircle,
            color: 'from-indigo-500 to-indigo-700',
            textColor: 'text-indigo-100',
            action: () => openUrl('https://discord.com'), // Placeholder
            description: 'Join our vibrant community. Get help, share ideas, and chat with others.'
        },
        {
            id: 'promo',
            label: 'Future Plans',
            sublabel: 'Promo Videos',
            icon: Video,
            color: 'from-rose-400 to-rose-600',
            textColor: 'text-rose-100',
            action: () => navigateToPlaylist('Promo'),
            description: 'Watch promotional videos detailing future projects and ambitions.'
        },
        {
            id: 'resources',
            label: 'Resources',
            sublabel: 'For Developers',
            icon: Book,
            color: 'from-emerald-400 to-emerald-600',
            textColor: 'text-emerald-100',
            action: () => navigateToPlaylist('Resources'),
            description: 'Curated resources to help 0-code vibe coders use this project.'
        }
    ];

    // Radial calculation
    const radius = 180;
    const innerRadius = 80;
    const center = 250;
    const totalSlices = items.length;
    const anglePerSlice = 360 / totalSlices;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
        return d;
    };

    const createSector = (startAngle, endAngle) => {
        const outerStart = polarToCartesian(center, center, radius, endAngle);
        const outerEnd = polarToCartesian(center, center, radius, startAngle);
        const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
        const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", outerStart.x, outerStart.y,
            "A", radius, radius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
            "L", innerEnd.x, innerEnd.y,
            "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
            "Z"
        ].join(" ");
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.02)_2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

            <div className="relative flex flex-col items-center">
                {/* Visual Ring */}
                <div className="relative w-[500px] h-[500px]">
                    <svg width="500" height="500" viewBox="0 0 500 500" className="drop-shadow-2xl">
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {items.map((item, index) => {
                            const startAngle = index * anglePerSlice;
                            const endAngle = startAngle + anglePerSlice - 2; // -2 for gap
                            const isHovered = hoveredIndex === index;

                            // Calculate icon position (midpoint of sector)
                            const midAngle = startAngle + (anglePerSlice / 2);
                            const iconPos = polarToCartesian(center, center, (radius + innerRadius) / 2, midAngle);

                            // Text rotation to keep it upright-ish or radial? 
                            // Keeping icons upright is better for readability.

                            return (
                                <g
                                    key={item.id}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={item.action}
                                    className="cursor-pointer transition-all duration-300 group"
                                    style={{ transformOrigin: 'center', transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                                >
                                    <path
                                        d={createSector(startAngle, endAngle)}
                                        className={`fill-current transition-colors duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`}
                                        fill={`url(#grad-${item.id})`}
                                    />
                                    <defs>
                                        <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" className={item.color.split(' ')[0].replace('from-', 'stop-')} style={{ stopColor: 'currentColor' }} /> {/* Tailwind extraction hack or just use hex? */}
                                            {/* Tailwind classes for gradients within SVG defs are tricky. Let's use direct fill with classes on the path if needed, 
                                                but path fill accepts defs. I will map colors manually or use classes on the path directly if not for gradient.
                                                Actually, let's just use solid classes for simplicity and reliability, or css variables.
                                                The clean way: use className with tailwind text colors and fill='currentColor'.
                                            */}
                                        </linearGradient>
                                    </defs>

                                    {/* Since SVG gradients are tricky with Tailwind classes dynamic, let's use a simpler approach: 
                                        Apply the gradient class to a div overlay or just use solid colors. 
                                        User wants "Rich Aesthetics". 
                                        I will use the text-color trick: set text color on group, fill="currentColor".
                                        Wait, gradients need distinct start/stops. 
                                        Let's stick to simple fill per item or use standard colors.
                                    */}
                                </g>
                            );
                        })}

                        {/* Re-render paths with proper coloring approach */}
                        {items.map((item, index) => {
                            const startAngle = index * anglePerSlice;
                            const endAngle = startAngle + anglePerSlice - 2;
                            const isHovered = hoveredIndex === index;

                            // Gradients defined manually for best look
                            const gradients = {
                                code: ['#334155', '#0f172a'],
                                twitter: ['#60a5fa', '#2563eb'],
                                discord: ['#818cf8', '#4f46e5'],
                                promo: ['#fb7185', '#e11d48'],
                                resources: ['#34d399', '#059669']
                            };

                            return (
                                <g
                                    key={item.id}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={item.action}
                                    className="cursor-pointer"
                                    style={{ transformOrigin: 'center center', transition: 'all 0.3s ease' }}
                                >
                                    <defs>
                                        <linearGradient id={`gradient-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={gradients[item.id][0]} />
                                            <stop offset="100%" stopColor={gradients[item.id][1]} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={createSector(startAngle, endAngle)}
                                        fill={`url(#gradient-${item.id})`}
                                        className={`transition-all duration-300 ${isHovered ? 'filter drop-shadow-lg brightness-110' : 'opacity-90'}`}
                                        style={{ transform: isHovered ? 'scale(1.02)' : 'scale(1)', transformBox: 'fill-box', transformOrigin: 'center' }}
                                    />
                                </g>
                            );
                        })}

                        {/* Icons Layer (Separate to sit on top) */}
                        {items.map((item, index) => {
                            const startAngle = index * anglePerSlice;
                            const midAngle = startAngle + (anglePerSlice / 2);
                            const iconPos = polarToCartesian(center, center, (radius + innerRadius) / 2, midAngle);
                            const Icon = item.icon;
                            const isHovered = hoveredIndex === index;

                            return (
                                <foreignObject
                                    key={`icon-${index}`}
                                    x={iconPos.x - 20}
                                    y={iconPos.y - 20}
                                    width="40"
                                    height="40"
                                    className="pointer-events-none"
                                >
                                    <div className={`flex items-center justify-center w-full h-full text-white transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`}>
                                        <Icon size={24} strokeWidth={2.5} />
                                    </div>
                                </foreignObject>
                            );
                        })}

                        {/* Center Hole Content */}
                        <foreignObject x={center - 70} y={center - 70} width="140" height="140">
                            <div className="w-full h-full rounded-full bg-white shadow-inner flex items-center justify-center text-center p-2 flex-col z-10 border-4 border-slate-50 overflow-hidden relative">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 z-10 mb-1">Hub</span>
                                <div className="relative z-10 animate-[heartbeat_1.5s_ease-in-out_infinite]">
                                    <div className="absolute inset-0 bg-rose-400 blur-xl opacity-50 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                                    <Heart
                                        size={48}
                                        className="fill-rose-500 text-rose-600 drop-shadow-md"
                                        strokeWidth={2.5}
                                    />
                                </div>
                                <h2 className="text-xs font-black text-rose-500 tracking-wider mt-2 z-10 opacity-80">SUPPORT</h2>

                                {/* Subtle background glow */}
                                <div className="absolute inset-0 bg-rose-50/50 rounded-full animate-pulse-slow"></div>
                            </div>
                        </foreignObject>
                    </svg>
                </div>

                {/* Active Item Description Box - Dynamic */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] pointer-events-none opacity-0"></div>

                {/* Info Card that appears on bottom of ring or dynamically changes */}
                <div className="mt-8 h-32 w-full max-w-md flex flex-col items-center justify-center text-center space-y-2 px-6 transition-all duration-300">
                    {hoveredIndex !== null ? (
                        <>
                            <div className={`p-3 rounded-full bg-gradient-to-br ${items[hoveredIndex].color} text-white shadow-lg mb-2`}>
                                {React.createElement(items[hoveredIndex].icon, { size: 24 })}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{items[hoveredIndex].label}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{items[hoveredIndex].sublabel}</p>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto pt-2 leading-relaxed">
                                {items[hoveredIndex].description}
                            </p>
                        </>
                    ) : (
                        <div className="text-slate-300 flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <ArrowRight className="text-slate-300" />
                            </div>
                            <p className="font-medium">Hover over a segment to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
