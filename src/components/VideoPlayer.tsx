import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sparkles, 
  Scissors, 
  Zap, 
  Film, 
  Music, 
  Smartphone, 
  Monitor, 
  Square,
  RectangleVertical
} from 'lucide-react';
import { 
  AspectRatio, 
  CaptionLanguage, 
  CaptionStyle, 
  VideoProject,
  SilenceCut 
} from '../types';
import { playSoundFX, bgMusicSynth } from '../utils/audioSynthesizer';

interface VideoPlayerProps {
  project: VideoProject;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  onChangeAspectRatio,
  videoRef,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onTogglePlay,
  onSeek,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(project.editedDuration || 22.5);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const lastTriggeredSfxRef = useRef<Set<string>>(new Set());

  // Background music & SFX synchronizer
  useEffect(() => {
    if (isPlaying && project.music) {
      bgMusicSynth.start(project.music.mood, project.music.bpm, project.musicVolume);
    } else {
      bgMusicSynth.stop();
    }
    return () => {
      bgMusicSynth.stop();
    };
  }, [isPlaying, project.music?.mood, project.musicVolume]);

  // Trigger SFX as playback proceeds
  useEffect(() => {
    if (!isPlaying) {
      lastTriggeredSfxRef.current.clear();
      return;
    }

    project.soundEffects?.forEach(sfx => {
      if (Math.abs(currentTime - sfx.time) < 0.25 && !lastTriggeredSfxRef.current.has(sfx.id)) {
        playSoundFX(sfx.type, sfx.volume);
        lastTriggeredSfxRef.current.add(sfx.id);
      }
    });

    // Reset passed sound effects if user seeks backward
    Array.from(lastTriggeredSfxRef.current).forEach(id => {
      const sfx = project.soundEffects?.find(s => s.id === id);
      if (sfx && Math.abs(currentTime - sfx.time) > 1.5) {
        lastTriggeredSfxRef.current.delete(id);
      }
    });
  }, [currentTime, isPlaying, project.soundEffects]);

  const totalD = project.editedDuration || 22.5;

  // Hook Zoom calculation
  const isHookActive = project.hook?.enabled && currentTime <= project.hook.duration;
  const hookZoom = isHookActive ? (project.hook.zoomLevel || 1.28) : 1.0;

  // Active B-Roll
  const activeBroll = project.brolls?.find(br => currentTime >= br.start && currentTime <= br.end);

  // Active Caption Segment
  const activeSegment = project.captions?.find(c => currentTime >= c.start && currentTime <= c.end);
  const activeWord = activeSegment?.words?.find(w => currentTime >= w.start && currentTime <= w.end);

