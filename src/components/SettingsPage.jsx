import React, { useState } from 'react';
import { Palette, User, Smile, ExternalLink, Copy, Check } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useConfigStore } from '../store/configStore';
import { THEMES } from '../utils/themes';

const AVATARS = [
    '( ͡° ͜ʖ ͡°)',
    '( ͠° ͟ʖ ͡°)',
    '( ͡~ ͜ʖ ͡°)',
    '( . •́ _ʖ •̀ .)',
    '( ಠ ͜ʖ ಠ)',
    '( ͡o ͜ʖ ͡o)',
    '( ͡◉ ͜ʖ ͡◉)',
    '( ͡☉ ͜ʖ ͡☉)',
    '( ͡⚆ ͜ʖ ͡⚆)',
    '( ͡◎ ͜ʖ ͡◎)',
    '( ✧≖ ͜ʖ≖)',
    '( ง ͠° ͟ل͜ ͡°) ง',
    '( ͡° ͜V ͡°)',
    '¯\\_(ツ)_/¯',
    '(>_>)',
    '(^_^)',
    '(¬_¬)',
    `
   /\\
  /  \\
  |  |
  |  |
 / == \\
 |/**\\|
`,
    `
 .--.
|o_o |
|:_/ |
//   \\ \\
(|     | )
/'\\_   _/\`\\
\\___)=(___/
`,
    'custom'
];

