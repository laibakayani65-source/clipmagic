import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Full Auto-Edit AI Pipeline endpoint
app.post('/api/auto-edit', async (req, res) => {
  try {
    const { videoName, duration = 30, sampleTopic = 'creators growth', language = 'english', transcript = '' } = req.body;
    const ai = getAiClient();

    let prompt = `You are ProAuto Edit, a world-class AI automated video editor specialized for viral TikTok, YouTube Shorts, and Facebook Reels.
Analyze this video content (Topic: "${sampleTopic}", Video: "${videoName}", Duration: ${duration}s, Transcript provided: "${transcript || 'auto detect speech'}").
Language mode: ${language} (Urdu / English / Roman Urdu creators).

Task:
1. Detect and remove awkward silences, pauses, and filler words ("umm", "uh", "like", "basically", "yani", "matlab", "acha", stutters) to create a high-retention fast-paced cut.
2. Generate dynamic word-by-word Smart Captions with exact start/end timestamps (seconds), Roman Urdu / Urdu Nastaliq translation, highlight words, and contextual emojis.
3. Create an explosive first 3-second Hook with punchy text, zoom style, and sound effect.
4. Detect high-impact visual moments to insert 2-4 B-Roll stock video/image overlays with precise search keywords, timestamps, and layout.
5. Detect video mood (e.g., 'energetic', 'inspiring', 'chill', 'dramatic', 'lofi') and suggest sound FX cue timestamps (whoosh, pop, ding, camera shutter, cash register).
6. Generate viral YouTube Shorts, TikTok, and Facebook Reels titles, descriptions, and hashtags with high engagement score (90-99).

Return pure JSON matching this exact structure:
{
  "summary": "AI removed 4.2s of silences and fillers, added dynamic beat-synced captions, hook zoom, and 3 b-rolls.",
  "editedDuration": number,
  "cuts": [
    { "start": number, "end": number, "duration": number, "type": "silence" | "filler" | "mistake", "description": string }
  ],
  "captions": [
    {
      "id": string,
      "start": number,
      "end": number,
      "text": string,
      "urduText": string,
      "words": [
        { "text": string, "urdu": string, "start": number, "end": number, "highlight": boolean, "emoji": string, "color": string }
      ]
    }
  ],
  "hook": {
    "enabled": true,
    "text": string,
    "urduText": string,
    "style": "zoom_punch" | "shake" | "flash" | "spotlight",
    "duration": 3.0,
    "soundFx": "whoosh" | "pop" | "ding" | "boom" | "camera"
  },
  "brolls": [
    {
      "id": string,
      "start": number,
      "end": number,
      "keyword": string,
      "type": "video" | "image",
      "title": string,
      "position": "fullscreen" | "pip" | "split"
    }
  ],
  "soundEffects": [
    { "id": string, "time": number, "type": "whoosh" | "pop" | "ding" | "camera" | "cash" | "glitch", "volume": 0.8 }
  ],
  "mood": "energetic" | "inspiring" | "chill" | "dramatic" | "lofi" | "suspense",
  "suggestedBpm": 125,
  "metadata": {
    "title": string,
    "urduTitle": string,
    "description": string,
    "hashtags": string[],
    "score": number,
    "platformSpecific": {
      "tiktok": { "title": string, "tags": string[] },
      "youtube": { "title": string, "tags": string[], "description": string },
      "facebook": { "title": string, "tags": string[] }
    }
  }
}`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed, engine: 'gemini-3.7-flash' });
    } else {
      // Fallback heuristic intelligent generator for offline or preview testing
      const fallback = generateHeuristicAutoEdit(duration, sampleTopic, language);
      return res.json({ success: true, data: fallback, engine: 'smart-heuristic' });
    }
  } catch (err: any) {
    console.error('Auto-edit API error:', err);
    // Graceful fallback response
    const fallback = generateHeuristicAutoEdit(30, 'Viral Content Hack', 'english');
    res.json({ success: true, data: fallback, engine: 'fallback-safe', warning: err.message });
  }
});

