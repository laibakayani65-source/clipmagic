import React, { useState } from 'react';
import { 
  Film, 
  Sparkles, 
  Plus, 
  Trash2, 
  Search, 
  Layers, 
  Clock, 
  ExternalLink,
  Volume2,
  Check
} from 'lucide-react';
import { BRollClip } from '../types';
import { SAMPLE_BROLL_LIBRARY } from '../utils/stockMedia';

interface BRollManagerProps {
  brolls: BRollClip[];
  onChangeBRolls: (brolls: BRollClip[]) => void;
  videoDuration: number;
  onSeek: (time: number) => void;
}

export const BRollManager: React.FC<BRollManagerProps> = ({
  brolls,
  onChangeBRolls,
  videoDuration,
  onSeek,
}) => {
  const [scriptInput, setScriptInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleExtractFromScript = async () => {
    if (!scriptInput.trim()) return;
    setIsExtracting(true);

    try {
      const res = await fetch('/api/generate-broll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptInput, duration: videoDuration }),
      });
      const data = await res.json();
      if (data.brolls && data.brolls.length > 0) {
        // Map suggested brolls with matching stock footage
        const mapped = data.brolls.map((s: any, idx: number) => {
          const matchedStock = SAMPLE_BROLL_LIBRARY[idx % SAMPLE_BROLL_LIBRARY.length];
          return {
            id: `broll_${Date.now()}_${idx}`,
            start: s.start || idx * 4,
            end: s.end || idx * 4 + 3.2,
            keyword: s.keyword || 'viral content',
            title: s.title || matchedStock.title,
            type: s.type || 'video',
            url: matchedStock.url,
            thumbnail: matchedStock.thumbnail,
            position: s.position || 'fullscreen',
            opacity: 0.95,
          };
        });
        onChangeBRolls([...brolls, ...mapped]);
      }
    } catch (e) {
      console.error('B-roll extraction error:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddStockClip = (item: typeof SAMPLE_BROLL_LIBRARY[0]) => {
    const nextStart = Math.min(videoDuration - 3, brolls.length * 4);
    const newClip: BRollClip = {
      id: `broll_${Date.now()}`,
      start: nextStart,
      end: nextStart + 3.5,
      keyword: item.keyword,
      title: item.title,
      type: item.type,
      url: item.url,
      thumbnail: item.thumbnail,
      position: 'fullscreen',
      opacity: 0.95,
    };
    onChangeBRolls([...brolls, newClip]);
  };

  const handleRemoveClip = (id: string) => {
    onChangeBRolls(brolls.filter((b) => b.id !== id));
  };

  const handleUpdateClip = (id: string, updates: Partial<BRollClip>) => {
    onChangeBRolls(brolls.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const filteredStock = SAMPLE_BROLL_LIBRARY.filter(
    (item) =>
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Auto B-Roll & Visual Cutaways
            </h3>
            <p className="text-xs text-slate-400">
              Paste your script to auto-generate context-aware stock video overlays at exact timestamps.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          {brolls.length} Active Overlays
        </span>
      </div>

      {/* Script Auto Extractor Section */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Paste Script / Topic for Instant AI B-Roll Matching
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder="Paste your video script here (e.g. 'In 2026, AI tools will replace manual video editors and save millions of dollars for creators...')"
            rows={2}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
          />
          <button
            onClick={handleExtractFromScript}
            disabled={isExtracting || !scriptInput.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isExtracting ? 'Analyzing Script...' : '✨ Match AI B-Roll'}</span>
          </button>
        </div>
      </div>

      {/* Active B-Roll Timeline List */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Active Video Overlays
        </label>
        {brolls.length === 0 ? (
          <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
            No B-Roll overlays active yet. Click a stock clip below or paste your script above to insert!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brolls.map((br) => (
              <div
                key={br.id}
                className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                  <img src={br.thumbnail} alt={br.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 px-1 bg-black/80 rounded text-[9px] font-mono text-cyan-300">
                    {br.end - br.start}s
                  </span>
                </div>

                {/* Info & Timing */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{br.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="font-mono text-blue-400">
                      {br.start.toFixed(1)}s - {br.end.toFixed(1)}s
                    </span>
                    <button
                      onClick={() => onSeek(br.start)}
                      className="text-[10px] text-slate-300 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      Seek
                    </button>
                  </div>

                  {/* Position Toggle */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <select
                      value={br.position}
                      onChange={(e) => handleUpdateClip(br.id, { position: e.target.value as any })}
                      className="bg-slate-900 text-[10px] text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 outline-none"
                    >
                      <option value="fullscreen">Fullscreen Overlay</option>
                      <option value="pip">Picture-in-Picture (PIP)</option>
                    </select>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemoveClip(br.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated Royalty-Free Stock Catalog */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Royalty-Free Stock B-Roll Catalog (Click to Insert)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search category or topic..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none w-48"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredStock.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleAddStockClip(item)}
              className="group relative flex flex-col bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
            >
              <div className="aspect-video w-full relative overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-80" />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 rounded text-[9px] font-bold text-slate-200">
                  {item.category}
                </span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-600/40 transition-opacity">
                  <span className="px-2 py-1 rounded bg-black/80 text-white font-bold text-[10px] flex items-center gap-1">
                    <Plus className="w-3 h-3 text-cyan-300" /> Insert B-Roll
                  </span>
                </div>
              </div>
              <div className="p-2">
                <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.keyword}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