export default function SettingsPage({ currentThemeId, onThemeChange }) {
    const [activeTab, setActiveTab] = useState('theme');
    const {
        userName, setUserName, userAvatar, setUserAvatar,
        customOrbImage, setCustomOrbImage,
        isSpillEnabled, setIsSpillEnabled,
        orbSpill, setOrbSpill,
        orbImageScale, setOrbImageScale
    } = useConfigStore();
    const [customAvatar, setCustomAvatar] = useState('');
    const [copied, setCopied] = useState(false);

    const promptText = 'maintain style as much as possible. dont change anything about original image. im looking for a "zoom out" so that I can [insert desired changes]. reference the single primary color markings which mark out how I want things expanded. remove single primary color markings from final image.';

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAvatarSelect = (avatar) => {
        if (avatar === 'custom') {
            setUserAvatar(customAvatar || 'Custom');
        } else {
            setUserAvatar(avatar.trim());
        }
    };

    const handleOrbImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomOrbImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSpillQuadrant = (q) => {
        setOrbSpill({ ...orbSpill, [q]: !orbSpill[q] });
    };

    const isMultiLine = (text) => text.includes('\n');

    return (
        <div className="w-full h-full p-6 text-slate-800 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-sky-50 pb-4">
                <div className="p-2 bg-sky-50 rounded-lg">
                    {activeTab === 'theme' ? <Palette className="text-sky-600" size={24} /> :
                        activeTab === 'orb' ? <Smile className="text-sky-600" size={24} /> :
                            <User className="text-sky-600" size={24} />}
                </div>
                <h1 className="text-xl font-black uppercase tracking-widest text-sky-600">Configuration</h1>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('theme')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'theme' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Palette size={16} /> Theme
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <User size={16} /> Signature
                </button>
                <button
                    onClick={() => setActiveTab('orb')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'orb' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Smile size={16} /> Orb
                </button>
            </div>

            <div className="space-y-8 pb-20">
                {activeTab === 'theme' ? (
                    <ConfigSection title="Theme Selection" icon={Palette}>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(THEMES).map(([id, theme]) => (
                                <button
                                    key={id}
                                    onClick={() => onThemeChange && onThemeChange(id)}
                                    className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border-2 text-left flex flex-col gap-2 ${currentThemeId === id
                                        ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md ring-2 ring-sky-200'
                                        : 'border-slate-100 bg-white text-slate-400 hover:border-sky-200 hover:text-sky-600 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${theme.bg.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')} shadow-inner`}></div>
                                    <span className="px-1">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </ConfigSection>
                ) : activeTab === 'orb' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <ConfigSection title="Orb Configuration" icon={Smile}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 ml-1">Custom Orb Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden flex items-center justify-center bg-slate-50 relative group">
                                            {customOrbImage ? (
                                                <img src={customOrbImage} alt="Orb" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-300 text-xs text-center p-2">No Image</div>
                                            )}
                                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                                                <span className="text-xs font-bold">Change</span>
                                                <input type="file" onChange={handleOrbImageUpload} accept="image/*" className="hidden" />
                                            </label>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Upload a custom image for the central orb. You can enable "Spill" to let the image break out of the circle in specific corners.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setIsSpillEnabled(!isSpillEnabled)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${isSpillEnabled
                                                        ? 'bg-sky-500 border-sky-500 text-white shadow-md'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                                >
                                                    {isSpillEnabled ? 'Spill Enabled' : 'Spill Disabled'}
                                                </button>
                                                {customOrbImage && (
                                                    <button
                                                        onClick={() => setCustomOrbImage(null)}
                                                        className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-colors"
                                                    >
                                                        Remove Image
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Scale Slider */}
                                {customOrbImage && isSpillEnabled && (
                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-bold uppercase text-slate-400">Image Scale</label>
                                            <span className="text-xs font-mono font-bold text-sky-600">{orbImageScale.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-300">0.5x</span>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="3.0"
                                                step="0.05"
                                                value={orbImageScale}
                                                onChange={(e) => setOrbImageScale(parseFloat(e.target.value))}
                                                className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-400 transition-all border border-slate-200"
                                            />
                                            <span className="text-[10px] font-bold text-slate-300">3.0x</span>
                                        </div>
                                    </div>
                                )}

                                {customOrbImage && isSpillEnabled && (
                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                        <label className="text-xs font-bold uppercase text-slate-400 ml-1">Spill Areas</label>
                                        <div className="flex gap-8">
                                            {/* Interactive Visualizer */}
                                            <div className="relative w-48 h-48 border-2 border-slate-100 rounded-xl overflow-hidden bg-slate-50 mx-auto select-none">
                                                {/* The Image Background */}
                                                <img
                                                    src={customOrbImage}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale transition-transform duration-300 origin-center"
                                                    style={{ transform: `scale(${orbImageScale})` }}
                                                    alt=""
                                                />

                                                {/* The Circle Mask (Inverse) */}
                                                <div className="absolute inset-0 pointer-events-none z-10">
                                                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                                                        <defs>
                                                            <mask id="circleMask">
                                                                <rect width="100" height="100" fill="white" />
                                                                <circle cx="50" cy="50" r="35" fill="black" />
                                                            </mask>
                                                        </defs>
                                                        <rect width="100" height="100" fill="rgba(0,0,0,0.6)" mask="url(#circleMask)" />
                                                    </svg>
                                                </div>

                                                {/* Quadrant Toggles */}
                                                <div className="absolute inset-0 z-20 grid grid-cols-2 grid-rows-2">
                                                    {['tl', 'tr', 'bl', 'br'].map((q) => (
                                                        <button
                                                            key={q}
                                                            onClick={() => toggleSpillQuadrant(q)}
                                                            className={`
                                                                relative border-dashed border-white/30 transition-all duration-200 hover:bg-sky-500/20 active:scale-95 flex items-center justify-center
                                                                ${q === 'tl' ? 'border-r border-b rounded-tl-xl' : ''}
                                                                ${q === 'tr' ? 'border-l border-b rounded-tr-xl' : ''}
                                                                ${q === 'bl' ? 'border-r border-t rounded-bl-xl' : ''}
                                                                ${q === 'br' ? 'border-l border-t rounded-br-xl' : ''}
                                                                ${orbSpill[q] ? 'bg-sky-500/30' : ''}
                                                            `}
                                                        >
                                                            {orbSpill[q] && (
                                                                <div className="p-1 bg-sky-500 rounded-full text-white shadow-sm">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Center Label */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                                                    <div className="bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                        ORB
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 text-xs text-slate-500 space-y-2 py-2">
                                                <p>Click the quadrants to toggle spill for that area.</p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li><span className="font-bold text-sky-600">Selected:</span> Image overflows the circle in this corner.</li>
                                                    <li><span className="font-bold text-slate-400">Unselected:</span> Image is clipped to the circle in this corner.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ConfigSection>

                        {/* Background Removal Banner */}
                        <button
                            onClick={() => openUrl('https://www.remove.bg/upload')}
                            className="w-full p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-200 group hover:shadow-xl hover:shadow-teal-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-left space-y-1">
                                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                        Make it Pop
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] uppercase tracking-wider font-bold">Free Tool</span>
                                    </h3>
                                    <p className="text-emerald-50 text-xs font-medium max-w-sm leading-relaxed">
                                        Use <span className="font-bold text-white underline decoration-white/50 underline-offset-2">remove.bg</span> to clear image backgrounds. This creates a stunning 3D pop-out effect when using spilled corners on your Orb!
                                    </p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <ExternalLink className="text-white" size={20} />
                                </div>
                            </div>
                        </button>

                        {/* Pro Tip Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <span className="bg-amber-400 text-white px-2 py-0.5 rounded text-[10px]">PRO TIP</span>
                                    Handling Cropped Images
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex gap-6 items-start">
                                    <img
                                        src="/tip.png"
                                        alt="Tip: Extending cropped images"
                                        className="w-32 h-32 object-contain rounded-lg border border-slate-100 bg-slate-50 shadow-sm"
                                    />
                                    <div className="space-y-2 text-xs text-slate-500 leading-relaxed">
                                        <p className="font-bold text-slate-700">Image cut off? No problem.</p>
                                        <p>
                                            Sometimes an image is too zoomed in or cropped awkwardly for the orb. You can use Generative Fill tools (like in Photoshop or online AI editors) to "zoom out" and extend the artwork.
                                        </p>
                                        <p>
                                            Mark the area you want to expand with a primary color (like red) and use the prompt below to generate the missing parts while keeping the original style.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-xl p-4 relative group">
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={handleCopyPrompt}
                                            className={`
                                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                                                ${copied
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                                                }
                                            `}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={12} /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} /> Copy Prompt
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-400 mb-2 select-none opacity-50">GEN FILL PROMPT</div>
                                    <p className="font-mono text-xs text-slate-300 pr-24 leading-relaxed selection:bg-emerald-500/30 selection:text-emerald-200">
                                        {promptText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <ConfigSection title="Pseudonym" icon={User}>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                                    placeholder="Enter your name..."
                                />
                            </div>
                        </ConfigSection>

                        <ConfigSection title="Signature" icon={Smile}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {AVATARS.map((avatar, index) => {
                                    const isCustom = avatar === 'custom';
                                    const isSelected = isCustom ? !AVATARS.slice(0, -1).includes(userAvatar) : userAvatar === avatar.trim();
                                    const multiline = isMultiLine(avatar);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleAvatarSelect(avatar)}
                                            className={`p-4 rounded-xl text-sm font-medium transition-all border-2 flex items-center justify-center min-h-[64px] ${isSelected
                                                ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md ring-2 ring-sky-200'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-sky-200 hover:text-sky-600 hover:shadow-sm'
                                                }`}
                                        >
                                            {isCustom ? (
                                                <span className="italic opacity-50">Custom...</span>
                                            ) : (
                                                <span className={`font-mono text-xs ${multiline ? 'text-[4px] leading-none whitespace-pre text-left' : 'text-lg'}`}>{avatar.trim()}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Avatar Input - Shown if Custom is selected or user types in it */}
                            <div className={`mt-4 space-y-2 transition-all duration-300 ${!AVATARS.slice(0, -1).map(a => a.trim()).includes(userAvatar) ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}`}>
                                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Custom ASCII Avatar (Multi-line supported)</label>
                                <textarea
                                    value={AVATARS.slice(0, -1).map(a => a.trim()).includes(userAvatar) ? customAvatar : userAvatar}
                                    onChange={(e) => {
                                        setCustomAvatar(e.target.value);
                                        setUserAvatar(e.target.value);
                                    }}
                                    className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-mono text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all min-h-[120px] text-xs leading-tight whitespace-pre"
                                    placeholder="Paste your ASCII art here..."
                                />
                            </div>
                        </ConfigSection>

                        {/* Preview */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-lg text-white">
                            <h3 className="text-xs font-black uppercase tracking-widest text-sky-100 mb-4 opacity-70 text-center">Banner Preview</h3>
                            <div className="flex items-center gap-6 justify-center">
                                {/* Auto-detect Layout wrapped in flexible container */}
                                {isMultiLine(userAvatar) ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-2xl font-black tracking-tight drop-shadow-md opacity-90">
                                            <span>{userName}</span>
                                        </div>
                                        <pre className="font-mono text-[4px] leading-none whitespace-pre text-white/90 drop-shadow-md">
                                            {userAvatar}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-black tracking-tight drop-shadow-md">
                                        <span className="mr-2 opacity-90">{userAvatar}</span>
                                        <span>{userName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* External Link Banner */}
                        <button
                            onClick={() => openUrl('https://emojicombos.com/')}
                            className="w-full p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-200 group hover:shadow-xl hover:shadow-purple-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="text-left space-y-1">
                                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                        Need more ASCII art?
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] uppercase tracking-wider font-bold">Recommended</span>
                                    </h3>
                                    <p className="text-indigo-50 text-xs font-medium max-w-sm leading-relaxed">
                                        Visit <span className="font-bold text-white underline decoration-white/50 underline-offset-2">EmojiCombos.com</span> to find the perfect text art collection or draw your own masterpiece.
                                    </p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <ExternalLink className="text-white" size={20} />
                                </div>
                            </div>
                        </button>
                    </div>
                )}
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
