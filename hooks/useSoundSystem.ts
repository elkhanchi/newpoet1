import { useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'quill' | 'paper' | 'chime' | 'ink';

const SOUND_URLS: Record<SoundType, string> = {
  // Fast scribble sound for typing
  quill: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  // Paper slide/rustle for page transitions
  paper: 'https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3', 
  // Soft magical chime/notification for revealing info
  chime: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3',
  // Pop/Dip sound for buttons
  ink: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
};

export const useSoundSystem = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Partial<Record<SoundType, HTMLAudioElement>>>({});

  useEffect(() => {
    // Initialize mute state from storage
    const storedMute = localStorage.getItem('sada_sound_muted');
    if (storedMute) setIsMuted(storedMute === 'true');

    // Preload sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      // Adjust volumes
      if (key === 'quill') audio.volume = 0.2; // Subtle typing
      else if (key === 'paper') audio.volume = 0.4;
      else audio.volume = 0.5;
      
      audioRefs.current[key as SoundType] = audio;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem('sada_sound_muted', String(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;
    
    const audio = audioRefs.current[type];
    if (audio) {
      // Allow overlapping sounds for typing, restart for others
      if (type !== 'quill') {
         audio.currentTime = 0;
      } else if (!audio.paused && audio.currentTime > 0.1) {
         // If quill is already playing and has played a bit, let it continue or restart based on feel
         // For 'scribble', restarting too fast sounds like a machine gun. 
         // Let's just play if it's paused or nearly done.
         if (audio.currentTime < audio.duration - 0.1) return;
         audio.currentTime = 0;
      }
      
      audio.play().catch((e) => {
        // Ignore autoplay policy errors or load errors
        console.debug('Audio play blocked:', e);
      });
    }
  }, [isMuted]);

  return { isMuted, toggleMute, playSound };
};