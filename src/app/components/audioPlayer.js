"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";

export function AudioPlayer({ audioUrl, onEnded }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      const percentage = (audio.currentTime / audio.duration) * 100;
      setProgress(percentage);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    audio.src = audioUrl;
    audio.load();
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.removeEventListener('play', () => setIsPlaying(true));
    };
  }, [audioUrl, onEnded]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };
  
  return (
    <div className="flex items-center space-x-2 bg-black/30 rounded-full px-2 py-1">
      <button 
        onClick={togglePlay} 
        className="p-1 rounded-full bg-[#ff3131]/20 hover:bg-[#ff3131]/40 transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ff3131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ff3131]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        )}
      </button>
      
      <div className="relative h-1 w-24 bg-gray-600 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00]" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}