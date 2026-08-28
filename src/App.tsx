import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Upload, 
  Camera, 
  Share2, 
  Download, 
  Sparkles, 
  Subtitles, 
  Zap, 
  Film, 
  Music, 
  Scissors, 
  Hash, 
  Layers, 
  Play, 
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Globe,
  Sliders,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { 
  AspectRatio, 
  CaptionLanguage, 
  CaptionStyle, 
  VideoProject 
} from './types';
import { Navbar } from './components/Navbar';
import { VideoPlayer } from './components/VideoPlayer';
import { AutoEditModal } from './components/AutoEditModal';
import { CaptionsEditor } from './components/CaptionsEditor';
import { HookGenerator } from './components/HookGenerator';
import { BRollManager } from './components/BRollManager';
import { AudioFXManager } from './components/AudioFXManager';
import { SilenceCutManager } from './components/SilenceCutManager';
import { ViralSeoPanel } from './components/ViralSeoPanel';
import { DirectUploadModal } from './components/DirectUploadModal';
import { ExportModal } from './components/ExportModal';
import { WebcamRecorder } from './components/WebcamRecorder';
import { SAMPLE_PROJECTS } from './utils/stockMedia';
import { playSoundFX } from './utils/audioSynthesizer';

export function App() {
  // Main Project State
  const [project, setProject] = useState<VideoProject>(SAMPLE_PROJECTS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'captions' | 'hook' | 'broll' | 'audio' | 'cuts' | 'seo'>('overview');
  
  // Playback State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [isAutoEditModalOpen, setIsAutoEditModalOpen] = useState(false);
  const [isDirectUploadOpen, setIsDirectUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // Sync video element with play state
  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleChangeAspectRatio = (ratio: AspectRatio) => {
    setProject((prev) => ({ ...prev, aspectRatio: ratio }));
    playSoundFX('pop', 0.5);
  };

  const handleChangeLanguage = (lang: CaptionLanguage) => {
    setProject((prev) => ({ ...prev, captionLanguage: lang }));
    playSoundFX('pop', 0.4);
  };

  const handleSelectSample = (sampleId: string) => {
    const selected = SAMPLE_PROJECTS.find((p) => p.id === sampleId);
    if (selected) {
      setProject({ ...selected });
      setCurrentTime(0);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      playSoundFX('whoosh');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProject((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ''),
        videoUrl: url,
        originalDuration: 25,
        editedDuration: 21.5,
        isAutoEdited: false,
      }));
      setCurrentTime(0);
      setIsPlaying(false);
      playSoundFX('pop');
      // Automatically prompt Auto Edit modal for the uploaded video!
      setIsAutoEditModalOpen(true);
    }
  };

  const handleVideoRecorded = (videoUrl: string, duration: number) => {
    setProject((prev) => ({
      ...prev,
      title: 'Mobile Camera Recording',
      videoUrl,
      originalDuration: duration,
      editedDuration: Math.max(5, duration - 3),
      isAutoEdited: false,
    }));
    setCurrentTime(0);
    setIsPlaying(false);
    setIsAutoEditModalOpen(true);
  };

  const handleApplyAutoEdit = (newData: Partial<VideoProject>) => {
    setProject((prev) => ({ ...prev, ...newData }));
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handlePreviewHook = () => {
    handleSeek(0);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Navbar with Bold Typography Theme */}
      <Navbar
        currentProject={project}
        onSelectPreset={(p) => {
          setProject(p);
          setCurrentTime(0);
          setIsPlaying(false);
          if (videoRef.current) videoRef.current.currentTime = 0;
          playSoundFX('whoosh');
        }}
        captionLanguage={project.captionLanguage}
        onChangeLanguage={handleChangeLanguage}
        onOpenAutoEdit={() => setIsAutoEditModalOpen(true)}
        onOpenDirectUpload={() => setIsDirectUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenWebcam={() => setIsRecorderOpen(true)}
        onUploadCustomVideo={handleFileUpload}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
        {/* Flagship Hero Action Banner - Bold Typography Studio Box */}
        <div className="relative w-full rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20 p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl flex flex-col items-center gap-4 z-10">
            {/* Pulsing Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-600/5 shadow-inner">
              <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 animate-pulse" />
            </div>

            {/* Main Headline & Subtitle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20 text-[10px] uppercase tracking-widest font-bold">
                  AI Video Engine v4.2 Stable
                </span>
                {project.isAutoEdited && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Optimized
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {project.title || 'Drop your raw footage'}
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                AI removes dead air silences, syncs Urdu & English beat subtitles, punches 3-second hook zooms, and adds background audio in 1-click.
              </p>
            </div>

            {/* Action Buttons: Big "EDIT AUTOMATICALLY" and Quick Upload/Record */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-big-auto-edit"
                onClick={() => setIsAutoEditModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-2xl shadow-blue-600/40 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-cyan-200" />
                <span>EDIT AUTOMATICALLY</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 sm:py-4 rounded-2xl font-bold text-sm border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload Video</span>
              </button>

              <button
                onClick={() => setIsRecorderOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 sm:py-4 rounded-2xl font-bold text-sm border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-rose-400" />
                <span>Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Highlight Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AUTO HOOK</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI adds a text punch zoom and cinematic SFX in the first 3 seconds for 40% higher retention.
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">BEAT SYNC</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trending creator captions pop on every spoken beat. Urdu Nastaliq and English typography enabled.
            </p>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 p-4 sm:p-5 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">SILENCE TRIM</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-detected {project.cuts?.length || 8} pauses and filler words. Click 'Edit Automatically' to trim dead air.
            </p>
          </div>
        </div>

        {/* Live Interactive Video Viewport */}
        <VideoPlayer
          project={project}
          onChangeAspectRatio={handleChangeAspectRatio}
          videoRef={videoRef}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
        />

        {/* AI Toolkit Navigation Tabs */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden lg:inline mr-2">
                AI Toolkit:
              </span>

              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('captions')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'captions'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Subtitles className="w-4 h-4" />
                <span>Smart Captions ({project.captions?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('hook')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'hook'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Auto Hook (0-3s)</span>
              </button>

              <button
                onClick={() => setActiveTab('broll')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'broll'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Auto B-Roll ({project.brolls?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Smart Sound ({project.soundEffects?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('cuts')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'cuts'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span>Silence Cuts ({project.cuts?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('seo')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  activeTab === 'seo'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>Viral SEO</span>
              </button>
            </div>

            {/* Quick Multi-Platform Post & Export */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsDirectUploadOpen(true)}
                className="py-2 px-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-200 text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Direct Upload</span>
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export 1080p</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="w-full">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Quick summary metrics */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                          Performance Report
                        </p>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          Auto-Edit Optimization Metrics
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-cyan-300 bg-blue-600/10 border border-blue-600/20 px-3 py-1 rounded-full font-bold">
                        Viral Score: {project.metadata?.score || 98}/100
                      </span>
                    </div>

                    {/* 4 Performance Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-[#020617] rounded-xl border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                          Pacing Boost
                        </span>
                        <span className="text-xl font-black text-blue-400 font-display">+28%</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Fast jump cuts</span>
                      </div>

                      <div className="p-3.5 bg-[#020617] rounded-xl border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                          Silence Trimmed
                        </span>
                        <span className="text-xl font-black text-rose-400 font-display">
                          -{project.cuts?.reduce((a, b) => a + b.duration, 0).toFixed(1)}s
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {project.cuts?.length} dead air cuts
                        </span>
                      </div>

                      <div className="p-3.5 bg-[#020617] rounded-xl border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                          Hook Retention
                        </span>
                        <span className="text-xl font-black text-purple-400 font-display">3.0s</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">1.3x punch zoom</span>
                      </div>

                      <div className="p-3.5 bg-[#020617] rounded-xl border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">
                          Copyright Safe
                        </span>
                        <span className="text-xl font-black text-emerald-400 font-display">100%</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Commercial audio</span>
                      </div>
                    </div>

                    {/* Applied Automations Checklist */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        Active Automations on this Video
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#020617] border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium">
                            <strong className="text-white">Smart Captions:</strong> {project.captionStyle.toUpperCase()} style (Urdu + EN)
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#020617] border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium">
                            <strong className="text-white">Auto Hook (0-3s):</strong> Zoom punch + impact sound
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#020617] border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium">
                            <strong className="text-white">Auto B-Roll:</strong> {project.brolls?.length} stock video cutaways
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#020617] border border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 font-medium">
                            <strong className="text-white">Mood Matched Music:</strong> {project.music?.title || 'Energetic Beat'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Viral Suggestions & Direct Upload */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {/* Viral Suggestions Box from Design HTML */}
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">
                        Viral Suggestion
                      </p>
                      <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-400 italic">#TrendingTitle</p>
                        <p className="text-sm font-bold text-white leading-snug">
                          {project.metadata?.title || 'How I Edited This In 1 Click 🚀'}
                        </p>
                        {project.metadata?.urduTitle && (
                          <p className="font-urdu text-xs text-yellow-300">{project.metadata.urduTitle}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.metadata?.hashtags?.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setIsDirectUploadOpen(true)}
                        className="w-full py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-sm cursor-pointer shadow-md"
                      >
                        <Share2 className="w-4 h-4 text-black" />
                        <span>Direct Upload</span>
                      </button>
                      <p className="text-[10px] text-center text-slate-500">
                        Post to TikTok, Reels, and Shorts simultaneously
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'captions' && (
              <CaptionsEditor
                captions={project.captions || []}
                onChangeCaptions={(captions) => setProject({ ...project, captions })}
                captionStyle={project.captionStyle}
                onChangeStyle={(captionStyle) => {
                  setProject({ ...project, captionStyle });
                  playSoundFX('pop', 0.5);
                }}
                captionLanguage={project.captionLanguage}
                onChangeLanguage={handleChangeLanguage}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            )}

            {activeTab === 'hook' && (
              <HookGenerator
                hook={project.hook}
                onChangeHook={(hook) => setProject({ ...project, hook })}
                onPreviewHook={handlePreviewHook}
              />
            )}

            {activeTab === 'broll' && (
              <BRollManager
                brolls={project.brolls || []}
                onChangeBRolls={(brolls) => setProject({ ...project, brolls })}
                videoDuration={project.editedDuration || 22.5}
                onSeek={handleSeek}
              />
            )}

            {activeTab === 'audio' && (
              <AudioFXManager
                currentMusic={project.music}
                musicVolume={project.musicVolume}
                autoDucking={project.autoDucking}
                onChangeMusic={(music) => setProject({ ...project, music })}
                onChangeVolume={(musicVolume) => setProject({ ...project, musicVolume })}
                onToggleAutoDucking={(autoDucking) => setProject({ ...project, autoDucking })}
                soundEffects={project.soundEffects || []}
                onChangeSoundEffects={(soundEffects) => setProject({ ...project, soundEffects })}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            )}

            {activeTab === 'cuts' && (
              <SilenceCutManager
                cuts={project.cuts || []}
                originalDuration={project.originalDuration}
                editedDuration={project.editedDuration}
                onChangeCuts={(cuts) => setProject({ ...project, cuts })}
                onSeek={handleSeek}
              />
            )}

            {activeTab === 'seo' && (
              <ViralSeoPanel
                metadata={project.metadata}
                onChangeMetadata={(metadata) => setProject({ ...project, metadata })}
                videoTopic={project.title}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer matching Bold Typography Design */}
      <footer className="h-14 bg-[#020617] border-t border-slate-800 px-6 sm:px-8 flex items-center justify-between mt-8 text-slate-500">
        <div className="flex items-center gap-3 sm:gap-4 text-[10px] font-medium uppercase tracking-widest">
          <span>Cloud Sync: Active</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>AI Model: v4.2 Stable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Processing Engine Ready
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AutoEditModal
        isOpen={isAutoEditModalOpen}
        onClose={() => setIsAutoEditModalOpen(false)}
        project={project}
        onApplyAutoEdit={handleApplyAutoEdit}
        currentLanguage={project.captionLanguage}
      />

      <DirectUploadModal
        isOpen={isDirectUploadOpen}
        onClose={() => setIsDirectUploadOpen(false)}
        project={project}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      <WebcamRecorder
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onVideoRecorded={handleVideoRecorded}
      />
    </div>
  );
}

export default App;
