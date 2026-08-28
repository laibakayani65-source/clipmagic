export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type CaptionStyle = 'hormozi' | 'mrbeast' | 'neon' | 'cinematic' | 'karaoke';

export type CaptionLanguage = 'english' | 'urdu' | 'roman-urdu' | 'bilingual';

export interface CaptionWord {
  text: string;
  urdu?: string;
  start: number;
  end: number;
  highlight?: boolean;
  emoji?: string;
  color?: string;
}

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  urduText?: string;
  words: CaptionWord[];
}

export interface SilenceCut {
  id?: string;
  start: number;
  end: number;
  duration: number;
  type: 'silence' | 'filler' | 'mistake';
  description: string;
  active?: boolean;
}

export type HookStyle = 'zoom_punch' | 'shake' | 'flash' | 'spotlight';
export type SoundFXType = 'whoosh' | 'pop' | 'ding' | 'camera' | 'cash' | 'glitch' | 'sub_drop';

export interface HookConfig {
  enabled: boolean;
  text: string;
  urduText?: string;
  style: HookStyle;
  duration: number; // usually 3.0s
  soundFx: SoundFXType;
  zoomLevel?: number; // 1.15 to 1.4
  highlightColor?: string;
}

export interface BRollClip {
  id: string;
  start: number;
  end: number;
  keyword: string;
  url: string;
  thumbnail: string;
  type: 'video' | 'image';
  title: string;
  opacity?: number;
  position: 'fullscreen' | 'pip' | 'split';
}

export type MusicMood = 'energetic' | 'inspiring' | 'chill' | 'dramatic' | 'lofi' | 'suspense';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  mood: MusicMood;
  url: string;
  volume: number;
  bpm: number;
  duration: number;
  license: string;
}

export interface SoundFX {
  id: string;
  time: number;
  type: SoundFXType;
  volume: number;
}

export interface PlatformMetadata {
  title: string;
  tags: string[];
  description?: string;
}

export interface ViralMetadata {
  title: string;
  urduTitle: string;
  description: string;
  hashtags: string[];
  score: number;
  targetPlatform: 'all' | 'tiktok' | 'youtube' | 'facebook';
  platformSpecific: {
    tiktok: PlatformMetadata;
    youtube: PlatformMetadata;
    facebook: PlatformMetadata;
  };
}

export interface VideoProject {
  id: string;
  title: string;
  videoUrl: string;
  videoBlob?: Blob;
  videoDuration: number;
  originalDuration: number;
  editedDuration: number;
  aspectRatio: AspectRatio;
  captionStyle: CaptionStyle;
  captionLanguage: CaptionLanguage;
  captions: CaptionSegment[];
  cuts: SilenceCut[];
  hook: HookConfig;
  brolls: BRollClip[];
  music: MusicTrack | null;
  musicVolume: number;
  autoDucking: boolean;
  soundEffects: SoundFX[];
  metadata: ViralMetadata;
  isAutoEdited: boolean;
  autoResizeMode: 'fit_blur' | 'crop_center' | 'crop_smart';
}

export type AppTab = 'preview' | 'captions' | 'hook' | 'broll' | 'audio' | 'cuts' | 'seo';
