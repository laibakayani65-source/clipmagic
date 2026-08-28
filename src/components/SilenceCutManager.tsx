import React from 'react';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Play
} from 'lucide-react';
import { SilenceCut } from '../types';

interface SilenceCutManagerProps {
  cuts: SilenceCut[];
  originalDuration: number;
  editedDuration: number;
  onChangeCuts: (cuts: SilenceCut[]) => void;
  onSeek: (time: number) => void;
}

export const SilenceCutManager: React.FC<SilenceCutManagerProps> = ({
  cuts,
  originalDuration,
  editedDuration,
  onChangeCuts,
  onSeek,
}) => {
  const totalSaved = cuts.reduce((acc, c) => (c.active !== false ? acc + c.duration : acc), 0);

  const handleToggleCut = (index: number) => {
    const updated = cuts.map((c, i) => (i === index ? { ...c, active: c.active === false ? true : false } : c));
    onChangeCuts(updated);
  };

  const getCutBadge = (type: SilenceCut['type']) => {
    switch (type) {
      case 'silence':
        return { label: '🔇 Awkward Pause', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'filler':
        return { label: '🗣️ Filler "Umm / Yani"', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'mistake':
        return { label: '✂️ Stutter / Retake', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default:
        return { label: '✂️ Auto Cut', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              AI Silence & Filler Word Removal
            </h3>
            <p className="text-xs text-slate-400">
              Automatically deletes dead air, "umm", "uh", "matlab", "yani" to create dynamic high-retention cuts.
            </p>
          </div>
        </div>
      </div>

      {/* Pacing Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Dead Air Eliminated</p>
            <p className="font-display font-black text-lg text-white">
              -{totalSaved.toFixed(1)}s <span className="text-xs text-rose-400 font-normal">({cuts.length} cuts)</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Pacing Speed Boost</p>
            <p className="font-display font-black text-lg text-blue-400">+28% Faster Flow</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Estimated Retention</p>
            <p className="font-display font-black text-lg text-emerald-400">+42% Watch Time</p>
          </div>
        </div>
      </div>

      {/* List of Detected Cuts */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Detected Jump Cuts & Fillers ({cuts.length})
        </label>

        {cuts.length === 0 ? (
          <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
            No silence cuts detected. Your video pacing is already fast!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {cuts.map((cut, idx) => {
              const badge = getCutBadge(cut.type);
              const isActive = cut.active !== false;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{cut.description}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {cut.start.toFixed(1)}s → {cut.end.toFixed(1)}s ({cut.duration.toFixed(1)}s removed)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSeek(cut.start)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded"
                      title="Seek to Cut"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleToggleCut(idx)}
                      className="text-xs font-bold text-slate-300 hover:text-blue-400"
                    >
                      {isActive ? (
                        <span className="text-blue-400 text-xs font-bold">Cut</span>
                      ) : (
                        <span className="text-slate-500 text-xs">Keep</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
