import React, { useState } from 'react';
import { 
  Hash, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp, 
  Share2, 
  Flame, 
  Youtube, 
  Music2, 
  Facebook 
} from 'lucide-react';
import { PlatformMetadata, ViralMetadata } from '../types';
import { playSoundFX } from '../utils/audioSynthesizer';

interface ViralSeoPanelProps {
  metadata: ViralMetadata;
  onChangeMetadata: (meta: ViralMetadata) => void;
  videoTopic: string;
}

export const ViralSeoPanel: React.FC<ViralSeoPanelProps> = ({
  metadata,
  onChangeMetadata,
  videoTopic,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'youtube' | 'facebook'>('tiktok');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playSoundFX('pop', 0.6);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    playSoundFX('whoosh');

    try {
      const res = await fetch('/api/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: videoTopic || metadata.title, platform: selectedPlatform }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onChangeMetadata(data.data);
        playSoundFX('cash', 0.8);
      }
    } catch (e) {
      console.error('SEO meta error:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const currentPlatformData: PlatformMetadata =
    metadata.platformSpecific?.[selectedPlatform] || {
      title: metadata.title,
      tags: metadata.hashtags || ['#Shorts', '#Viral', '#FYP'],
      description: metadata.description,
    };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              Viral Title & Hashtag Engine
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SEO Score {metadata.score || 98}/100
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              AI crafts high CTR click-through titles and viral algorithmic hashtags tailored for each platform.
            </p>
          </div>
        </div>

        {/* Regenerate Button */}
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isRegenerating ? 'Generating...' : 'Regenerate SEO'}</span>
        </button>
      </div>

      {/* Platform Switcher Pills */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setSelectedPlatform('tiktok')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedPlatform === 'tiktok'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music2 className="w-4 h-4" />
          <span>TikTok FYP</span>
        </button>

        <button
          onClick={() => setSelectedPlatform('youtube')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedPlatform === 'youtube'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>YouTube Shorts</span>
        </button>

        <button
          onClick={() => setSelectedPlatform('facebook')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedPlatform === 'facebook'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Facebook className="w-4 h-4" />
          <span>Facebook Reels</span>
        </button>
      </div>

      {/* Platform Specific Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Viral Title & Urdu Translation */}
        <div className="flex flex-col gap-3.5 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Viral Hook Title (English)
              </label>
              <button
                onClick={() => handleCopy(currentPlatformData.title || metadata.title, 'title')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'title' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white">
              {currentPlatformData.title || metadata.title}
            </div>
          </div>

          {metadata.urduTitle && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  وائرل عنوان (Urdu Nastaliq)
                </label>
                <button
                  onClick={() => handleCopy(metadata.urduTitle, 'urduTitle')}
                  className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold"
                >
                  {copiedKey === 'urduTitle' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'urduTitle' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 font-urdu bg-slate-900 border border-slate-700 rounded-lg text-sm text-yellow-300">
                {metadata.urduTitle}
              </div>
            </div>
          )}

          {metadata.description && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Video Description & Call to Action
                </label>
                <button
                  onClick={() => handleCopy(metadata.description, 'desc')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'desc' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 leading-relaxed">
                {metadata.description}
              </p>
            </div>
          )}
        </div>

        {/* Right: Hashtags & Platform Strategy */}
        <div className="flex flex-col gap-3.5 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Algorithm Viral Hashtags
              </label>
              <button
                onClick={() => handleCopy((currentPlatformData.tags || metadata.hashtags).join(' '), 'allTags')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                {copiedKey === 'allTags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy All Tags</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-3 bg-slate-900 border border-slate-700 rounded-lg">
              {(currentPlatformData.tags || metadata.hashtags || []).map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopy(tag, `tag_${idx}`)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-md text-xs font-mono font-semibold transition-colors"
                >
                  <span>{tag}</span>
                  {copiedKey === `tag_${idx}` ? (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Viral Strategy Tip */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/20 rounded-lg text-xs text-blue-200 flex items-start gap-2 mt-auto">
            <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-300">Creator Algorithm Tip:</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Posting with the 3-second hook zoom + first 2 hashtags increases 30-day retention by up to 3.8x on {selectedPlatform.toUpperCase()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
