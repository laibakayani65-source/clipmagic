import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Youtube, 
  Music2, 
  Facebook, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  Clock, 
  Flame,
  Send,
  Sparkles
} from 'lucide-react';
import { VideoProject } from '../types';
import { playSoundFX } from '../utils/audioSynthesizer';
import confetti from 'canvas-confetti';

interface DirectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const DirectUploadModal: React.FC<DirectUploadModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'youtube', 'facebook']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'instant' | 'schedule'>('instant');
  const [postTitle, setPostTitle] = useState(project.metadata.title);
  const [postTags, setPostTags] = useState(project.metadata.hashtags.join(' '));

  if (!isOpen) return null;

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handlePublish = () => {
    setIsUploading(true);
    playSoundFX('whoosh');

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      playSoundFX('cash', 0.9);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d121f] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-white">
                Direct Multi-Platform Post
              </h2>
              <p className="text-xs text-slate-400">
                1-Click publish to TikTok, YouTube Shorts & Facebook Reels
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              onClick={() => {
                setUploadSuccess(false);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!uploadSuccess ? (
            <div className="flex flex-col gap-4">
              {/* Platforms Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Target Channels (Publish All Simultaneously)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* TikTok */}
                  <button
                    type="button"
                    onClick={() => togglePlatform('tiktok')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlatforms.includes('tiktok')
                        ? 'bg-pink-950/40 border-pink-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Music2 className="w-5 h-5 mb-1 text-pink-400" />
                    <span className="font-bold text-xs">TikTok</span>
                    <span className="text-[10px] text-pink-300 mt-0.5">@creator_pro</span>
                  </button>

                  {/* YouTube Shorts */}
                  <button
                    type="button"
                    onClick={() => togglePlatform('youtube')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlatforms.includes('youtube')
                        ? 'bg-red-950/40 border-red-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Youtube className="w-5 h-5 mb-1 text-red-400" />
                    <span className="font-bold text-xs">Shorts</span>
                    <span className="text-[10px] text-red-300 mt-0.5">Connected</span>
                  </button>

                  {/* Facebook Reels */}
                  <button
                    type="button"
                    onClick={() => togglePlatform('facebook')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlatforms.includes('facebook')
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Facebook className="w-5 h-5 mb-1 text-blue-400" />
                    <span className="font-bold text-xs">FB Reels</span>
                    <span className="text-[10px] text-blue-300 mt-0.5">Connected</span>
                  </button>
                </div>
              </div>

              {/* Title & Hashtags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Video Caption & Viral Hashtags
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white mb-2 outline-none focus:border-cyan-500"
                />
                <textarea
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 outline-none resize-none focus:border-cyan-500"
                />
              </div>

              {/* Schedule / Instant Mode */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleMode('instant')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scheduleMode === 'instant'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 Post Immediately
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode('schedule')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    scheduleMode === 'schedule'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⏰ Peak Time Auto-Schedule (6:00 PM)
                </button>
              </div>

              {/* Post Button */}
              <button
                onClick={handlePublish}
                disabled={isUploading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing & Uploading to {selectedPlatforms.length} Channels...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Video to {selectedPlatforms.length} Platforms</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Success State */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-display font-black text-xl text-white mb-1">
                Published Successfully! 🎉
              </h3>
              <p className="text-xs text-slate-300 mb-6 max-w-sm">
                Your auto-edited video is now live on TikTok, YouTube Shorts, and Facebook Reels with captions and SEO tags.
              </p>

              <button
                onClick={() => {
                  setUploadSuccess(false);
                  onClose();
                }}
                className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Back to Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
