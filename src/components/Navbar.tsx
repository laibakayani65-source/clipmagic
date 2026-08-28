import React from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Share2, 
  Video, 
  Languages, 
  Layers, 
  Camera,
  PlaySquare,
  Wand2
} from 'lucide-react';
import { CaptionLanguage, VideoProject } from '../types';
import { PRESET_PROJECTS } from '../utils/stockMedia';

interface NavbarProps {
  currentProject: VideoProject;
  onSelectPreset: (project: VideoProject) => void;
  onOpenAutoEdit: () => void;
  onOpenExport: () => void;
  onOpenDirectUpload: () => void;
  onOpenWebcam: () => void;
  onUploadCustomVideo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  captionLanguage: CaptionLanguage;
  onChangeLanguage: (lang: CaptionLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  onSelectPreset,
  onOpenAutoEdit,
  onOpenExport,
  onOpenDirectUpload,
  onOpenWebcam,
  onUploadCustomVideo,
  captionLanguage,
  onChangeLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A] border-b border-slate-800 px-4 sm:px-8 py-3.5 font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 text-base tracking-tight shrink-0">
            PA
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                ProAuto <span className="text-blue-500 italic">Edit</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 border border-blue-600/20 uppercase tracking-widest">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-medium">
              Shorts • TikTok • Reels Auto Editor
            </p>
          </div>
        </div>

        {/* Center: Presets & Language Toggle */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <div className="relative hidden md:flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl p-1">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <select
              value={currentProject.id}
              onChange={(e) => {
                const found = PRESET_PROJECTS.find(p => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-200 py-1.5 px-2 outline-none cursor-pointer hover:text-white"
            >
              <option value="preset-talking-head-urdu-eng" className="bg-[#0F172A] text-white">
                🎙️ Urdu + Eng Talking Head
              </option>
              <option value="preset-fitness-vlog" className="bg-[#0F172A] text-white">
                ⚡ 5 AM Morning Routine Reel
              </option>
              {currentProject.id.startsWith('custom-') && (
                <option value={currentProject.id} className="bg-[#0F172A] text-white">
                  📁 {currentProject.title}
                </option>
              )}
            </select>
          </div>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-full px-3.5 py-1.5 text-xs font-semibold gap-3">
            <button
              onClick={() => onChangeLanguage('english')}
              className={`transition-colors font-bold ${
                captionLanguage === 'english'
                  ? 'text-blue-400 underline underline-offset-4 decoration-2 decoration-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => onChangeLanguage('bilingual')}
              className={`transition-colors font-bold ${
                captionLanguage === 'bilingual'
                  ? 'text-blue-400 underline underline-offset-4 decoration-2 decoration-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN+اردو
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => onChangeLanguage('urdu')}
              className={`font-urdu font-bold transition-colors ${
                captionLanguage === 'urdu'
                  ? 'text-blue-400 underline underline-offset-4 decoration-2 decoration-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اردو
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Record Webcam */}
          <button
            onClick={onOpenWebcam}
            title="Record from Camera"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>Record</span>
          </button>

          {/* Upload Custom Video */}
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Upload</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onUploadCustomVideo}
            />
          </label>

          {/* Big Edit Automatically Button */}
          <button
            onClick={onOpenAutoEdit}
            className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-white animate-pulse" />
            <span className="tracking-wide font-black">Auto Edit</span>
          </button>

          {/* Direct Post */}
          <button
            onClick={onOpenDirectUpload}
            title="Direct Post to TikTok / YouTube / Reels"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Post</span>
          </button>

          {/* Export Video */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* User Profile Avatar Pill */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border border-slate-700 shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            AI
          </div>
        </div>
      </div>
    </header>
  );
};
