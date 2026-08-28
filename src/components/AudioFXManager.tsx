import React, { useState } from 'react';
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Radio,
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { MusicMood, MusicTrack, SoundFX, SoundFXType } from '../types';
import { SAMPLE_MUSIC_TRACKS } from '../utils/stockMedia';
import { playSoundFX, bgMusicSynth } from '../utils/audioSynthesizer';

interface AudioFXManagerProps {
  currentMusic: MusicTrack | null;
  musicVolume: number;
  autoDucking: boolean;
  onChangeMusic: (track: MusicTrack | null) => void;
  onChangeVolume: (vol: number) => void;
  onToggleAutoDucking: (val: boolean) => void;
  soundEffects: SoundFX[];
  onChangeSoundEffects: (sfx: SoundFX[]) => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const AudioFXManager: React.FC<AudioFXManagerProps> = ({
  currentMusic,
  musicVolume,
  autoDucking,
  onChangeMusic,
  onChangeVolume,
  onToggleAutoDucking,
  soundEffects,
  onChangeSoundEffects,
  currentTime,
  onSeek,
}) => {
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  const moodBadges: Record<MusicMood, { label: string; color: string }> = {
    energetic: { label: '🔥 Energetic Phonk / EDM', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    inspiring: { label: '💡 Uplifting Storytelling', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    chill: { label: '☕ Lo-Fi Relaxed Vibe', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    lofi: { label: '🎧 Midnight Lo-Fi Beats', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    dramatic: { label: '🎭 Cinematic Tension', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    suspense: { label: '🕵️ Mystery Pulse', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  };

  const handleTogglePreviewTrack = (track: MusicTrack) => {
    if (playingPreviewId === track.id) {
      bgMusicSynth.stop();
      setPlayingPreviewId(null);
    } else {
      bgMusicSynth.start(track.mood, track.bpm, 0.5);
      setPlayingPreviewId(track.id);
    }
  };

  const handleSelectMusic = (track: MusicTrack) => {
    onChangeMusic(track);
    playSoundFX('pop', 0.6);
  };

  const handleAddSFX = (type: SoundFXType) => {
    const newSfx: SoundFX = {
      id: `sfx_${Date.now()}`,
      time: Math.round(currentTime * 10) / 10,
      type,
      volume: 0.8,
    };
    onChangeSoundEffects([...soundEffects, newSfx]);
    playSoundFX(type, 0.8);
  };

  const handleRemoveSFX = (id: string) => {
    onChangeSoundEffects(soundEffects.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              Auto Music & Sound FX Engine
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Copyright-Free
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              AI detects video mood, adds viral beat loop, and triggers synchronized sound effects.
            </p>
          </div>
        </div>

        {/* Auto Ducking Toggle */}
        <label className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={autoDucking}
            onChange={(e) => onToggleAutoDucking(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
          />
          <div className="text-left">
            <span className="text-xs font-bold text-white block">Auto-Ducking</span>
            <span className="text-[10px] text-slate-400">Lowers beat when speech begins</span>
          </div>
        </label>
      </div>

      {/* Music Volume Control Bar */}
      <div className="flex items-center gap-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
        <Volume2 className="w-4 h-4 text-blue-400 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
            <span>Background Music Volume</span>
            <span className="text-blue-400">{Math.round(musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Royalty-Free Beat Library */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Select Background Beat (Mood Matched)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {SAMPLE_MUSIC_TRACKS.map((track) => {
            const isSelected = currentMusic?.id === track.id;
            const isPreviewing = playingPreviewId === track.id;
            const badge = moodBadges[track.mood] || moodBadges.energetic;

            return (
              <div
                key={track.id}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{track.bpm} BPM</span>
                </div>

                <h4 className="text-xs font-bold text-white truncate mb-0.5">{track.title}</h4>
                <p className="text-[10px] text-slate-400 truncate mb-3">{track.license}</p>

                <div className="flex items-center gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleTogglePreviewTrack(track)}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {isPreviewing ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
                    <span>{isPreviewing ? 'Stop' : 'Listen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMusic(track)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : 'Use Beat'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sound Effects (SFX) Section */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Add Sound Effect at Current Playhead ({currentTime.toFixed(1)}s)
            </label>
            <p className="text-[11px] text-slate-500">
              Click any sound to trigger immediately and insert into video timeline.
            </p>
          </div>
        </div>

        {/* SFX Quick Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { type: 'whoosh' as SoundFXType, label: '💨 Whoosh' },
            { type: 'pop' as SoundFXType, label: '🫧 Bubble Pop' },
            { type: 'ding' as SoundFXType, label: '🔔 Bell Ding' },
            { type: 'camera' as SoundFXType, label: '📸 Shutter' },
            { type: 'cash' as SoundFXType, label: '💰 Cha-Ching' },
            { type: 'sub_drop' as SoundFXType, label: '💥 Bass Drop' },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleAddSFX(item.type)}
              className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Active SFX Cues List */}
        <div className="mt-2">
          <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
            Active Sound FX Cues ({soundEffects.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {soundEffects.map((sfx) => (
              <div
                key={sfx.id}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs"
              >
                <span className="font-mono text-blue-400 font-bold">{sfx.time.toFixed(1)}s</span>
                <span className="text-slate-300 uppercase text-[10px] font-bold">{sfx.type}</span>
                <button
                  onClick={() => playSoundFX(sfx.type, sfx.volume)}
                  className="text-slate-400 hover:text-white"
                  title="Test"
                >
                  <Play className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => handleRemoveSFX(sfx.id)}
                  className="text-slate-500 hover:text-red-400 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
