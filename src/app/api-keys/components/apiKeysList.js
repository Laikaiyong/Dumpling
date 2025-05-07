'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function ApiKeysList({ apiKeys, onRevokeKey, isLoading }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-8 mt-6">
        <div className="flex justify-center items-center h-40">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00] animate-spin"></div>
        </div>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-8 mt-6 text-center">
        <p className="text-gray-400">No API keys found. Create your first key to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4 text-[#ffcc00]">Your API Keys</h2>
      
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <motion.div 
            key={apiKey.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-gray-800 rounded-lg overflow-hidden"
          >
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedKey(expandedKey === apiKey.id ? null : apiKey.id)}
            >
              <div>
                <p className="font-medium">{apiKey.name}</p>
                <p className="text-sm text-gray-400">Created: {apiKey.created}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  apiKey.status === 'active' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {apiKey.status}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${expandedKey === apiKey.id ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedKey === apiKey.id && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#0a0a0a] p-2 rounded flex-1 font-mono text-sm overflow-x-auto">
                    {apiKey.key}
                  </div>
                  <button 
                    onClick={() => handleCopyKey(apiKey.key)}
                    className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                  >
                    {copiedKey === apiKey.key ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Last used: {apiKey.lastUsed || 'Never'}</span>
                  {apiKey.status === 'active' && (
                    <button 
                      onClick={() => onRevokeKey(apiKey.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Revoke Key
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}