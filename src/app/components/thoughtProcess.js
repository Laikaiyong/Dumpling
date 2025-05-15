import { motion } from "framer-motion";

/**
 * ThoughtProcess Component
 * Displays an AI agent's thought process in a collapsible, scrollable container
 */
export default function ThoughtProcess({ thought, isVisible }) {
  if (!isVisible || !thought) return null;
  
  return (
    <motion.div 
      className="flex justify-start mt-1 mb-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[95%] w-full px-3 py-2 bg-[#1a1a1a]/50 border border-[#ff3131]/20 rounded-lg">
        <div className="flex items-center text-[#ff3131] mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-xs font-medium">Thought Process</span>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {Array.isArray(thought) ? 
            thought.map((thoughtItem, i) => (
              <p key={i} className="mb-1 break-words">{thoughtItem}</p>
            ))
            : 
            <p className="break-words">{thought || "No thought process recorded"}</p>
          }
        </div>
      </div>
    </motion.div>
  );
}