  // Active Silence Cut notice
  const activeCut = project.cuts?.find(c => Math.abs(currentTime - c.start) < 0.3 && c.active !== false);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * (project.editedDuration || 22.5);
    onSeek(targetTime);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverTime(ratio * (project.editedDuration || 22.5));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-[#0F172A] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
      {/* Aspect Ratio Selector Bar */}
      <div className="w-full flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-[#020617] p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onChangeAspectRatio('9:16')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              project.aspectRatio === '9:16'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16 TikTok / Shorts</span>
          </button>

          <button
            onClick={() => onChangeAspectRatio('16:9')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              project.aspectRatio === '16:9'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>16:9 YouTube</span>
          </button>

          <button
            onClick={() => onChangeAspectRatio('1:1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              project.aspectRatio === '1:1'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1 Square</span>
          </button>

          <button
            onClick={() => onChangeAspectRatio('4:5')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              project.aspectRatio === '4:5'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RectangleVertical className="w-3.5 h-3.5" />
            <span>4:5 FB Post</span>
          </button>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 text-xs">
          {isHookActive && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold animate-pulse text-[10px] uppercase tracking-wider">
              <Zap className="w-3 h-3 text-rose-400" />
              Hook Active ({currentTime.toFixed(1)}s)
            </span>
          )}
          {activeBroll && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px] uppercase tracking-wider">
              <Film className="w-3 h-3 text-blue-400" />
              B-Roll: {activeBroll.title}
            </span>
          )}
          {project.music && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
              <Music className="w-3 h-3 text-blue-400" />
              {project.music.title.substring(0, 16)}...
            </span>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full flex items-center justify-center bg-[#020617] rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[460px] max-h-[560px] p-3 border border-slate-800/80">
        {/* Dynamic Aspect Ratio Box */}
        <div
          style={{
            aspectRatio: project.aspectRatio === '9:16' ? '9/16' : project.aspectRatio === '16:9' ? '16/9' : project.aspectRatio === '1:1' ? '1/1' : '4/5',
            maxHeight: '520px',
            maxWidth: '100%',
          }}
          className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center select-none"
        >
          {/* Video element */}
          <div
            className="w-full h-full relative overflow-hidden transition-transform duration-300 ease-out"
            style={{
              transform: `scale(${hookZoom})`,
            }}
          >
            <video
              ref={videoRef}
              src={project.videoUrl}
              crossOrigin="anonymous"
              playsInline
              muted={isMuted}
              loop
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Active B-Roll Overlay (Fullscreen or PIP) */}
          {activeBroll && (
            <div
              className={`absolute transition-opacity duration-300 z-10 ${
                activeBroll.position === 'pip'
                  ? 'top-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/30'
                  : 'inset-0 w-full h-full'
              }`}
            >
              <img
                src={activeBroll.thumbnail}
                alt={activeBroll.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-bold text-cyan-300 uppercase tracking-widest">
                B-Roll
              </div>
            </div>
          )}

          {/* 3-Second Hook Headline Overlay */}
          {isHookActive && (
            <div className="absolute top-10 sm:top-14 inset-x-4 flex flex-col items-center justify-center z-20 pointer-events-none animate-bounce">
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-display font-black text-sm sm:text-base md:text-lg px-4 py-1.5 rounded-full shadow-2xl shadow-red-600/60 border border-red-400/50 uppercase tracking-wider text-center flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>{project.hook.text}</span>
              </div>
              {project.hook.urduText && (
                <div className="mt-1.5 font-urdu font-bold text-xs sm:text-sm text-yellow-300 bg-black/80 px-3 py-0.5 rounded-full border border-yellow-500/30">
                  {project.hook.urduText}
                </div>
              )}
            </div>
          )}

          {/* Smart Beat-Synced Captions Overlay */}
          {activeSegment && (
            <div className="absolute bottom-12 sm:bottom-16 inset-x-3 flex flex-col items-center justify-center text-center z-20 pointer-events-none px-2">
              {project.captionStyle === 'hormozi' && (
                <div className="flex flex-col items-center">
                  {activeWord ? (
                    <div className="flex items-center gap-1.5 transform scale-110 sm:scale-125 transition-transform duration-100">
                      {activeWord.emoji && <span className="text-2xl sm:text-3xl">{activeWord.emoji}</span>}
                      <span
                        className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-stroke-thick tracking-tight uppercase"
                        style={{ color: activeWord.color || '#fde047' }}
                      >
                        {activeWord.text}
                      </span>
                    </div>
                  ) : (
                    <span className="font-display font-black text-xl sm:text-2xl text-white text-stroke-black uppercase">
                      {activeSegment.text}
                    </span>
                  )}
                  {/* Urdu Nastaliq Subtitle */}
                  {activeSegment.urduText && (project.captionLanguage === 'urdu' || project.captionLanguage === 'bilingual') && (
                    <span className="font-urdu font-bold text-cyan-300 text-base sm:text-lg mt-1 text-stroke-black">
                      {activeSegment.urduText}
                    </span>
                  )}
                </div>
              )}

              {project.captionStyle === 'mrbeast' && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 transform scale-110 sm:scale-120">
                    {activeWord?.emoji && <span className="text-2xl">{activeWord.emoji}</span>}
                    <span className="font-anton text-2xl sm:text-3xl md:text-4xl text-stroke-thick text-yellow-400 text-glow-yellow tracking-wider uppercase">
                      {activeWord ? activeWord.text : activeSegment.text}
                    </span>
                  </div>
                  {activeSegment.urduText && (project.captionLanguage === 'urdu' || project.captionLanguage === 'bilingual') && (
                    <span className="font-urdu font-bold text-yellow-200 text-sm sm:text-base mt-1 text-stroke-black">
                      {activeSegment.urduText}
                    </span>
                  )}
                </div>
              )}

              {project.captionStyle === 'neon' && (
                <div className="flex flex-col items-center">
                  <span className="font-display font-black text-xl sm:text-2xl md:text-3xl text-cyan-400 text-glow-neon uppercase">
                    {activeWord ? `${activeWord.emoji ? activeWord.emoji + ' ' : ''}${activeWord.text}` : activeSegment.text}
                  </span>
                  {activeSegment.urduText && (
                    <span className="font-urdu font-bold text-cyan-200 text-sm sm:text-base mt-1">
                      {activeSegment.urduText}
                    </span>
                  )}
                </div>
              )}

              {project.captionStyle === 'cinematic' && (
                <div className="bg-black/80 px-4 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <span className="font-sans font-bold text-sm sm:text-base text-white">
                    {activeSegment.text}
                  </span>
                  {activeSegment.urduText && (
                    <p className="font-urdu text-xs sm:text-sm text-slate-300 mt-0.5">
                      {activeSegment.urduText}
                    </p>
                  )}
                </div>
              )}

              {project.captionStyle === 'karaoke' && (
                <div className="flex flex-wrap justify-center gap-1 bg-black/70 px-3 py-1.5 rounded-xl border border-slate-700">
                  {activeSegment.words?.map((w, idx) => {
                    const isCurrent = currentTime >= w.start && currentTime <= w.end;
                    const hasPassed = currentTime > w.end;
                    return (
                      <span
                        key={idx}
                        className={`font-bold text-xs sm:text-sm transition-colors duration-100 ${
                          isCurrent
                            ? 'text-cyan-300 scale-110 font-extrabold'
                            : hasPassed
                            ? 'text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {w.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Play Overlay Trigger */}
          <button
            onClick={onTogglePlay}
            className={`absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all z-10 cursor-pointer ${
              isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/50 hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1" />}
            </div>
          </button>
        </div>
      </div>

      {/* Multi-Track Interactive Timeline Bar */}
      <div className="w-full mt-4 flex flex-col gap-2">
        {/* Timeline Tracks Legend / Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span className="text-blue-400 font-bold">
            {currentTime.toFixed(1)}s / {(project.editedDuration || 22.5).toFixed(1)}s
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500"></span> Hook (0-3s)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500"></span> B-Roll</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-rose-500"></span> Silence Cuts</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-yellow-400"></span> SFX</span>
          </div>
        </div>

        {/* Interactive Multi-Layer Scrubber Bar */}
        <div
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineMouseMove}
          onMouseEnter={() => setIsHoveringTimeline(true)}
          onMouseLeave={() => { setIsHoveringTimeline(false); setHoverTime(null); }}
          className="relative w-full h-8 bg-[#020617] border border-slate-800 rounded-xl overflow-hidden cursor-pointer select-none group"
        >
          {/* Hook Zone (0 to 3s) */}
          <div
            style={{ width: `${(Math.min(3.0, totalD) / totalD) * 100}%` }}
            className="absolute left-0 top-0 bottom-0 bg-purple-600/30 border-r border-purple-500/50"
            title="3-Second Hook Zone"
          />

          {/* B-Roll Segments */}
          {project.brolls?.map((br) => (
            <div
              key={br.id}
              style={{
                left: `${(br.start / totalD) * 100}%`,
                width: `${((br.end - br.start) / totalD) * 100}%`,
              }}
              className="absolute top-1 bottom-1 bg-blue-500/40 border-l border-r border-blue-400/80 rounded-sm"
              title={`B-Roll: ${br.title}`}
            />
          ))}

          {/* Silence Cuts Removed */}
          {project.cuts?.map((cut, idx) => (
            <div
              key={idx}
              style={{
                left: `${(cut.start / totalD) * 100}%`,
                width: `${Math.max(1, (cut.duration / totalD) * 100)}%`,
              }}
              className="absolute top-0 bottom-0 bg-rose-500/30 border-l border-rose-500/50"
              title={`Cut: ${cut.description}`}
            />
          ))}

          {/* Sound FX Cue Dots */}
          {project.soundEffects?.map((sfx) => (
            <div
              key={sfx.id}
              style={{ left: `${(sfx.time / totalD) * 100}%` }}
              className="absolute top-0.5 w-1.5 h-7 bg-yellow-400 rounded-full shadow-sm shadow-yellow-400 z-10 -ml-0.5"
              title={`SFX: ${sfx.type}`}
            />
          ))}

          {/* Progress fill */}
          <div
            style={{ width: `${(currentTime / totalD) * 100}%` }}
            className="absolute left-0 top-0 bottom-0 bg-blue-600/30 pointer-events-none"
          />

          {/* Playhead Marker */}
          <div
            style={{ left: `${(currentTime / totalD) * 100}%` }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50 pointer-events-none z-20"
          >
            <div className="w-3 h-3 bg-white rounded-full -ml-1 -mt-0.5 shadow-md"></div>
          </div>

          {/* Hover Tooltip */}
          {isHoveringTimeline && hoverTime !== null && (
            <div
              style={{ left: `${(hoverTime / totalD) * 100}%` }}
              className="absolute -top-7 transform -translate-x-1/2 bg-[#020617] text-white text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 pointer-events-none z-30"
            >
              {hoverTime.toFixed(1)}s
            </div>
          )}
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between mt-1 text-slate-300">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => onSeek(0)}
              title="Restart"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Fast SFX Test preview pill */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Test FX:</span>
            <button
              onClick={() => playSoundFX('whoosh')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              💨 Whoosh
            </button>
            <button
              onClick={() => playSoundFX('pop')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              🫧 Pop
            </button>
            <button
              onClick={() => playSoundFX('cash')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              💰 Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