// Viral Metadata Generator Endpoint
app.post('/api/generate-meta', async (req, res) => {
  try {
    const { topic, transcript = '', platform = 'all' } = req.body;
    const ai = getAiClient();

    if (ai) {
      const prompt = `Generate viral, high CTR Title, Description, and Hashtags for a short form video (${platform}) about "${topic}".
Include Roman Urdu and English variations for Pakistani / South Asian & Global TikTok & Reels creators.
Return JSON:
{
  "title": "Viral Hook Title 🔥",
  "urduTitle": "وائرل عنوان",
  "description": "Engaging 2-sentence description with call to action",
  "hashtags": ["#Shorts", "#Viral", "#UrduCreators", "#TikTokViral", "#ProAutoEdit"],
  "score": 98,
  "platformSpecific": {
    "tiktok": { "title": "...", "tags": ["#fyp", "#viral", "#foryoupage"] },
    "youtube": { "title": "...", "tags": ["#Shorts", "#Trending"], "description": "..." },
    "facebook": { "title": "...", "tags": ["#Reels", "#ViralReels"] }
  }
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return res.json({ success: true, data: JSON.parse(response.text || '{}') });
    } else {
      return res.json({
        success: true,
        data: {
          title: `Stop Making This Video Mistake! 🚀 (Full Guide)`,
          urduTitle: `یہ غلطی اب کبھی مت کرنا! 😱`,
          description: `Watch until the end to see the 1-click transformation using AI Auto Edit! Follow for more viral creator tips.`,
          hashtags: ['#YouTubeShorts', '#TikTokViral', '#ViralReels', '#AIEditor', '#ProAutoEdit', '#TrendingNow'],
          score: 96,
          platformSpecific: {
            tiktok: { title: `Stop scrolling! This 1 AI trick blew my views 📈🔥`, tags: ['#fyp', '#xyzbca', '#contentcreator', '#viralhack'] },
            youtube: { title: `How 1 AI Click Changed My YouTube Shorts Forever ⚡`, tags: ['#Shorts', '#CreatorHack', '#YouTubeTips'], description: `Full auto-edit breakdown with subtitles and hooks!` },
            facebook: { title: `Never edit videos manually again! Watch this 👇`, tags: ['#FacebookReels', '#VideoEditing', '#Viral2026'] }
          }
        }
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Smart B-Roll suggestions endpoint
app.post('/api/generate-broll', async (req, res) => {
  try {
    const { script, duration = 30 } = req.body;
    const ai = getAiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Given this video script: "${script}", suggest 4 highly relevant stock B-roll visual moments with timestamps (0 to ${duration}s), visual search keywords (e.g., "counting money", "rocket launch", "city skyline night", "focused coder", "shocked face", "phone notification graph"), and overlay positioning.
Return JSON array of objects: [{ "id": "b1", "start": 4.5, "end": 7.5, "keyword": "...", "type": "video", "title": "...", "position": "fullscreen" }]`,
        config: { responseMimeType: 'application/json' },
      });
      return res.json({ success: true, brolls: JSON.parse(response.text || '[]') });
    } else {
      return res.json({
        success: true,
        brolls: [
          { id: 'b1', start: 3.5, end: 6.8, keyword: 'money graph growth stock chart', type: 'video', title: 'Exponential Growth Chart', position: 'fullscreen' },
          { id: 'b2', start: 10.2, end: 13.5, keyword: 'smartphone social media scrolling tiktok', type: 'video', title: 'Viral Social Media Feed', position: 'fullscreen' },
          { id: 'b3', start: 18.0, end: 21.4, keyword: 'neon light futuristic ai technology', type: 'video', title: 'Futuristic AI Wave', position: 'pip' },
        ]
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Heuristic fallback generator
function generateHeuristicAutoEdit(duration: number, topic: string, language: string) {
  const isUrdu = language === 'urdu' || language === 'bilingual' || language === 'roman-urdu';
  
  const cuts = [
    { start: 0.0, end: 0.6, duration: 0.6, type: 'silence' as const, description: 'Awkward pre-speech silence removed' },
    { start: 7.2, end: 8.1, duration: 0.9, type: 'filler' as const, description: 'Filler sound "umm / yani" cut out' },
    { start: 14.5, end: 15.6, duration: 1.1, type: 'silence' as const, description: 'Unnatural pause eliminated' },
    { start: 22.0, end: 22.8, duration: 0.8, type: 'mistake' as const, description: 'Stutter & retake auto-spliced' },
  ];

  const captions = [
    {
      id: 'c1',
      start: 0.6,
      end: 3.5,
      text: 'Stop making this HUGE video mistake right now!',
      urduText: 'ابھی کے ابھی یہ سب سے بڑی غلطی کرنا بند کریں!',
      words: [
        { text: 'STOP', urdu: 'روکیں', start: 0.6, end: 1.1, highlight: true, emoji: '🛑', color: '#ef4444' },
        { text: 'making', urdu: 'کرنا', start: 1.1, end: 1.6, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'this', urdu: 'یہ', start: 1.6, end: 1.9, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'HUGE', urdu: 'سب سے بڑی', start: 1.9, end: 2.5, highlight: true, emoji: '😱', color: '#eab308' },
        { text: 'MISTAKE!', urdu: 'غلطی!', start: 2.5, end: 3.5, highlight: true, emoji: '⚠️', color: '#38bdf8' }
      ]
    },
    {
      id: 'c2',
      start: 3.6,
      end: 7.2,
      text: '99% of creators spend hours editing manually.',
      urduText: '99 فیصد کریئٹرز گھنٹوں ایڈیٹنگ میں ضائع کرتے ہیں۔',
      words: [
        { text: '99%', urdu: '99٪', start: 3.6, end: 4.2, highlight: true, emoji: '📊', color: '#22c55e' },
        { text: 'of', urdu: 'کے', start: 4.2, end: 4.5, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'creators', urdu: 'کریئٹرز', start: 4.5, end: 5.2, highlight: true, emoji: '🎥', color: '#a855f7' },
        { text: 'spend', urdu: 'لگاتے', start: 5.2, end: 5.8, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'HOURS', urdu: 'گھنٹوں', start: 5.8, end: 6.5, highlight: true, emoji: '⏳', color: '#ef4444' },
        { text: 'manually!', urdu: 'ہاتھ سے!', start: 6.5, end: 7.2, highlight: false, emoji: '', color: '#ffffff' }
      ]
    },
    {
      id: 'c3',
      start: 8.2,
      end: 12.0,
      text: 'With ProAuto Edit, 1-click removes silences and adds captions.',
      urduText: 'پرو آٹو ایڈیٹ کے ساتھ، ایک کلک میں سب ٹائٹلز اور کٹس لگ جاتے ہیں۔',
      words: [
        { text: 'ONE CLICK', urdu: 'ایک کلک', start: 8.2, end: 9.3, highlight: true, emoji: '⚡', color: '#38bdf8' },
        { text: 'removes', urdu: 'ختم کرے', start: 9.3, end: 9.9, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'silences', urdu: 'وقفے', start: 9.9, end: 10.7, highlight: true, emoji: '✂️', color: '#eab308' },
        { text: '&', urdu: 'اور', start: 10.7, end: 11.0, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'CAPTIONS!', urdu: 'سب ٹائٹلز!', start: 11.0, end: 12.0, highlight: true, emoji: '💬', color: '#4ade80' }
      ]
    },
    {
      id: 'c4',
      start: 12.1,
      end: 16.5,
      text: 'Auto zoom hook, viral B-roll, and background music instantly!',
      urduText: 'آٹو زوم ہک، وائرل بی رول اور بیک گراؤنڈ میوزک فوری طور پر!',
      words: [
        { text: 'AUTO', urdu: 'آٹو', start: 12.1, end: 12.8, highlight: true, emoji: '🚀', color: '#f43f5e' },
        { text: 'ZOOM', urdu: 'زوم', start: 12.8, end: 13.5, highlight: true, emoji: '🔍', color: '#38bdf8' },
        { text: 'HOOK,', urdu: 'ہک،', start: 13.5, end: 14.4, highlight: true, emoji: '🎣', color: '#eab308' },
        { text: 'B-ROLL,', urdu: 'بی رول،', start: 14.4, end: 15.3, highlight: true, emoji: '🎬', color: '#a855f7' },
        { text: 'MUSIC!', urdu: 'میوزک!', start: 15.3, end: 16.5, highlight: true, emoji: '🎵', color: '#22c55e' }
      ]
    },
    {
      id: 'c5',
      start: 16.6,
      end: 22.0,
      text: 'Try it right now and watch your engagement explode!',
      urduText: 'ابھی آزمائیں اور اپنے ویوز کو 10 گنا بڑھائیں!',
      words: [
        { text: 'Try', urdu: 'آزمائیں', start: 16.6, end: 17.3, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'it', urdu: 'اسے', start: 17.3, end: 17.8, highlight: false, emoji: '', color: '#ffffff' },
        { text: 'NOW!', urdu: 'ابھی!', start: 17.8, end: 19.2, highlight: true, emoji: '🔥', color: '#ef4444' },
        { text: 'EXPLODE', urdu: 'بڑھیں گے', start: 19.2, end: 20.6, highlight: true, emoji: '💥', color: '#38bdf8' },
        { text: 'VIEWS! 📈', urdu: 'ویوز! 📈', start: 20.6, end: 22.0, highlight: true, emoji: '🚀', color: '#22c55e' }
      ]
    }
  ];

  return {
    summary: 'AI removed 3.4s dead pauses & filler words, created 5 beat-synced captions, 3s zoom hook, and 3 high-impact B-Rolls.',
    originalDuration: duration,
    editedDuration: Math.max(15, duration - 3.4),
    cuts,
    captions,
    hook: {
      enabled: true,
      text: 'STOP MAKING THIS MISTAKE! 🛑',
      urduText: 'یہ غلطی کرنا ابھی بند کریں! 🛑',
      style: 'zoom_punch' as const,
      duration: 3.0,
      soundFx: 'whoosh' as const,
    },
    brolls: [
      { id: 'br1', start: 3.6, end: 7.2, keyword: 'stressed creator editing on computer late night', type: 'video' as const, title: 'Stressed Creator Editing', position: 'fullscreen' as const },
      { id: 'br2', start: 8.5, end: 11.8, keyword: 'ai artificial intelligence neon energy wave', type: 'video' as const, title: 'AI Automation Wave', position: 'fullscreen' as const },
      { id: 'br3', start: 18.0, end: 21.5, keyword: 'rocket launch explosive viral graph analytics', type: 'video' as const, title: 'Viral Rocket Growth', position: 'pip' as const },
    ],
    soundEffects: [
      { id: 'sfx1', time: 0.1, type: 'whoosh' as const, volume: 0.9 },
      { id: 'sfx2', time: 3.6, type: 'pop' as const, volume: 0.8 },
      { id: 'sfx3', time: 8.2, type: 'ding' as const, volume: 0.85 },
      { id: 'sfx4', time: 13.0, type: 'camera' as const, volume: 0.7 },
      { id: 'sfx5', time: 19.5, type: 'cash' as const, volume: 0.8 },
    ],
    mood: 'energetic' as const,
    suggestedBpm: 128,
    metadata: {
      title: 'Stop Making This HUGE Video Editing Mistake! 🚀',
      urduTitle: 'ویڈیو ایڈیٹنگ میں یہ غلطی اب کبھی مت کرنا! 😱',
      description: 'The secret 1-click AI workflow used by top creators on TikTok, Reels, and YouTube Shorts. Try ProAuto Edit today!',
      hashtags: ['#ProAutoEdit', '#YouTubeShorts', '#TikTokViral', '#ViralReels', '#VideoEditingHack', '#ContentCreator', '#UrduCreators'],
      score: 97,
      platformSpecific: {
        tiktok: {
          title: 'This 1 AI video edit trick feels ILLEGAL 🤫📈',
          tags: ['#fyp', '#viral', '#foryou', '#creatorhack', '#editingtips']
        },
        youtube: {
          title: 'How to Edit YouTube Shorts in 1-Click with AI (2026)',
          tags: ['#Shorts', '#AIEditing', '#ViralTips', '#YouTubeCreator'],
          description: 'Save 5+ hours every single day with AI silence removal, Hormozi captions, and automated B-roll overlays.'
        },
        facebook: {
          title: 'The AI tool that edits Facebook Reels automatically in seconds! ⚡',
          tags: ['#FacebookReels', '#ReelsViral', '#VideoCreator', '#TechTools']
        }
      }
    }
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProAuto Edit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
