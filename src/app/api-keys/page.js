"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ApiKeysList } from './components/apiKeysList';
import { CreateKeyForm } from './components/createKeyForm';
import { EmbedLinkGenerator } from './components/embedLinkGenerator';
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

// Chinese characters for decoration
const chineseChars = ['密', '钥', '链', '接', '安', '全'];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('api-keys');
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 300], [0, -30]);
  const floatingY = useSpring(useTransform(scrollY, [0, 300], [0, -20]), {
    stiffness: 50,
  });

  useEffect(() => {
    // Simulate API call to fetch keys
    setTimeout(() => {
      setApiKeys([
        { id: 'key_1', name: 'Production API Key', key: 'dum_prod_kZL6f9xD7ywVtFpR', created: '2025-04-15', lastUsed: '2025-05-06', status: 'active' },
        { id: 'key_2', name: 'Development API Key', key: 'dum_dev_LmN4t8qWsXcVbZpY', created: '2025-04-10', lastUsed: '2025-05-01', status: 'active' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleCreateKey = (name) => {
    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      name,
      key: `dum_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: '',
      status: 'active'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeKey = (keyId) => {
    setApiKeys(apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, status: 'revoked' } 
        : key
    ));
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background pattern - Chinese style lattice */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[url('/chinese-pattern.png')] bg-repeat opacity-10"></div>
      </motion.div>

      {/* Floating Chinese characters */}
      {chineseChars.map((char, index) => (
        <motion.div
          key={index}
          className={`absolute text-6xl opacity-5 hidden md:block`}
          style={{ 
            top: `${10 + (index * 15) % 80}%`,
            left: `${(index * 13) % 90}%`,
            color: index % 2 ? '#ff3131' : '#ffcc00',
            y: floatingY,
            rotate: index % 3 ? 10 : -10
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [index % 3 ? 10 : -10, index % 3 ? -5 : 5, index % 3 ? 10 : -10],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 6 + index % 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {char}
        </motion.div>
      ))}
      
      {/* Dragon silhouette in background */}
      <motion.div
        className="absolute right-[-5%] top-[10%] w-[400px] h-[300px] opacity-[0.05] hidden lg:block"
        style={{
          backgroundImage: "url('https://pngimg.com/d/dragon_PNG986.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          y: useTransform(scrollY, [0, 300], [0, -40]),
        }}
      />

      {/* Navbar */}
      <Navbar isDashboard={true} />
      
      <div className="flex min-h-screen pt-16">
        {/* Sidebar */}
        <Sidebar activePage="/api-keys" />
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <motion.div
            className="mb-10 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative flourish */}
            <motion.div
              className="absolute left-[-15px] top-0 h-full w-1"
              style={{
                background: "linear-gradient(to bottom, #ff3131, transparent)",
                boxShadow: "0 0 8px rgba(255,49,49,0.5)",
              }}
              animate={{ height: ["0%", "100%"] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ffcc00] flex items-center">
              <motion.span
                className="mx-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3, type: "spring" }}>
                🔐
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                API Keys & Embed Links
              </motion.span>
            </h1>
            
            <p className="text-gray-400 ml-2">
              Manage your API keys and generate embed links for your AI agents
            </p>
            
            {/* Decorative line with animated dash */}
            <svg className="w-full h-1 mt-4" viewBox="0 0 400 2">
              <motion.path
                d="M0,1 L400,1"
                stroke="url(#redGoldGradient)"
                strokeWidth="1"
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
              />
              <defs>
                <linearGradient
                  id="redGoldGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0">
                  <stop offset="0%" stopColor="#ff3131" />
                  <stop offset="100%" stopColor="#ffcc00" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <div className="flex mb-6 border-b border-gray-800">
            <motion.button 
              onClick={() => setActiveTab('api-keys')}
              className={`py-3 px-6 font-medium relative ${activeTab === 'api-keys' 
                ? 'text-[#ffcc00]' 
                : 'text-gray-400 hover:text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              API Keys
              {activeTab === 'api-keys' && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#ff3131] to-[#ffcc00] w-full"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab('embed-links')}
              className={`py-3 px-6 font-medium relative ${activeTab === 'embed-links' 
                ? 'text-[#ffcc00]' 
                : 'text-gray-400 hover:text-white'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Embed Links
              {activeTab === 'embed-links' && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#ff3131] to-[#ffcc00] w-full"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'api-keys' ? (
              <motion.div
                key="api-keys"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CreateKeyForm onCreateKey={handleCreateKey} />
                <ApiKeysList 
                  apiKeys={apiKeys} 
                  onRevokeKey={handleRevokeKey} 
                  isLoading={isLoading} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="embed-links"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmbedLinkGenerator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}