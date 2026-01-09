import React from 'react';
import { Layout, Palette, Anchor as AnchorIcon, Layers, ListMusic, Maximize2, Minimize2, ArrowLeftRight } from 'lucide-react';
import { useConfigStore } from '../store/configStore';
import { THEMES } from '../utils/themes';

export default function SettingsPage({ currentThemeId, onThemeChange }) {
    const {
        pinAnchorX, setPinAnchorX,
        pinAnchorY, setPinAnchorY,
        plusButtonX, setPlusButtonX,
        plusButtonY, setPlusButtonY,
        pinToggleY, setPinToggleY,

        playlistToggleX, setPlaylistToggleX,
        playlistTabsX, setPlaylistTabsX,
        playlistInfoX, setPlaylistInfoX,
        playlistInfoWidth, setPlaylistInfoWidth,

        playlistCapsuleX, setPlaylistCapsuleX,
        playlistCapsuleY, setPlaylistCapsuleY,
        playlistCapsuleWidth, setPlaylistCapsuleWidth,
        playlistCapsuleHeight, setPlaylistCapsuleHeight,
        playlistChevronLeftX, setPlaylistChevronLeftX,
        playlistPlayCircleX, setPlaylistPlayCircleX,
        playlistChevronRightX, setPlaylistChevronRightX,

        orbImageScale, setOrbImageScale,
        orbImageScaleW, setOrbImageScaleW,
        orbImageScaleH, setOrbImageScaleH,
        orbImageXOffset, setOrbImageXOffset,
        orbImageYOffset, setOrbImageYOffset,
        orbSize, setOrbSize,

        menuWidth, setMenuWidth,
        menuHeight, setMenuHeight,

        modeHandleSize, setModeHandleSize,
        modeHandleInternalSize, setModeHandleInternalSize,
        videoChevronLeftX, setVideoChevronLeftX,
        videoChevronRightX, setVideoChevronRightX,
        modeSwitcherX, setModeSwitcherX,
        shuffleButtonX, setShuffleButtonX,
        gridButtonX, setGridButtonX,
        starButtonX, setStarButtonX,
        likeButtonX, setLikeButtonX
    } = useConfigStore();

    return (
        <div className="w-full h-full p-6 text-slate-800 space-y-8 overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-sky-50 pb-4">
                <Layout className="text-sky-600" size={24} />
                <h1 className="text-xl font-black uppercase tracking-widest text-sky-600">Configuration</h1>
            </div>

            <div className="space-y-8 pb-20">
                <ConfigSection title="Theme" icon={Palette}>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(THEMES).map(([id, theme]) => (
                            <button
                                key={id}
                                onClick={() => onThemeChange && onThemeChange(id)}
                                className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border-2 text-left flex flex-col gap-2 ${currentThemeId === id
                                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-sky-200 hover:text-sky-600'
                                    }`}
                            >
                                <div className={`w-full h-8 rounded-md bg-gradient-to-br ${theme.bg.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}`}></div>
                                <span>{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </ConfigSection>

                <ConfigSection title="Pin Track & Header" icon={AnchorIcon}>
                    <ControlSlider label="Anchor X" value={pinAnchorX} onChange={setPinAnchorX} min={0} max={1000} unit="px" />
                    <ControlSlider label="Anchor Y" value={pinAnchorY} onChange={setPinAnchorY} min={-100} max={100} unit="px" />
                    <ControlSlider label="Plus Icon X" value={plusButtonX} onChange={setPlusButtonX} min={0} max={1000} unit="px" />
                    <ControlSlider label="Plus Icon Y" value={plusButtonY} onChange={setPlusButtonY} min={-100} max={100} unit="px" />
                    <ControlSlider label="Eye Toggle Y" value={pinToggleY} onChange={setPinToggleY} min={-100} max={100} unit="px" />
                </ConfigSection>

                <ConfigSection title="Playlist Header" icon={Layers}>
                    <ControlSlider label="Toggle X" value={playlistToggleX} onChange={setPlaylistToggleX} min={-100} max={150} unit="px" />
                    <ControlSlider label="Tabs X" value={playlistTabsX} onChange={setPlaylistTabsX} min={-200} max={200} unit="px" />
                    <ControlSlider label="Info Bar X" value={playlistInfoX} onChange={setPlaylistInfoX} min={-150} max={150} unit="px" />
                    <ControlSlider label="Info Width" value={playlistInfoWidth} onChange={setPlaylistInfoWidth} min={50} max={400} unit="px" />
                </ConfigSection>

                <ConfigSection title="Playlist Capsule" icon={ListMusic}>
                    <div className="grid grid-cols-2 gap-2">
                        <ControlSlider label="X" value={playlistCapsuleX} onChange={setPlaylistCapsuleX} min={-100} max={100} unit="px" />
                        <ControlSlider label="Y" value={playlistCapsuleY} onChange={setPlaylistCapsuleY} min={-100} max={100} unit="px" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <ControlSlider label="W" value={playlistCapsuleWidth} onChange={setPlaylistCapsuleWidth} min={40} max={300} unit="px" />
                        <ControlSlider label="H" value={playlistCapsuleHeight} onChange={setPlaylistCapsuleHeight} min={20} max={100} unit="px" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <ControlSlider label="L-Chev X" value={playlistChevronLeftX} onChange={setPlaylistChevronLeftX} min={-50} max={50} unit="px" />
                        <ControlSlider label="Play X" value={playlistPlayCircleX} onChange={setPlaylistPlayCircleX} min={-50} max={50} unit="px" />
                        <ControlSlider label="R-Chev X" value={playlistChevronRightX} onChange={setPlaylistChevronRightX} min={-50} max={50} unit="px" />
                    </div>
                </ConfigSection>

                <ConfigSection title="Orb Image Tuning" icon={Maximize2}>
                    <ControlSlider label="Master Size" value={Math.round(orbImageScale * 100)} onChange={(v) => setOrbImageScale(v / 100)} min={20} max={300} unit="%" />
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <ControlSlider label="Width %" value={Math.round(orbImageScaleW * 100)} onChange={(v) => setOrbImageScaleW(v / 100)} min={20} max={300} unit="%" />
                        <ControlSlider label="Height %" value={Math.round(orbImageScaleH * 100)} onChange={(v) => setOrbImageScaleH(v / 100)} min={20} max={300} unit="%" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <ControlSlider label="Offset X" value={orbImageXOffset} onChange={setOrbImageXOffset} min={-150} max={150} unit="px" />
                        <ControlSlider label="Offset Y" value={orbImageYOffset} onChange={setOrbImageYOffset} min={-150} max={150} unit="px" />
                    </div>
                </ConfigSection>

                <ConfigSection title="Video Menu Toolbar" icon={Maximize2}>
                    <ControlSlider label="Mode Toggle Circle" value={modeHandleSize} onChange={setModeHandleSize} min={10} max={40} unit="px" />
                    <ControlSlider label="Mode Number Size" value={modeHandleInternalSize} onChange={setModeHandleInternalSize} min={6} max={40} unit="px" />
                    <div className="h-2" />
                    <ControlSlider label="Left Chevron X" value={videoChevronLeftX} onChange={setVideoChevronLeftX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Right Chevron X" value={videoChevronRightX} onChange={setVideoChevronRightX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Mode Toggle X" value={modeSwitcherX} onChange={setModeSwitcherX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Shuffle X" value={shuffleButtonX} onChange={setShuffleButtonX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Grid Menu X" value={gridButtonX} onChange={setGridButtonX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Star X" value={starButtonX} onChange={setStarButtonX} min={-100} max={100} unit="px" />
                    <ControlSlider label="Like X" value={likeButtonX} onChange={setLikeButtonX} min={-100} max={100} unit="px" />
                </ConfigSection>

                <ConfigSection title="Global Layout" icon={Layout}>
                    <div className="grid grid-cols-2 gap-2">
                        <ControlSlider label="Menu W" value={menuWidth} onChange={setMenuWidth} min={200} max={1000} unit="px" />
                        <ControlSlider label="Menu H" value={menuHeight} onChange={setMenuHeight} min={60} max={300} unit="px" />
                    </div>
                    <ControlSlider label="Orb Size" value={orbSize} onChange={setOrbSize} min={20} max={400} unit="px" />
                </ConfigSection>
            </div>
        </div>
    );
}

function ConfigSection({ title, icon: Icon, children }) {
    return (
        <div className="space-y-4 border-t border-sky-50 pt-6 first:border-0 first:pt-0 bg-white/50 p-4 rounded-2xl">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">{Icon && <Icon size={14} />} {title}</h3>
            <div className="space-y-4 px-1">{children}</div>
        </div>
    );
}

function ControlSlider({ label, value, onChange, min, max, unit }) {
    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 group-hover:text-sky-600 transition-colors">
                <span>{label}</span>
                <span className="text-sky-600 font-black tracking-tighter bg-sky-50 px-2 py-0.5 rounded shadow-sm border border-sky-100">{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:bg-sky-50 transition-all border border-slate-100" />
        </div>
    );
}
