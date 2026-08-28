import React, { useState } from 'react';
import { 
  Download, 
  X, 
  CheckCircle2, 
  Loader2, 
  FileVideo, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { VideoProject } from '../types';
import { playSoundFX } from '../utils/audioSynthesizer';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [fps, setFps] = useState<'60' | '30'>('60');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = () => {
    setIsRendering(true);
    setRenderProgress(5);
    playSoundFX('whoosh');

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRendering(false);
            setDownloadReady(true);
            playSoundFX('cash', 0.9);
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch (e) {}
          }, 400);
          return 100;
        }
        return prev + 12;
      });
    }, 280);
  };

  const handleDownloadFile = () => {
    // Generate simulated high quality video download
    const link = document.createElement('a');
    link.href = project.videoUrl;
    link.download = `${project.title.replace(/\s+/g, '_')}_ProAutoEdit.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSoundFX('pop', 0.8);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d121f] border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-white">
                Export High-Quality Video
              </h2>
              <p className="text-xs text-slate-400">
                Render composite video with burn-in captions, B-Roll, and audio
              </p>
            </div>
          </div>

          {!isRendering && (
            <button
              onClick={() => {
                setDownloadReady(false);
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
          {!downloadReady ? (
            <div className="flex flex-col gap-4">
              {/* Resolution options */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Output Quality & Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1080p', label: '1080p FHD', sub: 'TikTok / Shorts Standard', rec: true },
                    { id: '4k', label: '4K Ultra HD', sub: 'Cinema Quality', rec: false },
                    { id: '720p', label: '720p Fast', sub: 'Lightweight Mobile', rec: false },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResolution(item.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        resolution === item.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.sub}</span>
                      {item.rec && (
                        <span className="mt-1 px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[9px] font-bold">
                          Recommended
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate options */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Framerate (Smooth Motion)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFps('60')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      fps === '60'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⚡ 60 FPS (Ultra Smooth)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFps('30')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      fps === '30'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🎬 30 FPS (Standard Film)
                  </button>
                </div>
              </div>

              {/* Export details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span className="font-bold text-white uppercase">{project.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-white">{(project.editedDuration || 22.5).toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Smart Subtitles:</span>
                  <span className="font-bold text-emerald-400">Burned into Video</span>
                </div>
              </div>

              {/* Render progress or Start button */}
              {isRendering ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Rendering Video... {renderProgress}%
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleStartExport}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-display font-extrabold text-sm rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Export ({resolution.toUpperCase()} @ {fps}fps)</span>
                </button>
              )}
            </div>
          ) : (
            /* Download Ready State */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-display font-black text-xl text-white mb-1">
                Video Render Completed! 🎬
              </h3>
              <p className="text-xs text-slate-300 mb-6 max-w-sm">
                Your video has been rendered in {resolution.toUpperCase()} at {fps}FPS with smart beat captions and music.
              </p>

              <div className="flex flex-col w-full gap-2.5">
                <button
                  onClick={handleDownloadFile}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-display font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4 Video</span>
                </button>

                <button
                  onClick={() => {
                    setDownloadReady(false);
                    onClose();
                  }}
                  className="py-2.5 px-4 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
