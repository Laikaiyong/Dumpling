'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function EmbedLinkGenerator() {
  const [agentId, setAgentId] = useState('solana-assistant');
  const [bgColor, setBgColor] = useState('#0a0a0a');
  const [textColor, setTextColor] = useState('#ffffff');
  const [buttonColor, setButtonColor] = useState('#ff3131');
  const [showWatermark, setShowWatermark] = useState(true);
  const [height, setHeight] = useState('500');
  const [width, setWidth] = useState('100%');
  const [copiedCode, setCopiedCode] = useState(false);

  const embedCode = `<iframe
  src="https://dumpling.ai/embed/${agentId}?bg=${bgColor.replace('#', '')}&text=${textColor.replace('#', '')}&button=${buttonColor.replace('#', '')}&watermark=${showWatermark}"
  width="${width}"
  height="${height}px"
  style="border:none;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
  allow="microphone"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-[#ffcc00]">Generate Embed Link</h2>
      <p className="text-gray-400 mb-6">Customize and generate an iframe code to embed your AI agent on any website.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Agent
            </label>
            <select 
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
            >
              <option value="solana-assistant">Solana Assistant</option>
              <option value="token-data-agent">Token Data Agent</option>
              <option value="transaction-insights">Transaction Insights</option>
              <option value="customer-support">Customer Support</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Color
              </label>
              <div className="flex">
                <input 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex">
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-10 rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Button Color
              </label>
              <div className="flex">
                <input 
                  type="color" 
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="h-10 w-10 rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Watermark
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showWatermark} 
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff3131]"></div>
                <span className="ms-3 text-sm text-gray-300">{showWatermark ? 'Visible' : 'Hidden'}</span>
              </label>
              {!showWatermark && (
                <p className="text-xs text-gray-500 mt-1">Requires paid plan</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Width
              </label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                placeholder="e.g. 100% or 400px"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                min="300"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#0a0a0a] p-4 rounded-lg">
            <div className="aspect-video flex items-center justify-center bg-opacity-50 rounded mb-4 overflow-hidden" style={{ backgroundColor: bgColor }}>
              <div className="text-center" style={{ color: textColor }}>
                <div className="text-xl mb-2 font-bold">AI Agent Preview</div>
                <button 
                  className="px-4 py-2 rounded font-medium" 
                  style={{ backgroundColor: buttonColor }}
                >
                  Ask a question
                </button>
                {showWatermark && (
                  <div className="absolute bottom-2 right-2 text-xs opacity-60 flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#ff3131] rounded-full"></span>
                    Powered by Dumpling
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-[#000000] p-3 rounded-lg overflow-auto max-h-64 text-sm text-gray-300 font-mono">
                {embedCode}
              </pre>
              <button 
                onClick={copyToClipboard} 
                className="absolute top-2 right-2 p-2 bg-[#1a1a1a] rounded hover:bg-[#2a2a2a]"
              >
                {copiedCode ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#242424] p-4 rounded-lg border border-gray-700"
          >
            <h3 className="text-sm font-medium text-[#ffcc00] mb-2">How to use</h3>
            <ol className="text-sm text-gray-400 list-decimal pl-5 space-y-1">
              <li>Copy the embed code above</li>
              <li>Paste it into your HTML where you want the agent to appear</li>
              <li>The agent will automatically adapt to its container width</li>
            </ol>
          </motion.div>
        </div>
      </div>
    </div>
  );
}