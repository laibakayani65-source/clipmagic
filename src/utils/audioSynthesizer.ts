import { SoundFXType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate realistic creator SFX synthesized purely in Web Audio
export function playSoundFX(type: SoundFXType, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.7, now);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'whoosh': {
        // Fast noise swoosh with low-pass sweep
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        filter.Q.value = 3.0;

        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(volume * 0.9, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gainNode);
        noise.start(now);
        noise.stop(now + 0.36);
        break;
      }

      case 'pop': {
        // Bubble pop sound
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.09);

        gainNode.gain.setValueAtTime(volume * 0.9, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'ding': {
        // Crisp high bell ding (viral notification)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now); // A6
        osc.frequency.exponentialRampToValueAtTime(1750, now + 0.5);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(3520, now); // Harmonic

        const dingGain = ctx.createGain();
        dingGain.gain.setValueAtTime(volume * 0.8, now);
        dingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(dingGain);
        osc2.connect(dingGain);
        dingGain.connect(gainNode);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.65);
        osc2.stop(now + 0.65);
        break;
      }

      case 'camera': {
        // Shutter snap click
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }

      case 'cash': {
        // Cash register cha-ching!
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(volume * 0.5, now + idx * 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

          osc.connect(g);
          g.connect(gainNode);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.36);
        });
        break;
      }

      case 'glitch': {
        // Digital cyber glitch
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.sin(i * 0.1) > 0 ? 1 : -1) * (Math.random() > 0.3 ? 1 : -1);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        gainNode.gain.setValueAtTime(volume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        source.connect(gainNode);
        source.start(now);
        source.stop(now + 0.16);
        break;
      }

      case 'sub_drop': {
        // Heavy bass sub drop
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
    }
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// Background Music Synth Player (Generates royalty-free beat loops directly without external network blocks)
class BackgroundBeatSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private currentStep = 0;
  private bpm = 125;
  private mood: string = 'energetic';
  private masterGain: GainNode | null = null;

  public start(mood: string = 'energetic', bpm: number = 125, volume: number = 0.4) {
    this.stop();
    this.ctx = getAudioContext();
    this.bpm = bpm;
    this.mood = mood;
    this.isPlaying = true;
    this.currentStep = 0;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume * 0.45, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    const stepTimeMs = (60 / this.bpm / 4) * 1000;
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.playStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepTimeMs);
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol * 0.45, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playStep(step: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Kick on 0, 4, 8, 12
    if (step % 4 === 0) {
      const kick = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(this.mood === 'lofi' ? 90 : 130, now);
      kick.frequency.exponentialRampToValueAtTime(0.01, now + 0.2);

      kickGain.gain.setValueAtTime(0.7, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      kick.connect(kickGain);
      kickGain.connect(this.masterGain);
      kick.start(now);
      kick.stop(now + 0.22);
    }

    // Hi-hat on every 2 steps
    if (step % 2 === 0) {
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, now);

      const hatGain = this.ctx.createGain();
      hatGain.gain.setValueAtTime(step % 4 === 2 ? 0.35 : 0.18, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(hatGain);
      hatGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.045);
    }

    // Melodic Synth Chords on steps 0, 6, 10
    if (step === 0 || step === 6 || step === 10) {
      const chords: Record<string, number[][]> = {
        energetic: [[440, 554.37, 659.25], [493.88, 587.33, 739.99], [392, 493.88, 587.33]], // A Maj, B Min, G Maj
        lofi: [[261.63, 329.63, 392.0, 493.88], [220.0, 261.63, 329.63, 392.0]], // Cmaj7, Am7
        inspiring: [[349.23, 440.0, 523.25], [392.0, 493.88, 587.33], [440.0, 523.25, 659.25]],
        dramatic: [[220.0, 261.63, 329.63], [196.0, 246.94, 293.66], [174.61, 220.0, 261.63]],
        suspense: [[110.0, 130.81, 164.81], [98.0, 123.47, 146.83]],
        chill: [[293.66, 369.99, 440.0, 554.37], [246.94, 311.13, 369.99, 440.0]]
      };

      const chordList = chords[this.mood] || chords.energetic;
      const currentChord = chordList[Math.floor((step / 4)) % chordList.length];

      currentChord.forEach(freq => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = this.mood === 'lofi' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const chordGain = this.ctx.createGain();
        chordGain.gain.setValueAtTime(0.12, now);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + (this.mood === 'lofi' ? 0.7 : 0.45));

        osc.connect(chordGain);
        chordGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    }
  }
}

export const bgMusicSynth = new BackgroundBeatSynth();
