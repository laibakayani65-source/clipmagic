import React from 'react';
import { 
  Zap, 
  Sparkles, 
  Volume2, 
  ZoomIn, 
  Flame, 
  AlertTriangle, 
  Play, 
  Check 
} from 'lucide-react';
import { HookConfig, HookStyle, SoundFXType } from '../types';
import { playSoundFX } from '../utils/audioSynthesizer';

interface HookGeneratorProps {
  hook: HookConfig;
  onChangeHook: (hook: HookConfig) => void;
  onPreviewHook: () => void;
}

export const HookGenerator: React.FC<HookGeneratorProps> = ({
  hook,
  onChangeHook,
  onPreviewHook,
}) => {
  const hookStyles: Array<{ id: HookStyle; title: string; desc: string }> = [
    { id: 'zoom_punch', title: 'Zoom Punch 🔍', desc: '1.3x smooth camera punch-in to lock user eyes' },
    { id: 'shake', title: 'Glitch Shake ⚡', desc: 'Micro vibration to break scroll pattern' },
    { id: 'flash', title: 'Flash Bang 💥', desc: 'High brightness flash burst on first frame' },
    { id: 'spotlight', title: 'Spotlight Focus 🎯', desc: 'Radial dark vignette centering speaker' },
  ];

  const soundFxOptions: Array<{ id: SoundFXType; label: string }> = [
    { id: 'whoosh', label: '💨 Fast Whoosh' },
    { id: 'pop', label: '🫧 Viral Bubble Pop' },
    { id: 'ding', label: '🔔 Bell Ding Notification' },
    { id: 'camera', label: '📸 Camera Shutter Click' },
    { id: 'cash', label: '💰 Cash Register Cha-Ching' },
    { id: 'sub_drop', label: '💥 Heavy Sub Bass Drop' },
  ];

  const viralHookPresets = [
    { text: 'STOP MAKING THIS MISTAKE! 🛑', urduText: 'یہ غلطی ابھی بند کریں! 🛑' },
    { text: 'DO NOT SCROLL! ⚠️', urduText: 'اسکرین مت ہلائیں! ⚠️' },
    { text: 'THIS 1 SECRET CHANGED EVERYTHING 📈', urduText: 'اس 1 راز نے سب کچھ بدل دیا 📈' },
    { text: '99% OF PEOPLE GET THIS WRONG 😱', urduText: '99 فیصد لوگ یہ غلط کرتے ہیں 😱' },
    { text: 'HOW TO 10X YOUR RESULTS IN 2026 🚀', urduText: '2026 میں 10 گنا تیزی سے آگے بڑھیں 🚀' },
  ];

  const handleTestSfx = (type: SoundFXType) => {
    playSoundFX(type, 0.9);
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              Auto Hook Generator (First 3 Seconds)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                +45% Retention
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              AI automatically zooms in, adds attention-grabbing headline text, and triggers high-impact sound FX.
            </p>
          </div>
        </div>

        {/* Toggle Hook */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hook.enabled}
            onChange={(e) => onChangeHook({ ...hook, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2 text-xs font-bold text-slate-300">
            {hook.enabled ? 'Hook Active' : 'Disabled'}
          </span>
        </label>
      </div>

      {hook.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Text Inputs & Presets */}
          <div className="flex flex-col gap-3.5">
            {/* English Hook Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Hook Headline Banner Text
              </label>
              <input
                type="text"
                value={hook.text}
                onChange={(e) => onChangeHook({ ...hook, text: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white outline-none"
              />
            </div>

            {/* Urdu Hook Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                اردو ہک ہیڈلائن (Nastaliq Banner)
              </label>
              <input
                type="text"
                dir="rtl"
                value={hook.urduText || ''}
                onChange={(e) => onChangeHook({ ...hook, urduText: e.target.value })}
                placeholder="وائرل ہک ٹیکسٹ اردو میں..."
                className="w-full font-urdu bg-slate-950 border border-slate-700 focus:border-yellow-500 rounded-xl px-3.5 py-2 text-sm text-yellow-300 outline-none"
              />
            </div>

            {/* Quick Viral Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                🔥 Viral High-CTR Hook Presets
              </label>
              <div className="flex flex-col gap-1.5">
                {viralHookPresets.map((vp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangeHook({ ...hook, text: vp.text, urduText: vp.urduText })}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 bg-slate-950 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-colors text-left"
                  >
                    <span className="font-semibold">{vp.text}</span>
                    <span className="font-urdu text-[11px] text-yellow-300/80">{vp.urduText}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Camera Zoom & SFX Config */}
          <div className="flex flex-col gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            {/* Visual Style Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Camera Hook Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {hookStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onChangeHook({ ...hook, style: style.id })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      hook.style === style.id
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{style.title}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                  AI Camera Zoom Intensity:
                </span>
                <span className="text-blue-400">{((hook.zoomLevel || 1.28) * 100 - 100).toFixed(0)}% Punch-in</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="1.5"
                step="0.02"
                value={hook.zoomLevel || 1.28}
                onChange={(e) => onChangeHook({ ...hook, zoomLevel: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Sound Effect Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Hook Impact Sound FX
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {soundFxOptions.map((sfx) => (
                  <div
                    key={sfx.id}
                    onClick={() => {
                      onChangeHook({ ...hook, soundFx: sfx.id });
                      handleTestSfx(sfx.id);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      hook.soundFx === sfx.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{sfx.label}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestSfx(sfx.id);
                      }}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                      title="Test Audio"
                    >
                      <Volume2 className="w-3 h-3 text-blue-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview Button */}
            <button
              onClick={() => {
                playSoundFX(hook.soundFx || 'whoosh', 0.9);
                onPreviewHook();
              }}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Preview 3-Second Hook on Video</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
