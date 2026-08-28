import React, { useState } from 'react';
import { 
  Wand2, 
  CheckCircle2, 
  Loader2, 
  Scissors, 
  Subtitles, 
  Zap, 
  Film, 
  Music, 
  Hash, 
  X, 
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import { CaptionLanguage, VideoProject } from '../types';
import { playSoundFX } from '../utils/audioSynthesizer';

interface AutoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  onApplyAutoEdit: (newProjectData: Partial<VideoProject>) => void;
  currentLanguage: CaptionLanguage;
}

export const AutoEditModal: React.FC<AutoEditModalProps> = ({
  isOpen,
  onClose,
  project,
  onApplyAutoEdit,
  currentLanguage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [topicInput, setTopicInput] = useState(project.title || 'Creator Video Editing Secret');
  const [selectedLanguage, setSelectedLanguage] = useState<CaptionLanguage>(currentLanguage || 'bilingual');

  // Feature Toggles
  const [enableSilenceRemoval, setEnableSilenceRemoval] = useState(true);
  const [enableSmartCaptions, setEnableSmartCaptions] = useState(true);
  const [enableAutoHook, setEnableAutoHook] = useState(true);
  const [enableAutoBRoll, setEnableAutoBRoll] = useState(true);
  const [enableAutoMusic, setEnableAutoMusic] = useState(true);
  const [enableViralSeo, setEnableViralSeo] = useState(true);

  if (!isOpen) return null;

  const steps = [
    { label: 'Analyzing speech audio waveform & frequencies', icon: Scissors, color: 'text-rose-400' },
    { label: 'Removing dead air silences, "umm", and filler mistakes', icon: Scissors, color: 'text-amber-400' },
    { label: 'Generating Urdu & English beat-synced smart captions', icon: Subtitles, color: 'text-emerald-400' },
    { label: 'Crafting explosive first 3-second hook & zoom punch', icon: Zap, color: 'text-purple-400' },
    { label: 'Matching script keywords with viral stock B-Roll clips', icon: Film, color: 'text-blue-400' },
    { label: 'Detecting video mood & mixing copyright-free music', icon: Music, color: 'text-indigo-400' },
    { label: 'Optimizing viral hashtags & multi-platform titles', icon: Hash, color: 'text-cyan-400' },
  ];

  const handleStartAutoEdit = async () => {
    setIsProcessing(true);
    setPipelineProgress(5);
    setCurrentStep(0);
    playSoundFX('whoosh');

    // Simulate animated step progress while backend computes
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          playSoundFX('pop', 0.5);
          return prev + 1;
        }
        return prev;
      });
      setPipelineProgress((prev) => Math.min(92, prev + 14));
    }, 450);

    try {
      const response = await fetch('/api/auto-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoName: project.title,
          duration: project.originalDuration || 25,
          sampleTopic: topicInput,
          language: selectedLanguage,
        }),
      });

      const result = await response.json();
      clearInterval(stepInterval);
      setPipelineProgress(100);
      setCurrentStep(steps.length - 1);
      playSoundFX('cash', 0.9);

      setTimeout(() => {
        if (result.success && result.data) {
          const d = result.data;
          onApplyAutoEdit({
            title: d.metadata?.title || project.title,
            editedDuration: d.editedDuration || project.editedDuration,
            cuts: enableSilenceRemoval ? d.cuts : project.cuts,
            captions: enableSmartCaptions ? d.captions : project.captions,
            hook: enableAutoHook ? d.hook : project.hook,
            brolls: enableAutoBRoll ? d.brolls : project.brolls,
            soundEffects: d.soundEffects || project.soundEffects,
            metadata: enableViralSeo ? d.metadata : project.metadata,
            captionLanguage: selectedLanguage,
            isAutoEdited: true,
          });
        }
        setIsProcessing(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      clearInterval(stepInterval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#020617]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">
                  1-Click AI Auto Video Editor
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-400 font-bold border border-blue-600/20 uppercase tracking-widest">
                  Turbo Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Transform raw footage into viral Shorts, TikToks, or Reels in seconds
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isProcessing ? (
            <div className="flex flex-col gap-5">
              {/* Topic / Prompt */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Video Topic or Context (اردو / English)
                </label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., 3 Habits to Stop Wasting Time, Online Earning Urdu Guide..."
                  className="w-full bg-[#020617] border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              {/* Language Preset Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Caption & Translation Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('bilingual')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedLanguage === 'bilingual'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#020617] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-sm">EN + اردو (Bilingual)</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">English beat + Urdu Sub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('english')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedLanguage === 'english'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#020617] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-sm">English Creator</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Hormozi / Beast Words</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('urdu')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedLanguage === 'urdu'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#020617] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-urdu font-bold text-base">خالص اردو نستعلیق</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">اردو بولنے والے کریئٹرز</span>
                  </button>
                </div>
              </div>

              {/* 6 Core Automated Actions Grid */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  AI Auto-Edit Pipeline Actions Included:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Action 1 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableSilenceRemoval}
                      onChange={(e) => setEnableSilenceRemoval(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-rose-400" />
                        Silence & Filler Removal
                      </p>
                      <p className="text-slate-400 text-[11px]">Removes dead air, "umm", "yani", and pauses</p>
                    </div>
                  </label>

                  {/* Action 2 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableSmartCaptions}
                      onChange={(e) => setEnableSmartCaptions(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
                        Beat-Synced Captions
                      </p>
                      <p className="text-slate-400 text-[11px]">Hormozi / MrBeast animated pop subtitles</p>
                    </div>
                  </label>

                  {/* Action 3 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableAutoHook}
                      onChange={(e) => setEnableAutoHook(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        3-Sec Auto Hook + Zoom
                      </p>
                      <p className="text-slate-400 text-[11px]">Punch-in camera zoom & attention headline</p>
                    </div>
                  </label>

                  {/* Action 4 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableAutoBRoll}
                      onChange={(e) => setEnableAutoBRoll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-blue-400" />
                        Auto B-Roll Insertion
                      </p>
                      <p className="text-slate-400 text-[11px]">Overlays matching stock videos on script</p>
                    </div>
                  </label>

                  {/* Action 5 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableAutoMusic}
                      onChange={(e) => setEnableAutoMusic(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-indigo-400" />
                        Music + Sound FX
                      </p>
                      <p className="text-slate-400 text-[11px]">Mood detection & copyright-free beat loop</p>
                    </div>
                  </label>

                  {/* Action 6 */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enableViralSeo}
                      onChange={(e) => setEnableViralSeo(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-cyan-400" />
                        Viral Hashtags & Titles
                      </p>
                      <p className="text-slate-400 text-[11px]">Optimized for TikTok, Shorts, and Reels</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartAutoEdit}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base tracking-wide flex items-center justify-center gap-2.5 shadow-2xl shadow-blue-600/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Wand2 className="w-5 h-5" />
                <span>EDIT AUTOMATICALLY (1-CLICK)</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          ) : (
            /* Live Progress State */
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-20 h-20 mb-6">
                <div className="w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <h3 className="font-bold text-xl text-white mb-2 text-center">
                AI Editing in Progress...
              </h3>
              <p className="text-xs text-slate-400 mb-6 text-center max-w-md">
                Gemini 3.7 Flash engine is analyzing video frequencies, removing pauses, synchronizing beat captions, and generating viral hooks.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-[#020617] border border-slate-800 rounded-full h-3 mb-6 overflow-hidden p-0.5">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>

              {/* Step checklist */}
              <div className="w-full flex flex-col gap-2 max-w-lg">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all ${
                        isCurrent
                          ? 'bg-blue-600/10 border border-blue-600/30 text-white font-bold'
                          : isDone
                          ? 'bg-[#020617] text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                      ) : (
                        <StepIcon className="w-4 h-4 text-slate-700 shrink-0" />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
