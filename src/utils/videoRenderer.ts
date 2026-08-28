import { VideoProject, CaptionSegment, CaptionStyle, AspectRatio } from '../types';

export interface RenderProgressCallback {
  (progress: number, statusText: string): void;
}

export function getAspectRatioDimensions(ratio: AspectRatio, baseWidth: number = 1080): { width: number; height: number } {
  switch (ratio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '16:9':
      return { width: 1920, height: 1080 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '4:5':
      return { width: 1080, height: 1350 };
    default:
      return { width: 1080, height: 1920 };
  }
}

// Render video using Canvas + MediaRecorder for actual export
export async function renderAndExportVideo(
  project: VideoProject,
  videoElement: HTMLVideoElement,
  onProgress: RenderProgressCallback
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const { width, height } = getAspectRatioDimensions(project.aspectRatio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      onProgress(5, 'Initializing video compositor...');

      // Prepare Audio Context & MediaRecorder
      const fps = 30;
      const canvasStream = canvas.captureStream(fps);

      let mediaRecorder: MediaRecorder;
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      let selectedMime = 'video/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime });
        onProgress(100, 'Video export ready!');
        resolve(blob);
      };

      mediaRecorder.start(100);

      // Preload active B-Roll media if available
      const brollImages: Record<string, HTMLImageElement> = {};
      for (const br of project.brolls) {
        if (br.thumbnail) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = br.thumbnail;
          brollImages[br.id] = img;
        }
      }

      const totalDuration = project.editedDuration || videoElement.duration || 20;
      const totalFrames = Math.floor(totalDuration * fps);
      let currentFrame = 0;

      const originalTime = videoElement.currentTime;
      videoElement.pause();

      // Render frame by frame
      async function processNextFrame() {
        if (currentFrame >= totalFrames) {
          mediaRecorder.stop();
          videoElement.currentTime = originalTime;
          return;
        }

        const currentTime = (currentFrame / fps);
        const percent = Math.min(99, Math.round((currentFrame / totalFrames) * 90) + 5);
        onProgress(percent, `Rendering frame ${currentFrame}/${totalFrames} (${currentTime.toFixed(1)}s)...`);

        // Seek video element
        videoElement.currentTime = currentTime % videoElement.duration;
        await new Promise((r) => {
          const onSeek = () => {
            videoElement.removeEventListener('seeked', onSeek);
            r(true);
          };
          videoElement.addEventListener('seeked', onSeek);
        });

        // 1. Draw Background & Video
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        // Aspect ratio handling (Smart Fit / Blur / Crop)
        const vRatio = (videoElement.videoWidth || 16) / (videoElement.videoHeight || 9);
        const cRatio = width / height;

        // Auto Hook Zoom Effect (first 3s)
        let zoom = 1.0;
        if (project.hook?.enabled && currentTime <= project.hook.duration) {
          const factor = (project.hook.zoomLevel || 1.25) - 1.0;
          zoom = 1.0 + factor * (1 - currentTime / project.hook.duration * 0.4);
        }

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-width / 2, -height / 2);

        if (project.autoResizeMode === 'fit_blur' && Math.abs(vRatio - cRatio) > 0.05) {
          // Blurred background
          ctx.save();
          ctx.filter = 'blur(30px) brightness(0.4)';
          ctx.drawImage(videoElement, -50, -50, width + 100, height + 100);
          ctx.restore();

          // Main video centered
          let dw = width;
          let dh = width / vRatio;
          if (dh > height) {
            dh = height;
            dw = height * vRatio;
          }
          const dx = (width - dw) / 2;
          const dy = (height - dh) / 2;
          ctx.drawImage(videoElement, dx, dy, dw, dh);
        } else {
          // Cover crop
          let sx = 0, sy = 0, sw = videoElement.videoWidth || width, sh = videoElement.videoHeight || height;
          if (vRatio > cRatio) {
            sw = sh * cRatio;
            sx = ((videoElement.videoWidth || width) - sw) / 2;
          } else {
            sh = sw / cRatio;
            sy = ((videoElement.videoHeight || height) - sh) / 2;
          }
          ctx.drawImage(videoElement, sx, sy, sw, sh, 0, 0, width, height);
        }
        ctx.restore();

        // 2. Render Active B-Roll Overlay
        const activeBroll = project.brolls.find(br => currentTime >= br.start && currentTime <= br.end);
        if (activeBroll && brollImages[activeBroll.id] && brollImages[activeBroll.id].complete) {
          const img = brollImages[activeBroll.id];
          ctx.save();
          if (activeBroll.position === 'pip') {
            const pipW = width * 0.42;
            const pipH = pipW * (9 / 16);
            const pipX = width - pipW - 40;
            const pipY = 80;
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 6;
            ctx.strokeRect(pipX, pipY, pipW, pipH);
            ctx.drawImage(img, pipX, pipY, pipW, pipH);
          } else {
            ctx.globalAlpha = activeBroll.opacity || 0.95;
            ctx.drawImage(img, 0, 0, width, height);
          }
          ctx.restore();
        }

        // 3. Render Hook Banner (First 3s)
        if (project.hook?.enabled && currentTime <= project.hook.duration) {
          drawHookOverlay(ctx, project.hook, width, height, currentTime);
        }

        // 4. Render Smart Beat-Synced Captions
        drawActiveCaption(ctx, project.captions, project.captionStyle, project.captionLanguage, currentTime, width, height);

        currentFrame++;
        requestAnimationFrame(processNextFrame);
      }

      processNextFrame();
    } catch (err: any) {
      console.error('Rendering error:', err);
      reject(err);
    }
  });
}

