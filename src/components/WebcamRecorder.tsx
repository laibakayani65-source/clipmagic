import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Square, 
  RotateCcw, 
  Check, 
  X, 
  Mic, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { playSoundFX } from '../utils/audioSynthesizer';

interface WebcamRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoRecorded: (videoUrl: string, duration: number) => void;
}

export const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  isOpen,
  onClose,
  onVideoRecorded,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setHasPermissionError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1080 }, height: { ideal: 1920 }, facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStartCountdown = () => {
    setCountdown(3);
    playSoundFX('ding');
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSoundFX('ding');
      } else if (count === 0) {
        setCountdown(null);
        clearInterval(interval);
        startActualRecording();
      }
    }, 1000);
  };

  const startActualRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordSeconds(0);
      playSoundFX('whoosh');

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      playSoundFX('pop');
    }
  };

  const handleUseRecording = () => {
    if (previewUrl) {
      onVideoRecorded(previewUrl, recordSeconds || 15);
      onClose();
      playSoundFX('cash', 0.8);
    }
  };

  const handleReset = () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    setRecordSeconds(0);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d121f] border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="font-display font-bold text-base text-white">Record Mobile Short</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative w-full aspect-[9/16] max-h-[460px] bg-black flex items-center justify-center overflow-hidden">
          {hasPermissionError ? (
            <div className="p-6 text-center text-xs text-rose-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <span>Camera or microphone access denied. Please allow permissions in browser settings.</span>
            </div>
          ) : previewUrl ? (
            <video src={previewUrl} controls autoPlay loop className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30 pointer-events-none">
              <span className="font-display font-black text-8xl text-yellow-400 animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Recording Timer Badge */}
          {recording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600/90 rounded-full text-white font-mono text-xs font-bold animate-pulse shadow-lg z-20">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>REC {Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-900/80 flex items-center justify-center gap-4">
          {!previewUrl ? (
            !recording ? (
              <button
                onClick={handleStartCountdown}
                disabled={hasPermissionError || countdown !== null}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 hover:scale-105 transition-transform cursor-pointer animate-pulse"
              >
                <Square className="w-6 h-6 fill-white" />
              </button>
            )
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Record</span>
              </button>

              <button
                onClick={handleUseRecording}
                className="flex-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>✨ Use & Auto-Edit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
