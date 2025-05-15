"use client";

import { useState } from 'react';
import { motion } from "framer-motion";

const FEATURED_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rachel", gender: "Female", accent: "American" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", gender: "Female", accent: "American" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Adam", gender: "Male", accent: "American" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Nicole", gender: "Female", accent: "American" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", gender: "Male", accent: "American" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", gender: "Female", accent: "American" },
  { id: "jBpfuIE2acCO8z3wKNLl", name: "Callum", gender: "Male", accent: "British" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Charlotte", gender: "Female", accent: "British" },
];

export function VoiceSettings({ currentVoiceId, setVoice, onClose }) {
  const [selectedVoiceId, setSelectedVoiceId] = useState(currentVoiceId);
  
  const handleSave = () => {
    setVoice(selectedVoiceId);
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full mb-2 w-64 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl p-4"
    >
      <h3 className="text-lg font-medium text-[#ffcc00] mb-3">Voice Settings</h3>
      
      <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
        {FEATURED_VOICES.map((voice) => (
          <div 
            key={voice.id}
            onClick={() => setSelectedVoiceId(voice.id)}
            className={`p-2 rounded cursor-pointer ${
              selectedVoiceId === voice.id 
                ? 'bg-gradient-to-r from-[#ff3131]/20 to-[#ffcc00]/20 border border-[#ff3131]/30' 
                : 'hover:bg-[#222]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{voice.name}</span>
              <span className="text-xs text-gray-400">{voice.accent}</span>
            </div>
            <span className="text-xs text-gray-500">{voice.gender}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2">
        <button 
          onClick={onClose}
          className="px-3 py-1 bg-[#0f0f0f] text-gray-300 rounded hover:bg-[#222]"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-1 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] text-black rounded font-medium"
        >
          Apply
        </button>
      </div>
    </motion.div>
  );
}