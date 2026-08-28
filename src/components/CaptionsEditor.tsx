import React, { useState } from 'react';
import { 
  Subtitles, 
  Sparkles, 
  Plus, 
  Trash2, 
  Palette, 
  Type, 
  Smile, 
  Languages,
  Check,
  Zap,
  Volume2
} from 'lucide-react';
import { CaptionLanguage, CaptionSegment, CaptionStyle, CaptionWord } from '../types';

interface CaptionsEditorProps {
  captions: CaptionSegment[];
  onChangeCaptions: (captions: CaptionSegment[]) => void;
  captionStyle: CaptionStyle;
  onChangeStyle: (style: CaptionStyle) => void;
  captionLanguage: CaptionLanguage;
  onChangeLanguage: (lang: CaptionLanguage) => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const CaptionsEditor: React.FC<CaptionsEditorProps> = ({
  captions,
  onChangeCaptions,
  captionStyle,
  onChangeStyle,
  captionLanguage,
  onChangeLanguage,
  currentTime,
  onSeek,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(captions[0]?.id || '');
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const styleOptions: Array<{ id: CaptionStyle; title: string; desc: string; preview: string; color: string }> = [
    {
      id: 'hormozi',
      title: 'Hormozi Pop 🔥',
      desc: 'Bold yellow/green/cyan text with thick stroke & bouncy pop',
      preview: 'POP ON BEAT',
      color: 'from-amber-500 to-yellow-300',
    },
    {
      id: 'mrbeast',
      title: 'MrBeast Neon ⚡',
      desc: 'Punchy heavy letterforms with neon yellow & cyan outer glow',
      preview: 'VIRAL ENERGY',
      color: 'from-blue-500 to-cyan-300',
    },
    {
      id: 'neon',
      title: 'Cyber Glow ✨',
      desc: 'Futuristic electric blue & violet neon aura',
      preview: 'GLOW AURA',
      color: 'from-cyan-400 to-indigo-400',
    },
    {
      id: 'cinematic',
      title: 'Cinematic Minimal 🎬',
      desc: 'Clean dark frosted backdrop pill with high contrast',
      preview: 'ELEGANT SUB',
      color: 'from-slate-600 to-slate-400',
    },
    {
      id: 'karaoke',
      title: 'Karaoke Bounce 🎤',
      desc: 'Dynamic word-by-word progressive color fill on speech',
      preview: 'WORD BY WORD',
      color: 'from-emerald-400 to-teal-300',
    },
  ];

  const handleUpdateSegmentText = (segId: string, text: string) => {
    const updated = captions.map((c) => (c.id === segId ? { ...c, text } : c));
    onChangeCaptions(updated);
  };

  const handleUpdateUrduText = (segId: string, urduText: string) => {
    const updated = captions.map((c) => (c.id === segId ? { ...c, urduText } : c));
    onChangeCaptions(updated);
  };

  const handleToggleWordHighlight = (segId: string, wordIdx: number) => {
    const updated = captions.map((c) => {
      if (c.id !== segId) return c;
      const newWords = [...(c.words || [])];
      if (newWords[wordIdx]) {
        newWords[wordIdx] = {
          ...newWords[wordIdx],
          highlight: !newWords[wordIdx].highlight,
          color: !newWords[wordIdx].highlight ? '#fde047' : '#ffffff',
        };
      }
      return { ...c, words: newWords };
    });
    onChangeCaptions(updated);
  };

  const handleSetWordEmoji = (segId: string, wordIdx: number, emoji: string) => {
    const updated = captions.map((c) => {
      if (c.id !== segId) return c;
      const newWords = [...(c.words || [])];
      if (newWords[wordIdx]) {
        newWords[wordIdx] = { ...newWords[wordIdx], emoji };
      }
      return { ...c, words: newWords };
    });
    onChangeCaptions(updated);
  };

  const activeSegment = captions.find((c) => c.id === selectedSegmentId) || captions[0];

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-blue-400" />
          <h3 className="font-display font-bold text-base text-white">
            Smart Beat Captions & Typography
          </h3>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          <button
            onClick={() => onChangeLanguage('bilingual')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              captionLanguage === 'bilingual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN + اردو (Bilingual)
          </button>
          <button
            onClick={() => onChangeLanguage('english')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              captionLanguage === 'english' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onChangeLanguage('urdu')}
            className={`px-2.5 py-1 rounded-lg font-urdu font-bold transition-all ${
              captionLanguage === 'urdu' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            اردو نستعلیق
          </button>
        </div>
      </div>

      {/* 5 Trending Caption Styles Grid */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Caption Style (Words Pop On Beat)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChangeStyle(opt.id)}
              className={`flex flex-col p-3 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                captionStyle === opt.id
                  ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {captionStyle === opt.id && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
              )}
              <span className="font-bold text-xs text-white mb-1">{opt.title}</span>
              <span className="text-[10px] text-slate-400 leading-tight mb-2">{opt.desc}</span>
              <div className="mt-auto px-2 py-1 bg-black/60 rounded border border-white/10 text-center">
                <span className={`font-black text-[11px] bg-gradient-to-r ${opt.color} bg-clip-text text-transparent`}>
                  {opt.preview}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Segments & Word Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
        {/* Left Segment List */}
        <div className="md:col-span-5 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Caption Segments ({captions.length})
          </label>
          {captions.map((seg, idx) => {
            const isSelected = seg.id === (activeSegment?.id || '');
            const isCurrent = currentTime >= seg.start && currentTime <= seg.end;

            return (
              <div
                key={seg.id}
                onClick={() => {
                  setSelectedSegmentId(seg.id);
                  onSeek(seg.start);
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-slate-800 border-blue-400/50 text-slate-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span className="font-bold text-blue-400">#{idx + 1} ({seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s)</span>
                  {isCurrent && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded font-bold">LIVE</span>}
                </div>
                <p className="text-xs font-semibold text-slate-200 line-clamp-2">{seg.text}</p>
                {seg.urduText && (
                  <p className="font-urdu text-xs text-yellow-300/90 mt-1 line-clamp-1">{seg.urduText}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Segment Details & Word Highlight Inspector */}
        <div className="md:col-span-7 flex flex-col gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          {activeSegment ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Editing Segment ({activeSegment.start.toFixed(1)}s - {activeSegment.end.toFixed(1)}s)
                </span>
                <button
                  onClick={() => onSeek(activeSegment.start)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>

              {/* English Text Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">English Subtitle Text</label>
                <input
                  type="text"
                  value={activeSegment.text}
                  onChange={(e) => handleUpdateSegmentText(activeSegment.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Urdu Nastaliq Subtitle Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">اردو ترجمہ / Nastaliq Subtitle</label>
                <input
                  type="text"
                  dir="rtl"
                  value={activeSegment.urduText || ''}
                  onChange={(e) => handleUpdateUrduText(activeSegment.id, e.target.value)}
                  placeholder="اردو سب ٹائٹل درج کریں..."
                  className="w-full font-urdu bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-yellow-300 outline-none focus:border-blue-500"
                />
              </div>

              {/* Word-by-Word Beat Pop & Emoji Customizer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Word-by-Word Beat Pop & Emojis (Click word to toggle highlight)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800">
                  {activeSegment.words?.map((word, wIdx) => {
                    const isWordActive = currentTime >= word.start && currentTime <= word.end;
                    return (
                      <div
                        key={wIdx}
                        className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          word.highlight
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                        } ${isWordActive ? 'ring-2 ring-blue-400 scale-105' : ''}`}
                        onClick={() => handleToggleWordHighlight(activeSegment.id, wIdx)}
                      >
                        {word.emoji && <span className="text-sm">{word.emoji}</span>}
                        <span>{word.text}</span>
                        {word.highlight && <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />}

                        {/* Quick Emoji Menu on Hover */}
                        <div className="hidden group-hover:flex absolute -top-8 left-0 z-30 bg-slate-900 border border-slate-700 p-1 rounded-lg shadow-xl gap-1">
                          {['🔥', '⚡', '🛑', '😱', '🚀', '💰', '📈'].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetWordEmoji(activeSegment.id, wIdx, word.emoji === em ? '' : em);
                              }}
                              className="text-xs hover:scale-125 transition-transform"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">Select a caption segment to inspect words</p>
          )}
        </div>
      </div>
    </div>
  );
};
