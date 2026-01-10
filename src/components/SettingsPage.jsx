import React from 'react';
import { Palette } from 'lucide-react';
import { THEMES } from '../utils/themes';

export default function SettingsPage({ currentThemeId, onThemeChange }) {
    return (
        <div className="w-full h-full p-6 text-slate-800 space-y-8 overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-sky-50 pb-4">
                <Palette className="text-sky-600" size={24} />
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
