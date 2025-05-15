import { motion } from "framer-motion";
import { useState } from "react";

/**
 * SearchResults Component
 * Displays search results from web searches
 */
export default function SearchResults({ searchResults }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!searchResults || searchResults.length === 0) return null;

  return (
    <motion.div
      className="mt-2 mb-4 bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-gray-800 px-3 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ffcc00]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-sm">Web Search Results</span>
          <span className="bg-[#1a1a1a] text-xs px-2 py-0.5 rounded text-gray-400">
            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-gray-400 hover:text-white"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-800">
          {searchResults.map((result, index) => (
            <div key={index} className="p-3 hover:bg-[#121212]">
              <a 
                href={result.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="text-[#ffcc00] text-sm font-medium hover:underline">{result.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1 mb-2">
                  <span className="truncate max-w-[80%]">{result.link}</span>
                </div>
                {result.snippet && (
                  <p className="text-xs text-gray-400 line-clamp-3">{result.snippet}</p>
                )}
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#0a0a0a] px-3 py-2 text-xs text-gray-500">
        Results provided by web search
      </div>
    </motion.div>
  );
}