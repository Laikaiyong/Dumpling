import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * TokenChart Component
 * Displays token price charts from different providers with token selection
 */
export default function TokenChart({ tokenData, network = 'solana' }) {
  const [activeTab, setActiveTab] = useState('birdeye');
  const [chartHeight, setChartHeight] = useState(300);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Handle both single token and multiple tokens
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  
  // Process incoming token data (supports both single object and array)
  useEffect(() => {
    if (!tokenData) return;
    
    // If tokenData is an array, use it directly
    if (Array.isArray(tokenData)) {
      setTokens(tokenData);
      setSelectedToken(tokenData[0] || null);
    } 
    // If it's a single token object
    else if (typeof tokenData === 'object') {
      setTokens([tokenData]);
      setSelectedToken(tokenData);
    }
  }, [tokenData]);
  
  if (!selectedToken) return null;
  
  // If we don't have a token address, we can't show a chart
  if (!selectedToken.tokenAddress) return null;

  return (
    <motion.div 
      className="mt-2 mb-4 bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      {/* Chart header with token selector and chart type tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        {/* Token selector dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-[#1a1a1a] px-3 py-1.5 rounded hover:bg-[#222] transition-colors"
          >
            {selectedToken.logoUrl && (
              <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                <img 
                  src={selectedToken.logoUrl} 
                  alt={selectedToken.tokenSymbol || 'token'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/005/630/579/small/pixel-art-glasses-isolated-on-white-background-free-vector.jpg';
                  }}
                />
              </div>
            )}
            <span className="font-medium">{selectedToken.tokenSymbol?.toUpperCase()}</span>
            {tokens.length > 1 && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Dropdown menu */}
          {dropdownOpen && tokens.length > 1 && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-[#1a1a1a] border border-gray-800 rounded shadow-lg z-10">
              {tokens.map((token, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-[#222] transition-colors ${selectedToken === token ? 'bg-[#222]' : ''}`}
                  onClick={() => {
                    setSelectedToken(token);
                    setDropdownOpen(false);
                  }}
                >
                  {token.logoUrl && (
                    <div className="w-5 h-5 rounded-full overflow-hidden mr-2">
                      <img 
                        src={token.logoUrl} 
                        alt={token.tokenSymbol || 'token'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://static.vecteezy.com/system/resources/thumbnails/005/630/579/small/pixel-art-glasses-isolated-on-white-background-free-vector.jpg';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{token.tokenSymbol?.toUpperCase()}</div>
                    <div className="text-xs text-gray-400 truncate">{token.tokenName}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Chart type tabs */}
        <div className="flex">
          <button 
            onClick={() => setActiveTab('birdeye')}
            className={`px-3 py-1 text-sm rounded-tl rounded-bl ${activeTab === 'birdeye' ? 'bg-[#222] text-[#ffcc00]' : 'text-gray-400 hover:bg-[#222] hover:text-gray-300'}`}
          >
            BirdEye
          </button>
          <button 
            onClick={() => setActiveTab('geckoterminal')}
            className={`px-3 py-1 text-sm rounded-tr rounded-br ${activeTab === 'geckoterminal' ? 'bg-[#222] text-[#ffcc00]' : 'text-gray-400 hover:bg-[#222] hover:text-gray-300'}`}
          >
            GeckoTerminal
          </button>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="overflow-hidden" style={{ height: `${chartHeight}px` }}>
        {activeTab === 'birdeye' && (
          <iframe
            src={`https://birdeye.so/tv-widget/${selectedToken.tokenAddress}?chain=solana`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowTransparency={true}
            title="BirdEye Token Price Chart"
            className="h-full w-full"
          />
        )}
        
        {activeTab === 'geckoterminal' && (
          <iframe
            src={`https://www.geckoterminal.com/solana/tokens/${selectedToken.tokenAddress}?embed=1&info=0&swaps=0&theme=dark`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="clipboard-write"
            title="GeckoTerminal Token Price Chart"
            className="h-full w-full"
          />
        )}
      </div>
      
      {/* Footer with token info */}
      <div className="border-t border-gray-800 px-3 py-2 text-xs text-gray-400 flex justify-between">
        <div>
          {selectedToken.tokenName} ({selectedToken.tokenSymbol?.toUpperCase()})
        </div>
        <div className="flex items-center">
          <span className="mr-1">Network:</span>
          <span className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[10px] text-[#ffcc00]">
            SOLANA
          </span>
        </div>
      </div>
    </motion.div>
  );
}