function drawHookOverlay(ctx: CanvasRenderingContext2D, hook: any, width: number, height: number, time: number) {
  ctx.save();
  const bannerY = height * 0.22;
  const pulse = Math.sin(time * 8) * 0.05 + 1.0;

  ctx.translate(width / 2, bannerY);
  ctx.scale(pulse, pulse);

  // Hook background tag
  ctx.fillStyle = 'rgba(239, 68, 68, 0.92)'; // Bright Red Hook Alert
  const text = hook.text || 'WATCH UNTIL END! 🔥';
  ctx.font = `900 ${Math.round(width * 0.048)}px 'Outfit', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const paddingX = 40;
  const paddingY = 22;

  // Rounded pill background
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.roundRect(-textWidth / 2 - paddingX, -paddingY, textWidth + paddingX * 2, paddingY * 2, 20);
  ctx.fill();

  // Hook text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 0, 0);

  if (hook.urduText) {
    ctx.font = `700 ${Math.round(width * 0.042)}px 'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif`;
    ctx.fillStyle = '#fef08a';
    ctx.fillText(hook.urduText, 0, paddingY + 36);
  }

  ctx.restore();
}

function drawActiveCaption(
  ctx: CanvasRenderingContext2D,
  captions: CaptionSegment[],
  style: CaptionStyle,
  language: string,
  currentTime: number,
  width: number,
  height: number
) {
  const activeSegment = captions.find(c => currentTime >= c.start && currentTime <= c.end);
  if (!activeSegment) return;

  ctx.save();
  const captionY = height * 0.76;
  ctx.translate(width / 2, captionY);

  const isUrdu = language === 'urdu' || language === 'bilingual';

  if (style === 'hormozi') {
    // Hormozi Style: Big Bold, Black Stroke, Pop Colors (Yellow, Green, Cyan)
    const fontSize = Math.round(width * 0.056);
    ctx.font = `900 ${fontSize}px 'Outfit', 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = activeSegment.words || [];
    let totalText = words.map(w => w.text).join(' ') || activeSegment.text;
    const activeWord = words.find(w => currentTime >= w.start && currentTime <= w.end);

    // Draw active highlight word huge
    if (activeWord) {
      const activeWordText = `${activeWord.emoji ? activeWord.emoji + ' ' : ''}${activeWord.text}`;
      const activeFontSize = Math.round(fontSize * 1.22);
      ctx.font = `900 ${activeFontSize}px 'Outfit', sans-serif`;

      // Thick Stroke
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#000000';
      ctx.lineJoin = 'round';
      ctx.strokeText(activeWordText, 0, -10);

      // Color Fill
      ctx.fillStyle = activeWord.color || '#fde047'; // bright yellow
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(activeWordText, 0, -10);

      // Urdu translation underneath if bilingual
      if (activeSegment.urduText && isUrdu) {
        ctx.font = `700 ${Math.round(fontSize * 0.85)}px 'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif`;
        ctx.fillStyle = '#67e8f9';
        ctx.lineWidth = 8;
        ctx.strokeText(activeSegment.urduText, 0, 48);
        ctx.fillText(activeSegment.urduText, 0, 48);
      }
    } else {
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(totalText, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(totalText, 0, 0);
    }
  } else if (style === 'mrbeast') {
    // MrBeast Style: Neon Yellow/Cyan Glow with Anton/Bungee look
    const fontSize = Math.round(width * 0.06);
    ctx.font = `900 ${fontSize}px 'Anton', 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = activeSegment.words || [];
    const activeWord = words.find(w => currentTime >= w.start && currentTime <= w.end);
    const displayText = activeWord ? `${activeWord.emoji || '⚡'} ${activeWord.text}` : activeSegment.text;

    ctx.lineWidth = 16;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(displayText, 0, 0);

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#fde047';
    ctx.fillText(displayText, 0, 0);
  } else if (style === 'neon') {
    // Neon Glow Cyber Style
    const fontSize = Math.round(width * 0.052);
    ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 30;
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1e3a8a';
    ctx.strokeText(activeSegment.text, 0, 0);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(activeSegment.text, 0, 0);
  } else {
    // Cinematic / Karaoke Style: Clean dark backing pill
    const fontSize = Math.round(width * 0.046);
    ctx.font = `700 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = activeSegment.text;
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 24, -fontSize / 2 - 14, textWidth + 48, fontSize + 28, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}
